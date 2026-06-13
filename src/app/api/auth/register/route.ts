import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const registerRes = await fetch(`${API_URL}/api/user-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  const registerData = await registerRes.json()

  if (!registerRes.ok) {
    return NextResponse.json(registerData, { status: registerRes.status })
  }

  // Register doesn't return a token — auto-login with same credentials
  const loginRes = await fetch(`${API_URL}/api/user-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  })

  const loginData = await loginRes.json()
  const token = loginData.data?.access_token

  if (!token) {
    return NextResponse.json({ message: 'Registered but login failed' }, { status: 500 })
  }

  const cookieOpts = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }

  const user = loginData.data?.user
  const response = NextResponse.json({ success: true, user })
  response.cookies.set('auth-token', token, { ...cookieOpts, httpOnly: true })
  response.cookies.set('user-name', user?.name ?? '', { ...cookieOpts, httpOnly: false })
  return response
}
