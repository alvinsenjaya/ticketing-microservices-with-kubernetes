import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { ExpirationCompletedEvent } from '../../common/events/expiration-completed-event';
import { QueueGroupName } from '../../common/events/queue-group-name';
import { Order, OrderStatus } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent> {
  subject: Subject.ExpirationCompleted = Subject.ExpirationCompleted;
  queueGroupName = QueueGroupName.OrdersService;

  async onMessage(data: ExpirationCompletedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if(!order){
      throw new Error('Order not found')
    };

    if(order.status === OrderStatus.Completed || order.status === OrderStatus.Cancelled){
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled
    })

    await order.save();
    
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      __v: order.__v!,
      ticket: {
        id: order.ticket.id
      }
    });

    msg.ack();
  }
}
