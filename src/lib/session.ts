import 'server-only'
import { cookies } from 'next/headers'

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const store = await cookies()
  const token = store.get('auth-token')?.value
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

export async function getToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get('auth-token')?.value
}
