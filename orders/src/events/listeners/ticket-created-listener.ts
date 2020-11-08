import { Message } from 'node-nats-streaming';
import { Subject } from '../../common/events/subject';
import { Listener } from '../../common/events/listener';
import { TicketCreatedEvent } from '../../common/events/ticket-created-event';
import { Ticket } from '../../models/ticket';
import { QueueGroupName } from '../../common/events/queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subject.TicketCreated = Subject.TicketCreated;
  queueGroupName = QueueGroupName.OrdersService;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const ticket = Ticket.build({
      id: data.id,
      title: data.title,
      price: data.price,
      userId: data.userId
    });

    await ticket.save();

    msg.ack();
  }
}
