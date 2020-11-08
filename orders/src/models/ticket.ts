import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/order';

// Interface that describe property to create new ticket
interface TicketAttrs {
  id: string,
  title: string,
  price: number,
  userId: string
}

// Interface that describe properties that ticket document has
export interface TicketDocument extends mongoose.Document {
  title: string,
  price: number,
  userId: string
  isReserved(): Promise<boolean> 
}

// Interface that describe property a ticket model has
interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attrs: TicketAttrs): TicketDocument;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  userId: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

ticketSchema.pre('save', function(next) {
  this.increment();
  return next();
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
    userId: attrs.userId
  });
}

ticketSchema.methods.isReserved = async function() {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Completed
      ]
    }
  });

  return !!existingOrder;
}

const Ticket = mongoose.model<TicketDocument, TicketModel> ('Ticket', ticketSchema);

export { Ticket };