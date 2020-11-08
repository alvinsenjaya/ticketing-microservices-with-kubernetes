import { Subject } from './subject';
import { OrderStatus } from '../types/order-status';

export interface OrderCompletedEvent {
  subject: Subject.OrderCompleted;
  data: {
    id: string,
    __v: number,
    ticket: {
      id: string,
    },
  }
}