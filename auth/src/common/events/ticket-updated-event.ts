import { Subject } from './subject';

export interface TicketUpdatedEvent {
  subject: Subject.TicketUpdated;
  data: {
    id: string,
    __v: number,
    title: string,
    price: number,
    userId: string,
    orderId?: string
  }
}