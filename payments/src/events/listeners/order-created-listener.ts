import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { OrderCreatedEvent } from '../../common/events/order-created-event';
import { QueueGroupName } from '../../common/events/queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subject.OrderCreated = Subject.OrderCreated;
  queueGroupName = QueueGroupName.PaymentsService;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId
    });

    await order.save();

    msg.ack();
  }
}
