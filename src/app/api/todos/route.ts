import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.toString()

  const res = await fetch(`${API_URL}/api/todos${query ? `?${query}` : ''}`, {
    headers: authHeaders(token),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const res = await fetch(`${API_URL}/api/store-todo`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
