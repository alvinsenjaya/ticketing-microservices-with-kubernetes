import mongoose from 'mongoose';

// Interface that describe property to create new ticket
interface PaymentAttrs {
  orderId: string,
  stripeId: string
}

// Interface that describe properties that ticket document has
interface PaymentDocument extends mongoose.Document {
  orderId: string,
  stripeId: string
}

// Interface that describe property a ticket model has
interface PaymentModel extends mongoose.Model<PaymentDocument> {
  build(attrs: PaymentAttrs): PaymentDocument;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  stripeId: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

paymentSchema.pre('save', function(next) {
  this.increment();
  return next();
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDocument, PaymentModel>('Payment', paymentSchema);

export { Payment };