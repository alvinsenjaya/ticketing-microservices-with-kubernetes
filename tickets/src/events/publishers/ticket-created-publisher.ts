import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { TicketCreatedEvent } from '../../common/events/ticket-created-event';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subject.TicketCreated = Subject.TicketCreated;
}