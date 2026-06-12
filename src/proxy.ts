import { NextRequest, NextResponse } from 'next/server'

const publicPaths = ['/login', '/register']

export default function proxy(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  const path = req.nextUrl.pathname

  const isPublicPath = publicPaths.includes(path)

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/todos', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
