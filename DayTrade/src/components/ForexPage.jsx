import { useMemo, useState } from 'react'

export default function ForexPage({ marketData = [], chartSeries = {}, onTrade, cashBalance }) {
  const forexData = useMemo(
    () => (marketData.filter((item) => item.type === 'Forex') || []).map((pair) => ({
      ...pair,
      pip: pair.change >= 0 ? '+14 pips' : '-14 pips',
      dailyRange: pair.symbol.includes('JPY') ? `${(pair.price - 0.8).toFixed(2)} - ${(pair.price + 0.8).toFixed(2)}` : `${(pair.price - 0.0025).toFixed(4)} - ${(pair.price + 0.0025).toFixed(4)}`,
    })),
    [marketData],
  )

  const [selectedSymbol, setSelectedSymbol] = useState('EUR/USD')
  const [tradeSide, setTradeSide] = useState('Buy')
  const [units, setUnits] = useState('1000')

  const selectedPair = useMemo(
    () => forexData.find((pair) => pair.symbol === selectedSymbol) || forexData[0],
    [forexData, selectedSymbol],
  )

  const priceSeries = useMemo(() => {
    const values = chartSeries[selectedSymbol] || [selectedPair.price, selectedPair.price, selectedPair.price]
    return values.length > 1 ? values : [selectedPair.price, selectedPair.price * 1.001, selectedPair.price * 0.999]
  }, [chartSeries, selectedPair, selectedSymbol])

  const width = 520
  const height = 160
  const chartMin = Math.min(...priceSeries)
  const chartMax = Math.max(...priceSeries)
  const candles = priceSeries.map((close, index) => {
    const previous = index === 0 ? close : priceSeries[index - 1]
    const open = index === 0 ? close * 0.999 : previous
    const high = Math.max(open, close) * (1 + 0.0018)
    const low = Math.min(open, close) * (1 - 0.0018)
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
      color: close >= open ? '#2dd4bf' : '#f97316',
      width: 10,
    }
  })

  const notionalValue = Number(units || 0) * selectedPair.price

  return (
    <div className="card bg-dark border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <p className="text-uppercase text-primary small fw-bold mb-1">Forex</p>
            <h2 className="h4 mb-0 text-white">Currency pairs</h2>
          </div>
          <button type="button" className="btn btn-outline-light btn-sm">Open desk</button>
        </div>

        <div className="row g-3 mb-4">
          {forexData.map((pair) => (
            <div key={pair.symbol} className="col-md-6">
              <button
                type="button"
                className={`card h-100 w-100 text-start border ${selectedSymbol === pair.symbol ? 'border-primary bg-primary-subtle' : 'bg-black bg-opacity-25 border-secondary'}`}
                onClick={() => setSelectedSymbol(pair.symbol)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="fw-bold text-white">{pair.symbol}</div>
                      <small className="text-secondary">Major pair</small>
                    </div>
                    <span className={`badge ${pair.change >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {pair.pip}
                    </span>
                  </div>

                  <div className="fs-3 fw-bold text-white mb-2">
                    {pair.symbol.includes('JPY') ? pair.price.toFixed(2) : pair.price.toFixed(4)}
                  </div>
                  <div className={pair.change >= 0 ? 'text-success' : 'text-danger'}>
                    {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
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
                    <p className="text-uppercase text-primary small fw-bold mb-1">Selected pair</p>
                    <h3 className="h4 mb-0 text-white">{selectedPair.symbol}</h3>
                  </div>
                  <span className={`badge ${selectedPair.change >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change.toFixed(2)}%
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="fs-3 fw-bold text-white">
                    {selectedPair.symbol.includes('JPY') ? selectedPair.price.toFixed(2) : selectedPair.price.toFixed(4)}
                  </div>
                  <small className="text-secondary">{selectedPair.dailyRange}</small>
                </div>

                <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="180" preserveAspectRatio="none" role="img" aria-label={`${selectedPair.symbol} candlestick chart`}>
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
                    <g key={`${selectedPair.symbol}-candle-${index}`}>
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
                    <h3 className="h5 mb-0 text-white">{selectedPair.symbol}</h3>
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
                  <label htmlFor="forexUnits" className="form-label text-secondary">Units</label>
                  <input
                    id="forexUnits"
                    type="number"
                    min="100"
                    step="100"
                    className="form-control bg-dark text-white border-secondary"
                    value={units}
                    onChange={(event) => setUnits(event.target.value)}
                  />
                </div>

                <div className="bg-dark rounded p-3 mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Rate</span>
                    <strong className="text-white">
                      {selectedPair.symbol.includes('JPY') ? selectedPair.price.toFixed(2) : selectedPair.price.toFixed(4)}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Notional</span>
                    <strong className="text-white">${notionalValue.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Cash</span>
                    <strong className="text-white">${Number(cashBalance || 0).toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={() => onTrade(selectedPair, tradeSide, units)}
                >
                  {tradeSide} {selectedPair.symbol}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
