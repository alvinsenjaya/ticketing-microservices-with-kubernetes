import { Subject } from './subject';
import { OrderStatus } from '../types/order-status';

export interface OrderCancelledEvent {
  subject: Subject.OrderCancelled;
  data: {
    id: string,
    __v: number,
    ticket: {
      id: string,
    },
  }
}