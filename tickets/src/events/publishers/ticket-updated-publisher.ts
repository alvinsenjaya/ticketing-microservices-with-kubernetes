import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { TicketUpdatedEvent } from '../../common/events/ticket-updated-event';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subject.TicketUpdated = Subject.TicketUpdated;
}