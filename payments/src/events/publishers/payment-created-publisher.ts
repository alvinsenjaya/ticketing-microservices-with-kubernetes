import { Publisher } from '../../common/events/publisher';
import { Subject } from '../../common/events/subject';
import { PaymentCreatedEvent } from '../../common/events/payment-created-event';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subject.PaymentCreated = Subject.PaymentCreated;
}