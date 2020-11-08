import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { PaymentCreatedEvent } from '../../common/events/payment-created-event';
import { QueueGroupName } from '../../common/events/queue-group-name';
import { Order, OrderStatus } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';
import { OrderCompletedPublisher } from '../publishers/order-completed-publisher';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subject.PaymentCreated = Subject.PaymentCreated;
  queueGroupName = QueueGroupName.OrdersService;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if(!order){
      throw new Error('Order not found')
    };

    order.set({
      status: OrderStatus.Completed
    })

    await order.save();

    new OrderCompletedPublisher(natsWrapper.client).publish({
      id: order.id,
      __v: order.__v!,
      ticket: {
        id: order.ticket.id
      }
    });

    msg.ack();
  }
}
