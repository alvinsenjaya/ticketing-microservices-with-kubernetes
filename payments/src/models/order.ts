import mongoose from 'mongoose';

import { OrderStatus } from '../common/types/order-status';

export { OrderStatus };

// Interface that describe property to create new ticket
interface OrderAttrs {
  id: string,
  userId: string,
  status: OrderStatus,
  price: number
}

// Interface that describe properties that ticket document has
interface OrderDocument extends mongoose.Document {
  userId: string,
  status: OrderStatus,
  price: number
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
  },
  price: {
    type: Number,
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

orderSchema.pre('save', function(next) {
  this.increment();
  return next();
});

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price
  });
}

const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

export { Order };