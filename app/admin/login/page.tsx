import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminLoginPage({searchParams}: {searchParams: Promise<{next?: string}>}) {
  const {next} = await searchParams;
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <span className="admin-eyebrow">Private area</span>
        <h1>Blog administration</h1>
        <p>Sign in with the single admin account configured in Supabase Auth.</p>
        <AdminLoginForm nextPath={next} />
        <a href="/en">← Back to portfolio</a>
      </section>
    </main>
  );
}
