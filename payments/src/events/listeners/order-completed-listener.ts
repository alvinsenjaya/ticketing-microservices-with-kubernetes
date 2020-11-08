import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { OrderCompletedEvent } from '../../common/events/order-completed-event';
import { QueueGroupName } from '../../common/events/queue-group-name';
import { Order } from '../../models/order';
import { OrderStatus } from '../../common/types/order-status';

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
  subject: Subject.OrderCompleted = Subject.OrderCompleted;
  queueGroupName = QueueGroupName.PaymentsService;

  async onMessage(data: OrderCompletedEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      __v: data.__v - 1
    });

    if(!order){
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Completed
    });

    await order.save();

    msg.ack();
  }
}
