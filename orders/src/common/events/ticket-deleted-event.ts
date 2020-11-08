import { Subject } from './subject';

export interface TicketDeletedEvent {
  subject: Subject.TicketDeleted;
  data: {
    id: string,
    __v: number,
    title: string,
    price: number,
    userId: string
  }
}