'use client'
import { Todo } from '@/types'
import { useDispatch } from 'react-redux'
import { updateTodo, deleteTodo } from '@/store/todosSlice'
import { useState } from 'react'

const priorityConfig: Record<string, { badge: string; border: string }> = {
  high:   { badge: 'bg-red-100 text-red-700',    border: 'border-l-red-400' },
  medium: { badge: 'bg-amber-100 text-amber-700', border: 'border-l-amber-400' },
  low:    { badge: 'bg-emerald-100 text-emerald-700', border: 'border-l-emerald-400' },
}

interface Props {
  todo: Todo
  onEdit: (todo: Todo) => void
}

export function TodoCard({ todo, onEdit }: Props) {
  const dispatch = useDispatch()
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function toggleStatus() {
    setToggling(true)
    const action = todo.status === 'pending' ? 'complete' : 'pending'
    try {
      const res = await fetch(`/api/todos/${todo.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const data = await res.json()
        dispatch(updateTodo(data.data ?? data))
      }
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
      if (res.ok || res.status === 204) {
        dispatch(deleteTodo(todo.id))
      }
    } finally {
      setDeleting(false)
    }
  }

  const isCompleted = todo.status === 'completed'
  const priority = todo.priority ?? ''
  const borderColor = priorityConfig[priority]?.border ?? 'border-l-gray-200'

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${borderColor} shadow-sm transition-all hover:shadow-md ${
        isCompleted ? 'opacity-60' : ''
      } p-5`}
    >
      <div className="flex items-start gap-4">
        {/* Status toggle */}
        <button
          onClick={toggleStatus}
          disabled={toggling}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold text-gray-900 leading-snug ${isCompleted ? 'line-through text-gray-400' : ''}`}>
              {todo.title}
            </h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${
              isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {todo.status}
            </span>
          </div>

          {todo.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{todo.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {todo.priority && (
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${priorityConfig[todo.priority]?.badge ?? 'bg-gray-100 text-gray-600'}`}>
                {todo.priority}
              </span>
            )}
            {todo.due_date && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(todo.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
