import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { OrderCancelledEvent } from '../../common/events/order-cancelled-event';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subject.OrderCancelled = Subject.OrderCancelled;
}