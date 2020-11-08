import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { OrderCreatedEvent } from '../../common/events/order-created-event';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subject.OrderCreated = Subject.OrderCreated;
}