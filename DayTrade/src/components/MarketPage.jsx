const marketData = [
  { symbol: 'EUR/USD', type: 'Forex', price: 1.0842, change: 0.0014, volume: '3.2M' },
  { symbol: 'GBP/USD', type: 'Forex', price: 1.2678, change: -0.0021, volume: '2.7M' },
  { symbol: 'USD/JPY', type: 'Forex', price: 157.46, change: 0.82, volume: '4.1M' },
  { symbol: 'BTC/USD', type: 'Crypto', price: 62140.18, change: 2.46, volume: '$18.3B' },
  { symbol: 'ETH/USD', type: 'Crypto', price: 3481.62, change: 1.94, volume: '$9.4B' },
  { symbol: 'SOL/USD', type: 'Crypto', price: 162.41, change: 3.88, volume: '$5.1B' },
  { symbol: 'DOGE/USD', type: 'Crypto', price: 0.1726, change: 1.12, volume: '$1.7B' },
]

export default function MarketPage({
  marketData,
  selectedSymbol,
  setSelectedSymbol,
  selectedAsset,
  tradeSide,
  setTradeSide,
  orderType,
  setOrderType,
  units,
  setUnits,
  tradeAmount,
  activeHolding,
  handleTrade,
  holdings,
  cashBalance,
  accountSummary,
}) {
  return (
    <>
      <section className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-dark border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary small text-uppercase">Portfolio value</div>
              <div className="fs-3 fw-bold text-white">$128,420.50</div>
              <small className="text-success">+3.42% today</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary small text-uppercase">Cash balance</div>
              <div className="fs-3 fw-bold text-white">${cashBalance.toFixed(2)}</div>
              <small className="text-secondary">Available to trade</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary small text-uppercase">Open positions</div>
              <div className="fs-3 fw-bold text-white">{holdings.length}</div>
              <small className="text-secondary">3 active pairs</small>
            </div>
          </div>
        </div>
      </section>

      <main className="row g-3">
        <section className="col-lg-8">
          <div className="card bg-dark border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <p className="text-uppercase text-primary small fw-bold mb-1">Asset board</p>
                  <h2 className="h4 mb-0 text-white">Market watch</h2>
                </div>
              </div>

              <div className="list-group list-group-flush">
                {marketData.map((asset) => (
                  <button
                    key={asset.symbol}
                    type="button"
                    className={`list-group-item list-group-item-action bg-transparent text-start border-secondary ${selectedSymbol === asset.symbol ? 'active' : ''}`}
                    onClick={() => setSelectedSymbol(asset.symbol)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-white">{asset.symbol}</div>
                        <small className="text-secondary">{asset.type}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold text-white">
                          {asset.symbol.includes('/') ? asset.price.toFixed(4) : `$${asset.price.toLocaleString()}`}
                        </div>
                        <small className={asset.change >= 0 ? 'text-success' : 'text-danger'}>
                          {asset.change >= 0 ? '+' : ''}
                          {asset.change.toFixed(2)}%
                        </small>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="col-lg-4">
          <div className="card bg-dark border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <p className="text-uppercase text-primary small fw-bold mb-1">Execution</p>
                  <h2 className="h4 mb-0 text-white">{selectedSymbol}</h2>
                </div>
                <span className={`badge ${selectedAsset.change >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                  {selectedAsset.change >= 0 ? '+' : ''}
                  {selectedAsset.change.toFixed(2)}%
                </span>
              </div>

              <div className="bg-black bg-opacity-25 rounded p-3 mb-3 d-flex justify-content-between align-items-center">
                <span className="text-secondary">Last price</span>
                <strong className="text-white fs-5">
                  {selectedSymbol.includes('/')
                    ? selectedAsset.price.toFixed(4)
                    : `$${selectedAsset.price.toLocaleString()}`}
                </strong>
              </div>

              <div className="btn-group w-100 mb-3" role="group">
                <button
                  type="button"
                  className={`btn ${tradeSide === 'Buy' ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setTradeSide('Buy')}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`btn ${tradeSide === 'Sell' ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setTradeSide('Sell')}
                >
                  Sell
                </button>
              </div>

              <div className="mb-3">
                <label htmlFor="orderType" className="form-label text-secondary">Order type</label>
                <select id="orderType" className="form-select bg-dark text-white border-secondary" value={orderType} onChange={(event) => setOrderType(event.target.value)}>
                  <option value="Market">Market</option>
                  <option value="Limit">Limit</option>
                  <option value="Stop">Stop</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="units" className="form-label text-secondary">Units</label>
                <input
                  id="units"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control bg-dark text-white border-secondary"
                  value={units}
                  onChange={(event) => setUnits(event.target.value)}
                />
              </div>

              <div className="bg-black bg-opacity-25 rounded p-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Estimated value</span>
                  <strong className="text-white">${tradeAmount.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Position</span>
                  <strong className="text-white">{activeHolding ? activeHolding.units.toFixed(2) : '0.00'} {selectedSymbol}</strong>
                </div>
              </div>

              <button type="button" className="btn btn-primary w-100" onClick={handleTrade}>
                {tradeSide} {selectedSymbol}
              </button>
            </div>
          </div>
        </aside>
      </main>

      <section className="row g-3 mt-2">
        <div className="col-lg-7">
          <div className="card bg-dark border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <p className="text-uppercase text-primary small fw-bold mb-1">Overview</p>
                  <h2 className="h4 mb-0 text-white">Portfolio</h2>
                </div>
              </div>

              <div className="list-group list-group-flush">
                {holdings.map((item) => {
                  const asset = marketData.find((market) => market.symbol === item.symbol)
                  const currentPrice = asset?.price || 0
                  const currentValue = item.units * currentPrice

                  return (
                    <div key={item.symbol} className="list-group-item bg-transparent border-secondary px-0 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-white">{item.symbol}</div>
                        <small className="text-secondary">{item.units.toFixed(2)} units</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-white">${currentValue.toFixed(2)}</div>
                        <small className={asset?.change >= 0 ? 'text-success' : 'text-danger'}>
                          {asset?.change >= 0 ? '+' : ''}{asset?.change.toFixed(2)}%
                        </small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card bg-dark border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <p className="text-uppercase text-primary small fw-bold mb-1">Performance</p>
                  <h2 className="h4 mb-0 text-white">Account stats</h2>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                {accountSummary.map((stat) => (
                  <div key={stat.label} className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2">
                    <span className="text-secondary">{stat.label}</span>
                    <strong className="text-white">{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
