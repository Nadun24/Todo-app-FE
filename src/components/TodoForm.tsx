'use client'
import { useState, useEffect } from 'react'
import { Todo } from '@/types'

interface Props {
  todo?: Todo | null
  onClose: () => void
  onSave: (todo: Todo) => void
}

const emptyForm = { title: '', description: '', priority: '', due_date: '' }

const priorities = [
  { value: '',       label: 'None',   active: 'bg-gray-100 text-gray-700 border-gray-300',   idle: 'border-gray-200 text-gray-400 hover:border-gray-300' },
  { value: 'low',    label: 'Low',    active: 'bg-emerald-100 text-emerald-700 border-emerald-400', idle: 'border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600' },
  { value: 'medium', label: 'Medium', active: 'bg-amber-100 text-amber-700 border-amber-400',  idle: 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-600' },
  { value: 'high',   label: 'High',   active: 'bg-red-100 text-red-700 border-red-400',        idle: 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600' },
]

export function TodoForm({ todo, onClose, onSave }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (todo) {
      setForm({
        title: todo.title,
        description: todo.description ?? '',
        priority: todo.priority ?? '',
        // slice(0,10) converts "2026-06-13T00:00:00.000000Z" → "2026-06-13" for <input type="date">
        due_date: todo.due_date ? todo.due_date.slice(0, 10) : '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [todo])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body = {
      title: form.title,
      description: form.description || null,
      priority: form.priority || null,
      due_date: form.due_date || null,
    }

    try {
      const res = todo
        ? await fetch(`/api/todos/${todo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to save task')
        return
      }

      onSave(data.data ?? data)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-auth">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{todo ? 'Edit Task' : 'New Task'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {todo ? 'Update the task details below' : 'Fill in the details for your new task'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Title */}
          <div className="relative">
            <input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-xl px-4 pt-5 pb-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <label htmlFor="title" className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all pointer-events-none peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-500">
              Task title <span className="text-red-400">*</span>
            </label>
          </div>

          {/* Description */}
          <div className="relative">
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder=" "
              className="peer w-full border border-gray-300 rounded-xl px-4 pt-5 pb-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
            <label htmlFor="description" className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all pointer-events-none peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-500">
              Description <span className="text-gray-300 text-xs">(optional)</span>
            </label>
          </div>

          {/* Priority — colored label buttons */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 ml-1">Priority</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p.value })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.priority === p.value ? p.active : p.idle
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2.5 rounded-xl hover:from-indigo-700 hover:to-blue-700 active:scale-95 transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : todo ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
