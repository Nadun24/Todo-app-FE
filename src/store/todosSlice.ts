import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Todo } from '@/types'

export type FilterStatus = 'all' | 'pending' | 'completed'

interface TodosState {
  todos: Todo[]
  filter: FilterStatus
  search: string
}

const initialState: TodosState = {
  todos: [],
  filter: 'all',
  search: '',
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setTodos(state, action: PayloadAction<Todo[]>) {
      state.todos = action.payload
    },
    addTodo(state, action: PayloadAction<Todo>) {
      state.todos.unshift(action.payload)
    },
    updateTodo(state, action: PayloadAction<Todo>) {
      const idx = state.todos.findIndex((t) => t.id === action.payload.id)
      if (idx !== -1) state.todos[idx] = action.payload
    },
    deleteTodo(state, action: PayloadAction<number>) {
      state.todos = state.todos.filter((t) => t.id !== action.payload)
    },
    setFilter(state, action: PayloadAction<FilterStatus>) {
      state.filter = action.payload
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
  },
})

export const { setTodos, addTodo, updateTodo, deleteTodo, setFilter, setSearch } =
  todosSlice.actions

export default todosSlice.reducer
