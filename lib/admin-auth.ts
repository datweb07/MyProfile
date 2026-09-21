import 'server-only';

import {createClient} from '@/lib/supabase/server';

export async function getBlogAdmin() {
  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) return null;
  const {data: admin, error} = await supabase
    .from('blog_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !admin) return null;
  return user;
}
