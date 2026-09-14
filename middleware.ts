import { type NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'

interface SessionData {
  userId: string
  isLoggedIn: boolean
}

const protectedPaths = ['/dashboard', '/cabanas', '/huespedes', '/reservaciones', '/pos', '/productos', '/gastos', '/proveedores', '/control-diario', '/registros', '/reportes', '/estadisticas', '/configuracion']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
    cookieName: 'cenote-session',
  })

  const isLoggedIn = session.isLoggedIn === true

  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
