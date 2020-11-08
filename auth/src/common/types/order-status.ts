export enum OrderStatus {
  Created = 'created', //order created and ticket is not reserverd
  Cancelled = 'cancelled', //order created, but ticket is already reserved OR user cancelled the order OR order expired before payment
  AwaitingPayment = 'awaiting:payment', //order created, successfully reserved, waiting for payment
  Completed = 'completed' //order created, ticket reserved, payment successful
}