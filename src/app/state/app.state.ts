import { TodoState } from './todos/todo.reducer';
import { OrderState } from './order/order.reducers';
import { AuthState } from './auth/auth.state';

export interface AppState {
  todos: TodoState;
  auth: AuthState;
  order: OrderState;
}
