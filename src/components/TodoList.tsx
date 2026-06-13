'use client'
import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTodos, addTodo, updateTodo, deleteTodo } from '@/store/todosSlice'
import { RootState } from '@/store'
import { Todo } from '@/types'
import { TodoCard } from './TodoCard'
import { TodoForm } from './TodoForm'
import { SearchBar } from './SearchBar'
import { FilterBar } from './FilterBar'
import { ConfirmModal } from './ConfirmModal'

type SortOption = 'today' | 'due_asc' | 'due_desc' | 'priority_desc' | 'priority_asc' | 'newest' | 'oldest'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'due_asc', label: 'Due ↑' },
  { value: 'due_desc', label: 'Due ↓' },
  { value: 'priority_desc', label: 'High → Low' },
  { value: 'priority_asc', label: 'Low → High' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }

interface Props { initialTodos: Todo[] }

export function TodoList({ initialTodos }: Props) {
  const dispatch = useDispatch()
  const { todos, filter, search } = useSelector((s: RootState) => s.todos)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('today')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [collapseCompleted, setCollapse] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)

  useEffect(() => { dispatch(setTodos(initialTodos)) }, [dispatch, initialTodos])

  // ── Keyboard shortcut: N → open new task modal ──
  const openCreate = useCallback(() => {
    setEditingTodo(null)
    setIsModalOpen(true)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === 'n' &&
        !e.metaKey && !e.ctrlKey && !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) openCreate()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openCreate])

  function openEdit(todo: Todo) { setEditingTodo(todo); setIsModalOpen(true) }

  function handleSave(saved: Todo) {
    if (editingTodo) dispatch(updateTodo(saved))
    else dispatch(addTodo(saved))
    setIsModalOpen(false)
  }

  // ── Selection ──
  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(visible.map((t) => t.id)))
  }

  function clearSelection() { setSelectedIds(new Set()) }

  // ── Bulk actions ──
  async function bulkComplete() {
    setBulkLoading(true)
    const pending = [...selectedIds].filter(
      (id) => todos.find((t) => t.id === id)?.status === 'pending'
    )
    await Promise.all(
      pending.map(async (id) => {
        const res = await fetch(`/api/todos/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'complete' }),
        })
        if (res.ok) {
          const data = await res.json()
          dispatch(updateTodo(data.data ?? data))
        }
      })
    )
    clearSelection()
    setBulkLoading(false)
  }

  async function bulkDelete() {
    setBulkLoading(true)
    await Promise.all(
      [...selectedIds].map(async (id) => {
        const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
        if (res.ok || res.status === 204) dispatch(deleteTodo(id))
      })
    )
    clearSelection()
    setBulkLoading(false)
    setShowBulkConfirm(false)
  }

  const todayStr = new Date().toDateString()

  // ── Filter + sort ──
  const matchesSearch = (t: Todo) =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description ?? '').toLowerCase().includes(search.toLowerCase())

  let visible = sortBy === 'today'
    ? todos.filter((t) => !!t.due_date && new Date(t.due_date).toDateString() === todayStr && matchesSearch(t))
    : todos.filter((t) => {
      const matchesFilter = filter === 'all' || t.status === filter
      const notCollapsed = !collapseCompleted || t.status !== 'completed'
      return matchesFilter && matchesSearch(t) && notCollapsed
    })

  visible = [...visible].sort((a, b) => {
    if (sortBy === 'today' || sortBy === 'priority_desc') {
      const av = priorityOrder[a.priority ?? ''] ?? 0
      const bv = priorityOrder[b.priority ?? ''] ?? 0
      return bv - av // high → low
    }
    if (sortBy === 'priority_asc') {
      const av = priorityOrder[a.priority ?? ''] ?? 0
      const bv = priorityOrder[b.priority ?? ''] ?? 0
      return av - bv
    }
    if (sortBy === 'due_asc' || sortBy === 'due_desc') {
      const av = a.due_date ? new Date(a.due_date).getTime() : Infinity
      const bv = b.due_date ? new Date(b.due_date).getTime() : Infinity
      return sortBy === 'due_asc' ? av - bv : bv - av
    }
    const av = new Date(a.created_at).getTime()
    const bv = new Date(b.created_at).getTime()
    return sortBy === 'newest' ? bv - av : av - bv
  })

  const pendingCount = todos.filter((t) => t.status === 'pending').length
  const completedCount = todos.filter((t) => t.status === 'completed').length
  const todayTodos = todos
    .filter((t) => !!t.due_date && new Date(t.due_date).toDateString() === todayStr)
    .sort((a, b) => (a.status === 'completed' ? 1 : -1)) // pending first
  const todayCompleted = todayTodos.filter((t) => t.status === 'completed').length
  const todayProgressPct = todayTodos.length
    ? Math.round((todayCompleted / todayTodos.length) * 100)
    : 0

  // ── Smart empty state messages ──
  const emptyTitle = search
    ? 'No tasks match your search'
    : filter === 'pending'
      ? "You're all caught up!"
      : filter === 'completed'
        ? 'No completed tasks yet'
        : 'No tasks yet'

  const emptySubtitle = search
    ? 'Try different keywords'
    : filter === 'pending'
      ? 'All tasks are done great work!'
      : filter === 'completed'
        ? 'Complete a task to see it here'
        : 'Press N or click "New Task" to get started'

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your daily todos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-blue-700 active:scale-95 transition-all text-sm shadow-sm"
          title="New task (N)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Total', value: todos.length, color: 'from-slate-600 to-slate-700', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { label: 'Pending', value: pendingCount, color: 'from-amber-500 to-orange-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Completed', value: completedCount, color: 'from-emerald-500 to-teal-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <div className={`w-8 h-8 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Today's progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Today&apos;s tasks</span>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          {todayTodos.length > 0 && (
            <span className={`text-xs font-bold ${todayProgressPct === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {todayProgressPct}%
            </span>
          )}
        </div>

        {todayTodos.length === 0 ? (
          <p className="text-xs text-gray-400 py-1">No tasks due today</p>
        ) : (
          <>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${todayProgressPct === 100
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                  }`}
                style={{ width: `${todayProgressPct}%` }}
              />
            </div>
            {/* Today's task list */}
            <div className="space-y-1.5">
              {todayTodos.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300'
                    }`}>
                    {t.status === 'completed' && (
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs flex-1 truncate ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'
                    }`}>
                    {t.title}
                  </span>
                  {t.priority && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${t.priority === 'high' ? 'bg-red-100 text-red-600'
                      : t.priority === 'medium' ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                      }`}>
                      {t.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {todayCompleted} of {todayTodos.length} done today
              {todayProgressPct === 100 && ' Great work!'}
            </p>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4 space-y-3">
        {/* Row 1: filter + collapse + search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <FilterBar />
            <button
              onClick={() => setCollapse((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${collapseCompleted
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                  collapseCompleted
                    ? 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
                    : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                } />
              </svg>
              {collapseCompleted ? 'Show completed' : 'Hide completed'}
            </button>
          </div>
          <SearchBar />
        </div>

        {/* Row 2: sort pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <span className="text-xs font-medium text-gray-400 flex-shrink-0">Sort:</span>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${sortBy === opt.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 bg-white'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="bg-indigo-600 text-white rounded-2xl px-5 py-3 mb-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <button onClick={selectAll} className="text-xs text-indigo-200 hover:text-white underline">
              Select all ({visible.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={bulkComplete}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Complete all
            </button>
            <button
              onClick={() => setShowBulkConfirm(true)}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button onClick={clearSelection} className="text-indigo-200 hover:text-white text-xs ml-1">
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${filter === 'pending' && !search ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
            <svg className={`w-8 h-8 ${filter === 'pending' && !search ? 'text-emerald-400' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={
                filter === 'pending' && !search
                  ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  : 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              } />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 text-lg">{emptyTitle}</p>
          <p className="text-gray-400 text-sm mt-1">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={openEdit}
              selected={selectedIds.has(todo.id)}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <TodoForm
          todo={editingTodo}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {showBulkConfirm && (
        <ConfirmModal
          title={`Delete ${selectedIds.size} task${selectedIds.size > 1 ? 's' : ''}?`}
          message="These tasks will be permanently deleted and cannot be recovered."
          confirmLabel={`Delete ${selectedIds.size} task${selectedIds.size > 1 ? 's' : ''}`}
          loading={bulkLoading}
          onConfirm={bulkDelete}
          onCancel={() => setShowBulkConfirm(false)}
        />
      )}
    </div>
  )
}
