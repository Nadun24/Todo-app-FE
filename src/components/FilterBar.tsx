'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter, FilterStatus } from '@/store/todosSlice'
import { RootState } from '@/store'

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
]

export function FilterBar() {
  const dispatch = useDispatch()
  const active = useSelector((s: RootState) => s.todos.filter)

  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => dispatch(setFilter(f.value))}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            active === f.value
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
