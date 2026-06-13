export interface Todo {
  id: number
  title: string
  description: string | null
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high' | null
  due_date: string | null
  user_id: number
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
