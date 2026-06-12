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

  const response = NextResponse.json({ success: true, user: loginData.data?.user })
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
