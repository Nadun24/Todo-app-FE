'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setSearch, setTodos } from '@/store/todosSlice'
import { RootState } from '@/store'
import { useEffect, useRef } from 'react'
import { Todo } from '@/types'

export function SearchBar() {
  const dispatch = useDispatch()
  const search = useSelector((s: RootState) => s.todos.search)
  const filter = useSelector((s: RootState) => s.todos.filter)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filter !== 'all') params.set('status', filter)

      const res = await fetch(`/api/todos?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const todos: Todo[] = Array.isArray(data) ? data : data.data ?? []
        dispatch(setTodos(todos))
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, filter, dispatch])

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        type="text"
        value={search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        placeholder="Search task"
        className="pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-gray-900 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
      />
    </div>
  )
}
