import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
