import {createHash} from 'node:crypto';
import {NextResponse, type NextRequest} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {z} from 'zod';

export const runtime = 'nodejs';

const EngagementSchema = z.discriminatedUnion('action', [
  z.object({action: z.literal('view'), postId: z.string().uuid(), clientToken: z.string().uuid()}),
  z.object({action: z.literal('like-post'), postId: z.string().uuid(), clientToken: z.string().uuid()}),
  z.object({action: z.literal('comment'), postId: z.string().uuid(), name: z.string().trim().min(1).max(80), content: z.string().trim().min(1).max(2000), clientToken: z.string().uuid()}),
  z.object({action: z.literal('like-comment'), commentId: z.string().uuid(), clientToken: z.string().uuid()})
]);

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host === forwardedHost;
  } catch {
    return false;
  }
}

function serverFingerprint(request: NextRequest, clientToken: string) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = request.headers.get('x-real-ip') ?? forwardedFor ?? 'unknown';
  const secret = process.env.ENGAGEMENT_FINGERPRINT_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'local-development';
  const hex = createHash('sha256').update(`${ip}:${clientToken}:${secret}`).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({error: 'Invalid request origin.'}, {status: 403});
  if (Number(request.headers.get('content-length') ?? 0) > 10_000) {
    return NextResponse.json({error: 'Request body is too large.'}, {status: 413});
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body.'}, {status: 400});
  }

  const parsed = EngagementSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({error: 'Invalid engagement data.'}, {status: 400});

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) {
    return NextResponse.json({error: 'Engagement service is not configured.'}, {status: 503});
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: {persistSession: false, autoRefreshToken: false}
  });
  const clientToken = serverFingerprint(request, parsed.data.clientToken);

  let result: {data: unknown; error: {code?: string; message: string} | null};
  if (parsed.data.action === 'view') {
    result = await supabase.rpc('increment_post_views', {p_post_id: parsed.data.postId, p_client_token: clientToken});
    if (result.error?.code === 'PGRST202') result = await supabase.rpc('increment_post_views', {p_post_id: parsed.data.postId});
  } else if (parsed.data.action === 'like-post') {
    result = await supabase.rpc('increment_post_likes', {p_post_id: parsed.data.postId, p_client_token: clientToken});
    if (result.error?.code === 'PGRST202') result = await supabase.rpc('increment_post_likes', {p_post_id: parsed.data.postId});
  } else if (parsed.data.action === 'comment') {
    result = await supabase.rpc('create_post_comment', {p_post_id: parsed.data.postId, p_commenter_name: parsed.data.name, p_comment_content: parsed.data.content, p_client_token: clientToken});
    if (result.error?.code === 'PGRST202') result = await supabase.rpc('create_post_comment', {p_post_id: parsed.data.postId, p_commenter_name: parsed.data.name, p_comment_content: parsed.data.content});
  } else {
    result = await supabase.rpc('increment_comment_likes', {p_comment_id: parsed.data.commentId, p_client_token: clientToken});
    if (result.error?.code === 'PGRST202') result = await supabase.rpc('increment_comment_likes', {p_comment_id: parsed.data.commentId});
  }

  if (result.error) {
    const rateLimited = result.error.message.includes('Rate limit exceeded');
    return NextResponse.json({error: rateLimited ? result.error.message : 'Could not update engagement.'}, {status: rateLimited ? 429 : 500});
  }

  return NextResponse.json({data: result.data}, {headers: {'Cache-Control': 'no-store'}});
}
