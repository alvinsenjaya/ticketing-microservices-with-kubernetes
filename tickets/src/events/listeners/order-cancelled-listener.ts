import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { OrderCancelledEvent } from '../../common/events/order-cancelled-event';
import { Ticket } from '../../models/ticket';
import { QueueGroupName } from '../../common/events/queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subject.OrderCancelled = Subject.OrderCancelled;
  queueGroupName = QueueGroupName.TicketsService;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if(!ticket){
      throw new Error('Ticket not found');
    }

    ticket.set({
      orderId: undefined
    })

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      __v: ticket.__v!,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId
    });

    msg.ack();
  }
}
