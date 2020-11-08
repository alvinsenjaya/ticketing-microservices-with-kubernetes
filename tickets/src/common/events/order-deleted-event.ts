import { Subject } from './subject';
import { OrderStatus } from '../types/order-status';

export interface OrderDeletedEvent {
  subject: Subject.OrderDeleted;
  data: {
    id: string,
    __v: number,
    ticket: {
      id: string,
    },
  }
}