'use server';

import {redirect} from 'next/navigation';
import {LoginSchema} from '@/lib/blog-schema';
import {createClient} from '@/lib/supabase/server';

export type LoginState = {error: string};

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!parsed.success) {
    return {error: parsed.error.issues[0]?.message ?? 'Invalid login details.'};
  }

  const supabase = await createClient();
  const {data, error} = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return {error: 'Email or password is incorrect.'};

  const {data: admin} = await supabase
    .from('blog_admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return {error: 'This account is not authorized to manage the blog.'};
  }

  const nextPath = String(formData.get('next') || '/admin/posts');
  redirect(nextPath.startsWith('/admin/') ? nextPath : '/admin/posts');
}
