export default function Watchlist({ items, onSelect }) {
  return (
    <div className="card bg-dark border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="text-uppercase text-primary small fw-bold mb-1">Watchlist</p>
            <h3 className="h5 mb-0 text-white">Top movers</h3>
          </div>
        </div>

        <div className="d-flex flex-column gap-2">
          {items.map((item) => (
            <button
              key={item.symbol}
              type="button"
              className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 bg-transparent text-start border-top-0 border-start-0 border-end-0 px-0"
              onClick={() => onSelect && onSelect(item.symbol)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="fw-bold text-white">{item.symbol}</div>
                <small className="text-secondary">{item.type}</small>
              </div>
              <div className="text-end">
                <div className="fw-semibold text-white">{item.price}</div>
                <small className={item.trend === 'up' ? 'text-success' : 'text-danger'}>
                  {item.change}
                </small>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
