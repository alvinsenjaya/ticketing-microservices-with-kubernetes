import mongoose from 'mongoose';

import { OrderStatus } from '../common/types/order-status';
import { TicketDocument } from './ticket';

export { OrderStatus };

// Interface that describe property to create new ticket
interface OrderAttrs {
  userId: string,
  status: OrderStatus,
  expiresAt: Date,
  ticket: TicketDocument
}

// Interface that describe properties that ticket document has
interface OrderDocument extends mongoose.Document {
  userId: string,
  status: OrderStatus,
  expiresAt: Date,
  ticket: TicketDocument
}

// Interface that describe property a ticket model has
interface OrderModel extends mongoose.Model<OrderDocument> {
  build(attrs: OrderAttrs): OrderDocument;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },
  expiresAt: {
    type: mongoose.Schema.Types.Date,
    required: true
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
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

orderSchema.pre('save', function(next) {
  this.increment();
  return next();
});

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
}

const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

export { Order };