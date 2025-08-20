import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ['/login']
  const isPublicPath = publicPaths.some(path => pathname === path)

  // Check if user has auth token
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '') ||
                // Also check localStorage token from headers (for client-side navigation)
                request.headers.get('x-auth-token')

  // If trying to access any path other than public paths without token, redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (token && pathname === '/login') {
    // Check if there's a redirect parameter
    const redirectPath = request.nextUrl.searchParams.get('redirect')
    const redirectUrl = redirectPath && redirectPath !== '/login' ? redirectPath : '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}