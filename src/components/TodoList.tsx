'use client'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTodos, addTodo, updateTodo } from '@/store/todosSlice'
import { RootState } from '@/store'
import { Todo } from '@/types'
import { TodoCard } from './TodoCard'
import { TodoForm } from './TodoForm'
import { SearchBar } from './SearchBar'
import { FilterBar } from './FilterBar'

interface Props {
  initialTodos: Todo[]
}

export function TodoList({ initialTodos }: Props) {
  const dispatch = useDispatch()
  const { todos, filter, search } = useSelector((s: RootState) => s.todos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  useEffect(() => {
    dispatch(setTodos(initialTodos))
  }, [dispatch, initialTodos])

  function openCreate() {
    setEditingTodo(null)
    setIsModalOpen(true)
  }

  function openEdit(todo: Todo) {
    setEditingTodo(todo)
    setIsModalOpen(true)
  }

  function handleSave(saved: Todo) {
    if (editingTodo) {
      dispatch(updateTodo(saved))
    } else {
      dispatch(addTodo(saved))
    }
    setIsModalOpen(false)
  }

  const visible = todos.filter((t) => {
    const matchesFilter = filter === 'all' || t.status === filter
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const pendingCount = todos.filter((t) => t.status === 'pending').length
  const completedCount = todos.filter((t) => t.status === 'completed').length

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your daily todos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-blue-700 active:scale-95 transition-all text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
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

      {/* Filter + search toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <FilterBar />
        <SearchBar />
      </div>

      {/* Todo list */}
      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 text-lg">
            {search || filter !== 'all' ? 'No matching tasks' : 'No tasks yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Hit "New Task" to add your first one'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onEdit={openEdit} />
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
    </div>
  )
}
