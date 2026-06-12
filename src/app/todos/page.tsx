import { getAuthHeaders } from '@/lib/session'
import { TodoList } from '@/components/TodoList'
import { Todo } from '@/types'

const API_URL = process.env.API_URL || 'http://localhost:8000'

async function fetchTodos(): Promise<Todo[]> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/todos`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : data.data ?? []
}

export default async function TodosPage() {
  const todos = await fetchTodos()
  return <TodoList initialTodos={todos} />
}
