import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(`${API_URL}/api/user-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  const token = data.data?.access_token
  const user = data.data?.user

  if (!token) {
    return NextResponse.json({ message: 'No token returned from server' }, { status: 500 })
  }

  const cookieOpts = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }

  const response = NextResponse.json({ success: true, user })
  response.cookies.set('auth-token', token, { ...cookieOpts, httpOnly: true })
  response.cookies.set('user-name', user?.name ?? '', { ...cookieOpts, httpOnly: false })
  return response
}
