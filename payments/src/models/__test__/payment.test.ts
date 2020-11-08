import mongoose from 'mongoose'
import { Payment } from '../payment';

it('implements optimistic concurrency control', async (done) => {
  // Create instance of ticket and save to database
  const payment = Payment.build({
    orderId: mongoose.Types.ObjectId().toHexString(),
    stripeId: 'stripeId'
  })

  await payment.save()

  // Fetch ticket twice separately
  const firstPayment = await Payment.findById(payment.id);
  const secondPayment = await Payment.findById(payment.id);

  // Update ticket twice separately
  firstPayment!.set({
    stripeId: 'stripeId1'
  })

  secondPayment!.set({
    stripeId: 'stripeId2'
  })

  // Save first fetched ticket
  await firstPayment!.save()

  // Save second fethced ticket, expect error
  try {
    await secondPayment!.save();
  } catch(err) {
    return done();
  }
  
  throw new Error('Should not reach this point');
});

it('increment version number on multiple save', async () => {
  const payment = Payment.build({
    orderId: mongoose.Types.ObjectId().toHexString(),
    stripeId: 'stripeId'
  })

  await payment.save()
  expect(payment.__v).toEqual(0);

  payment.set({
    stripeId: 'stripeId1'
  })

  await payment.save()
  expect(payment.__v).toEqual(1);

  payment.set({
    stripeId: 'stripeId1'
  })

  await payment.save()
  expect(payment.__v).toEqual(2);
});
