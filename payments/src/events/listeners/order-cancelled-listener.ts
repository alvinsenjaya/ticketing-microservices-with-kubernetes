import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { OrderCancelledEvent } from '../../common/events/order-cancelled-event';
import { QueueGroupName } from '../../common/events/queue-group-name';
import { Order } from '../../models/order';
import { OrderStatus } from '../../common/types/order-status';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subject.OrderCancelled = Subject.OrderCancelled;
  queueGroupName = QueueGroupName.PaymentsService;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      __v: data.__v - 1
    });

    if(!order){
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled
    });

    await order.save();

    msg.ack();
  }
}
