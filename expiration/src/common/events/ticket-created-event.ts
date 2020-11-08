import { Subject } from './subject';

export interface TicketCreatedEvent {
  subject: Subject.TicketCreated;
  data: {
    id: string,
    __v: number,
    title: string,
    price: number,
    userId: string
  }
}