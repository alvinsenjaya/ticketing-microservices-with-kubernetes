import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { TicketDeletedEvent } from '../../common/events/ticket-deleted-event';
import { Ticket } from '../../models/ticket';
import { QueueGroupName } from '../../common/events/queue-group-name';

export class TicketDeletedListener extends Listener<TicketDeletedEvent> {
  subject: Subject.TicketDeleted = Subject.TicketDeleted;
  queueGroupName = QueueGroupName.OrdersService;

  async onMessage(data: TicketDeletedEvent['data'], msg: Message) {
    const ticket = await Ticket.findOne({
      _id: data.id,
      __v: data.__v - 1
    });

    if(!ticket){
      throw new Error('Ticket not found');
    }

    await ticket.deleteOne();

    msg.ack();
  }
}
