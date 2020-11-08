import mongoose from 'mongoose';

// Interface that describe property to create new ticket
interface TicketAttrs {
  title: string,
  price: number,
  userId: string
}

// Interface that describe property a ticket model has
interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attrs: TicketAttrs): TicketDocument;
}

// Interface that describe properties that ticket document has
interface TicketDocument extends mongoose.Document {
  title: string,
  price: number,
  userId: string,
  orderId?: string
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  orderId: {
    type:String,
    default: undefined
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
  return new Ticket(attrs);
}

const Ticket = mongoose.model<TicketDocument, TicketModel> ('Ticket', ticketSchema);

export { Ticket };