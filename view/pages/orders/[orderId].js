import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push('/orders')
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();

      setTimeLeft(Math.round(msLeft / 1000));
    }

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    }
  }, [order])

  const orderControl = (currentId, userId) => {
    if(currentId === userId) {
      return <div>
        <StripeCheckout
          token={({ id }) => doRequest({ token: id })}
          stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUB}
          amount={order.ticket.price * 100}
          email={currentUser.email}
        />
        <button className="btn btn-primary" onClick={() => Router.push(`/orders/cancel/${order.id}`)}>Cancel</button>
        {errors}
      </div>
    }
  }

  if(timeLeft < 0 || order.status === 'completed' || order.status === 'cancelled'){
    return <div>
      <h1>Purchasing ticket: {order.ticket.title}</h1>
      <h4>Price: {order.ticket.price}</h4>
      <h4>Status: {order.status}</h4>
    </div>
  }

  return <div>
    <h1>Purchasing ticket: {order.ticket.title}</h1>
    <h4>Price: {order.ticket.price}</h4>
    <h4>Status: {order.status}</h4>
    <h4>Time left to pay: {timeLeft} seconds</h4>
    {orderControl(currentUser.id, order.userId)}
  </div>
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
}

export default OrderShow;