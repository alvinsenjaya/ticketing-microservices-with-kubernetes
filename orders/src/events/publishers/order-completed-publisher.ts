import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { OrderCompletedEvent } from '../../common/events/order-completed-event';

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent> {
  subject: Subject.OrderCompleted = Subject.OrderCompleted;
}