import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { TicketDeletedEvent } from '../../common/events/ticket-deleted-event';

export class TicketDeletedPublisher extends Publisher<TicketDeletedEvent> {
  subject: Subject.TicketDeleted = Subject.TicketDeleted;
}