export default function OrderBook({ symbol, price }) {
  const bidAsk = [
    { price: price * 0.9993, size: 1.2 },
    { price: price * 0.9996, size: 2.4 },
    { price: price * 0.9999, size: 3.8 },
    { price: price * 1.0001, size: 2.7 },
    { price: price * 1.0004, size: 1.6 },
    { price: price * 1.0007, size: 0.9 },
  ]

  const formatPrice = (value) => {
    if (symbol.includes('JPY')) return Number(value).toFixed(2)
    if (symbol.includes('USD') && value < 100) return Number(value).toFixed(4)
    if (symbol.includes('USD')) return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
    return Number(value).toFixed(4)
  }

  return (
    <div className="card bg-dark border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="text-uppercase text-primary small fw-bold mb-1">Market depth</p>
            <h3 className="h5 mb-0 text-white">Order book</h3>
          </div>
          <span className="badge bg-primary-subtle text-primary">{symbol}</span>
        </div>

        <div className="mb-3 text-white small text-uppercase text-secondary">Best bids / asks</div>

        <div className="d-flex flex-column gap-2">
          {bidAsk.map((level, index) => (
            <div key={`${symbol}-depth-${index}`} className="d-flex justify-content-between align-items-center">
              <span className={index < 3 ? 'text-success' : 'text-danger'}>{index < 3 ? 'Bid' : 'Ask'}</span>
              <strong className="text-white">${formatPrice(level.price)}</strong>
              <span className="text-secondary">{level.size.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-top border-secondary pt-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-secondary">Spread</span>
            <strong className="text-white">${(Math.abs(bidAsk[2].price - bidAsk[3].price) || 0).toFixed(symbol.includes('JPY') ? 2 : 4)}</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-secondary">Last</span>
            <strong className="text-white">${formatPrice(price)}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
