import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { OrderDeletedEvent } from '../../common/events/order-deleted-event';

export class OrderDeletedPublisher extends Publisher<OrderDeletedEvent> {
  subject: Subject.OrderDeleted = Subject.OrderDeleted;
}