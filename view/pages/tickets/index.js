import Link from 'next/link';
import Router from 'next/router';

const TicketIndex = ({ tickets }) => {
  const orderStatus = (orderId)  => {
    if(orderId){
      return <td>Reserved</td>
    }
    return <td>Available</td>
  }

  const orderLink = (orderId) => {
    if(!orderId){
      return <td>Available</td>
    }
    return <td>
      <Link href="/orders/[orderId]" as={`/orders/${orderId}`} >
        <a>View Order</a>
      </Link>
    </td>
  }

  const editLink = (orderId, ticketId) => {
    if(orderId){
      return <td>Edit</td>
    }
    return <td>
      <Link href="/tickets/edit/[ticketId]" as={`/tickets/edit/${ticketId}`} >
        <a>Edit</a>
      </Link>
    </td>
  }

  const ticketList = tickets.map(ticket => {
    return(
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        {orderLink(ticket.orderId)}
        {editLink(ticket.orderId, ticket.id)}
      </tr>
    )
  })

  return (
    <div>
      <h1>My Ticket</h1>
      <button className="btn btn-primary" onClick={() => Router.push('/tickets/create')}>Sell New Ticket</button>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  );
  
}

TicketIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/tickets/myticket');

  return { tickets: data };
}

export default TicketIndex;