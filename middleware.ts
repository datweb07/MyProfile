export default function middleware(request: Request) {
  return Response.redirect(new URL('/en', request.url), 307);
}

export const config = {
  matcher: ['/']
};
