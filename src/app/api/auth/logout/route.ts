import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (token) {
    await fetch(`${API_URL}/api/logout-user`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    }).catch(() => {})
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  return response
}
