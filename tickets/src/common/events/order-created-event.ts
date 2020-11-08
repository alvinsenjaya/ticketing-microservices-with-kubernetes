import { Subject } from './subject';
import { OrderStatus } from '../types/order-status';

export interface OrderCreatedEvent {
  subject: Subject.OrderCreated;
  data: {
    id: string,
    __v: number,
    status: OrderStatus,
    userId: string,
    expiresAt: string,
    ticket: {
      id: string,
      price: number
    },
  }
}