import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action } = await request.json()

  if (action !== 'complete' && action !== 'pending') {
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
  }

  const res = await fetch(`${API_URL}/api/todos/${id}/${action}`, {
    method: 'PATCH',
    headers: authHeaders(token),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
