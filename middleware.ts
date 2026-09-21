import {NextResponse, type NextRequest} from 'next/server';
import {refreshSession} from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const {response, user} = await refreshSession(request);
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (!user && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/posts', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*']
};
