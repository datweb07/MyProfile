import type {Metadata} from 'next';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';
import {logoutAction} from '@/app/admin/actions';
import {getBlogAdmin} from '@/lib/admin-auth';

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

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin/posts">DAT / CMS</Link>
        <nav>
          <Link href="/admin/posts">All posts</Link>
          <Link href="/admin/posts/new">New post</Link>
          <Link href="/blog" target="_blank">View blog ↗</Link>
          <Link href="/en">Portfolio</Link>
        </nav>
        <div className="admin-account">
          <small>{user.email}</small>
          <form action={logoutAction}><button type="submit">Sign out</button></form>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
