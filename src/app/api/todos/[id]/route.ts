import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const res = await fetch(`${API_URL}/api/todos/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const res = await fetch(`${API_URL}/api/todos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 })
  }
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
