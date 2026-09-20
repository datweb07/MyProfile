import {NextRequest, NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

type DiaryRequest = {
  action?: 'unlock' | 'load' | 'save';
  password?: string;
  date?: string;
  title?: string;
  content?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as DiaryRequest;
  if (!body.action || !body.password) {
    return NextResponse.json({error: 'Invalid request.'}, {status: 400});
  }

  const supabase = await createServerSupabaseClient();

  if (body.action === 'unlock') {
    const {data, error} = await supabase.rpc('secret_diary_password_ok', {
      input_password: body.password
    });
    return error
      ? NextResponse.json({error: error.message}, {status: 500})
      : NextResponse.json({ok: Boolean(data)});
  }

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({error: 'Invalid date.'}, {status: 400});
  }

  if (body.action === 'load') {
    const {data, error} = await supabase.rpc('get_secret_diary_entry', {
      input_password: body.password,
      target_date: body.date
    });
    return error
      ? NextResponse.json({error: error.message}, {status: 500})
      : NextResponse.json({entry: Array.isArray(data) ? data[0] : data});
  }

  if (body.action === 'save') {
    const {error} = await supabase.rpc('upsert_secret_diary_entry', {
      input_password: body.password,
      target_date: body.date,
      entry_title: body.title ?? '',
      entry_content: body.content ?? ''
    });
    return error
      ? NextResponse.json({error: error.message}, {status: 500})
      : NextResponse.json({ok: true});
  }

  return NextResponse.json({error: 'Unknown action.'}, {status: 400});
}
