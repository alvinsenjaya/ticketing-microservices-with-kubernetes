import { Subject } from './subject';

export interface ExpirationCompletedEvent {
  subject: Subject.ExpirationCompleted,
  data: {
    orderId: string
  }
}