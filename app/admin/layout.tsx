import type {Metadata} from 'next';
import {createClient} from '@/lib/supabase/server';
import {logoutAction} from '@/app/admin/actions';
import {getBlogAdmin} from '@/lib/admin-auth';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Blog Admin — Dat Truong',
  robots: {index: false, follow: false}
};

export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();

  if (!user) return <>{children}</>;
  const admin = await getBlogAdmin();
  if (!admin) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-card">
          <span className="admin-eyebrow">Access denied</span>
          <h1>Not a blog administrator</h1>
          <p>Add this account UUID to <code>public.blog_admins</code>, or sign out and use the configured admin account.</p>
          <form action={logoutAction}><button className="blog-button blog-button-primary" type="submit">Sign out</button></form>
        </section>
      </main>
    );
  }

  return <AdminShell email={user.email ?? 'Admin'}>{children}</AdminShell>;
}
