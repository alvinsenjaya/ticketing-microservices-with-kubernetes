import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { OrderCreatedEvent } from '../../common/events/order-created-event';
import { QueueGroupName } from '../../common/events/queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subject.OrderCreated = Subject.OrderCreated;
  queueGroupName = QueueGroupName.ExpirationService;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add({
      orderId: data.id
    }, {
      delay: delay
    });

    msg.ack();
  }
}
