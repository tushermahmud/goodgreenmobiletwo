import { createReducer, on } from '@ngrx/store';
import { Todo } from 'src/app/models/todo.model';
import {
  addTodo,
  removeTodo,
  loadTodos,
  loadTodosSuccess,
  loadTodosFailure,
} from './todo.actions';

export interface TodoState {
  todos: Todo[];
  error: string;
  status: 'pending' | 'loading' | 'error' | 'success';
}

export const initialState: TodoState = {
  todos: [],
  error: null,
  status: 'pending',
};

export const todoReducer = createReducer(
  // Supply the initial state
  initialState,
  // Add the new todo to the todos array
  on(addTodo, (state, { content }) => ({
    ...state,
    todos: [...state.todos, { id: Date.now().toString(), content }],
  })),
  // Remove the todo from the todos array
  on(removeTodo, (state, { id }) => ({
    ...state,
    todos: state.todos.filter((todo) => todo.id !== id),
  })),
  // Trigger loading the todos
  on(loadTodos, (state) => ({ ...state, status: 'loading' as 'loading' })),
  // Handle successfully loaded todos
  on(loadTodosSuccess, (state, { todos }) => ({
    ...state,
    todos,
    error: null,
    status: 'success' as 'success',
  })),
  // Handle todos load failure
  on(loadTodosFailure, (state, { error }) => ({
    ...state,
    error,
    status: 'error' as 'error',
  }))
);
