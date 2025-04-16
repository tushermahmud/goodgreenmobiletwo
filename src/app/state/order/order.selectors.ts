import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { OrderState } from './order.reducers';

export const selectOrder = (state: AppState) => state.order;

export const selectSelectedService = createSelector(
  selectOrder,
  (state: OrderState) => state.service
);

export const getOrderData = createSelector(
  selectOrder,
  (state: OrderState) => state
);
