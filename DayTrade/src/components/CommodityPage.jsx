import { useMemo, useState } from 'react'

export default function CommodityPage({ marketData = [], chartSeries = {}, onTrade, cashBalance }) {
  const commodityData = useMemo(
    () => (marketData.filter((item) => item.type === 'Commodity') || []).map((item) => ({
      ...item,
      name: item.symbol === 'XAU/USD' ? 'Gold' : item.symbol === 'XAG/USD' ? 'Silver' : 'Crude Oil',
      status: item.change >= 0 ? 'Bullish' : 'Cooling',
      spot: item.symbol === 'WTI/USD' ? 'Futures' : 'Spot',
      description: item.symbol === 'WTI/USD' ? 'Energy benchmark' : item.symbol === 'XAG/USD' ? 'Industrial metals' : 'Precious metals',
    })),
    [marketData],
  )

  const [selectedSymbol, setSelectedSymbol] = useState('XAU/USD')
  const [tradeSide, setTradeSide] = useState('Buy')
  const [units, setUnits] = useState('1')

  const selectedItem = useMemo(
    () => commodityData.find((item) => item.symbol === selectedSymbol) || commodityData[0],
    [commodityData, selectedSymbol],
  )

  const priceSeries = useMemo(() => {
    const values = chartSeries[selectedSymbol] || [selectedItem.price, selectedItem.price, selectedItem.price]
    return values.length > 1 ? values : [selectedItem.price, selectedItem.price * 1.001, selectedItem.price * 0.999]
  }, [chartSeries, selectedItem, selectedSymbol])

  const width = 520
  const height = 160
  const chartMin = Math.min(...priceSeries)
  const chartMax = Math.max(...priceSeries)
  const candles = priceSeries.map((close, index) => {
    const previous = index === 0 ? close : priceSeries[index - 1]
    const open = index === 0 ? close * 0.998 : previous
    const high = Math.max(open, close) * (1 + 0.003)
    const low = Math.min(open, close) * (1 - 0.003)
    const scaleY = (value) => {
      const range = chartMax - chartMin || 1
      return height - 16 - ((value - chartMin) / range) * (height - 24)
    }
    const x = 12 + (index / Math.max(priceSeries.length - 1, 1)) * (width - 24)
    const yOpen = scaleY(open)
    const yClose = scaleY(close)
    const yHigh = scaleY(high)
    const yLow = scaleY(low)

    return {
      x,
      yHigh,
      yLow,
      bodyTop: Math.min(yOpen, yClose),
      bodyHeight: Math.max(8, Math.abs(yOpen - yClose)),
      color: close >= open ? '#f5c76e' : '#f97316',
      width: 10,
    }
  })

  const orderValue = Number(units || 0) * selectedItem.price

  return (
    <div className="card bg-dark border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <p className="text-uppercase text-primary small fw-bold mb-1">Commodities</p>
            <h2 className="h4 mb-0 text-white">Commodity desk</h2>
          </div>
          <button type="button" className="btn btn-outline-light btn-sm">View all</button>
        </div>

        <div className="row g-3 mb-4">
          {commodityData.map((item) => (
            <div key={item.symbol} className="col-md-4">
              <button
                type="button"
                className={`card h-100 w-100 text-start border ${selectedSymbol === item.symbol ? 'border-primary bg-primary-subtle' : 'bg-black bg-opacity-25 border-secondary'}`}
                onClick={() => setSelectedSymbol(item.symbol)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="fw-bold text-white">{item.name}</div>
                      <small className="text-secondary">{item.symbol}</small>
                    </div>
                    <span className={`badge ${item.change >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="fs-3 fw-bold text-white mb-1">${item.price.toLocaleString()}</div>
                  <div className={item.change >= 0 ? 'text-success' : 'text-danger'}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </div>

                  <div className="mt-3 text-secondary small">{item.description}</div>
                  <div className="mt-auto pt-3 d-flex justify-content-between align-items-center border-top border-secondary">
                    <span className="text-secondary">{item.spot}</span>
                    <span className="btn btn-sm btn-primary">Trade</span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-lg-8">
            <div className="card bg-black bg-opacity-25 border-secondary h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="text-uppercase text-primary small fw-bold mb-1">Selected commodity</p>
                    <h3 className="h4 mb-0 text-white">{selectedItem.name}</h3>
                  </div>
                  <span className={`badge ${selectedItem.change >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {selectedItem.status}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="fs-3 fw-bold text-white">${selectedItem.price.toLocaleString()}</div>
                  <small className={selectedItem.change >= 0 ? 'text-success' : 'text-danger'}>
                    {selectedItem.change >= 0 ? '+' : ''}{selectedItem.change.toFixed(2)}%
                  </small>
                </div>

                <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="180" preserveAspectRatio="none" role="img" aria-label={`${selectedItem.symbol} candlestick chart`}>
                  {[0, 0.25, 0.5, 0.75, 1].map((step, index) => {
                    const y = 8 + step * (height - 16)
                    return (
                      <line
                        key={index}
                        x1="0"
                        x2={width}
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="4 6"
                      />
                    )
                  })}

                  {candles.map((candle, index) => (
                    <g key={`${selectedItem.symbol}-candle-${index}`}>
                      <line
                        x1={candle.x + candle.width / 2}
                        x2={candle.x + candle.width / 2}
                        y1={candle.yHigh}
                        y2={candle.yLow}
                        stroke={candle.color}
                        strokeWidth="1.5"
                      />
                      <rect
                        x={candle.x}
                        y={candle.bodyTop}
                        width={candle.width}
                        height={candle.bodyHeight}
                        fill={candle.color}
                        opacity="0.95"
                        rx="2"
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card bg-black bg-opacity-25 border-secondary h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="text-uppercase text-primary small fw-bold mb-1">Trade</p>
                    <h3 className="h5 mb-0 text-white">{selectedItem.symbol}</h3>
                  </div>
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
                  <label htmlFor="commodityUnits" className="form-label text-secondary">Units</label>
                  <input
                    id="commodityUnits"
                    type="number"
                    min="0"
                    step="0.1"
                    className="form-control bg-dark text-white border-secondary"
                    value={units}
                    onChange={(event) => setUnits(event.target.value)}
                  />
                </div>

                <div className="bg-dark rounded p-3 mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Price</span>
                    <strong className="text-white">${selectedItem.price.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Notional</span>
                    <strong className="text-white">${orderValue.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Cash</span>
                    <strong className="text-white">${Number(cashBalance || 0).toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={() => onTrade(selectedItem, tradeSide, units)}
                >
                  {tradeSide} {selectedItem.symbol}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
