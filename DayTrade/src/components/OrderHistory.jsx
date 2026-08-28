export default function OrderHistory({ orders }) {
  return (
    <div className="card bg-dark border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="text-uppercase text-primary small fw-bold mb-1">Orders</p>
            <h3 className="h5 mb-0 text-white">Recent activity</h3>
          </div>
        </div>

        <div className="d-flex flex-column gap-2">
          {orders.map((order) => (
            <div key={`${order.symbol}-${order.time}`} className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2">
              <div>
                <div className="fw-bold text-white">{order.symbol}</div>
                <small className="text-secondary">{order.time}</small>
              </div>
              <div className="text-end">
                <div className={order.side === 'Buy' ? 'text-success' : 'text-danger'}>{order.side}</div>
                <small className="text-secondary">{order.qty} units</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
