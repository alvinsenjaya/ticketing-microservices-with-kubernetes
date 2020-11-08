import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { TicketUpdatedEvent } from '../../common/events/ticket-updated-event';
import { Ticket } from '../../models/ticket';
import { QueueGroupName } from '../../common/events/queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subject.TicketUpdated = Subject.TicketUpdated;
  queueGroupName = QueueGroupName.OrdersService;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findOne({
      _id: data.id,
      __v: data.__v - 1
    });

    if(!ticket){
      throw new Error('Ticket not found');
    }

    ticket.set({
      title: data.title,
      price: data.price,
    });
    await ticket.save();

    msg.ack();
  }
}
