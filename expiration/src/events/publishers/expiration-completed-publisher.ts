import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { ExpirationCompletedEvent } from '../../common/events/expiration-completed-event';

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
  subject: Subject.ExpirationCompleted = Subject.ExpirationCompleted;
}