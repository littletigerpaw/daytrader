import { useMemo, useState } from 'react'

export default function TrendChart({ symbol, price, change, data, timeline = [] }) {
  const [selectedRange, setSelectedRange] = useState('1D')
  const width = 520
  const height = 180
  const baseValues = Array.isArray(data) && data.length > 0 ? data : [0, 1, 2, 3]

  const values = useMemo(() => {
    if (selectedRange === '1H') return baseValues
    if (selectedRange === '1D') return baseValues.map((value, index) => value * (1 + (index - 2) * 0.0009))
    if (selectedRange === '1W') {
      const expanded = []
      for (let index = 0; index < 10; index += 1) {
        const ratio = index / 9
        expanded.push(baseValues[0] + (baseValues[baseValues.length - 1] - baseValues[0]) * ratio + (Math.sin(index * 1.2) * 0.002))
      }
      return expanded
    }

    const expanded = []
    for (let index = 0; index < 12; index += 1) {
      const ratio = index / 11
      expanded.push(baseValues[0] + (baseValues[baseValues.length - 1] - baseValues[0]) * ratio + (Math.cos(index * 0.8) * 0.003))
    }
    return expanded
  }, [baseValues, selectedRange])

  const candles = useMemo(() => {
    const chartMin = Math.min(...values)
    const chartMax = Math.max(...values)
    const candleWidth = 10

    const scaleY = (value) => {
      const range = chartMax - chartMin || 1
      return height - 18 - ((value - chartMin) / range) * (height - 30)
    }

    return values.map((close, index) => {
      const previous = index === 0 ? close : values[index - 1]
      const open = index === 0 ? close * 0.995 : previous * (1 + (Math.sin(index * 1.3) * 0.0015))
      const high = Math.max(open, close) * (1 + (index % 2 === 0 ? 0.0026 : 0.0019))
      const low = Math.min(open, close) * (1 - (index % 2 === 0 ? 0.0023 : 0.0018))
      const x = 12 + (index / Math.max(values.length - 1, 1)) * (width - 24)
      const yOpen = scaleY(open)
      const yClose = scaleY(close)
      const yHigh = scaleY(high)
      const yLow = scaleY(low)
      const bodyTop = Math.min(yOpen, yClose)
      const bodyHeight = Math.max(8, Math.abs(yOpen - yClose))

      return {
        x,
        yHigh,
        yLow,
        bodyTop,
        bodyHeight,
        color: close >= open ? '#2dd4bf' : '#f97316',
        width: candleWidth,
      }
    })
  }, [values])

  const labels = timeline.length ? timeline : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
  const lastPrice = values[values.length - 1]
  const firstPrice = values[0]
  const valueFormatter = (value) => {
    if (symbol.includes('JPY')) return Number(value).toFixed(2)
    if (symbol.includes('USD') && value < 100) return Number(value).toFixed(4)
    if (symbol.includes('USD')) return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
    return Number(value).toFixed(4)
  }

  return (
    <div className="card bg-dark border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
          <div>
            <p className="text-uppercase text-primary small fw-bold mb-1">Market</p>
            <h3 className="h5 mb-0 text-white">{symbol}</h3>
          </div>

          <div className="btn-group btn-group-sm" role="group" aria-label="Time range">
            {['1H', '1D', '1W', '1M'].map((range) => (
              <button
                key={range}
                type="button"
                className={`btn ${selectedRange === range ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedRange(range)}
              >
                {range}
              </button>
            ))}
          </div>

          <div className={change >= 0 ? 'text-success' : 'text-danger'}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-end mb-3">
          <div className="text-white fs-3 fw-bold">
            {symbol.includes('/') && !symbol.includes('USD') ? valueFormatter(price) : `$${Number(price).toLocaleString(undefined, { maximumFractionDigits: symbol.includes('JPY') ? 2 : 4 })}`}
          </div>
          <small className="text-secondary">Updated {labels[labels.length - 1]}</small>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="180"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${symbol} candlestick chart`}
          style={{ background: 'rgba(255,255,255,0.025)', borderRadius: '12px' }}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((step, index) => {
            const y = 12 + step * (height - 24)
            return (
              <line
                key={index}
                x1="0"
                x2={width}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="4 6"
              />
            )
          })}

          {candles.map((candle, index) => (
            <g key={`${symbol}-candle-${index}`}>
              <line
                x1={candle.x + candle.width / 2}
                x2={candle.x + candle.width / 2}
                y1={candle.yHigh}
                y2={candle.yLow}
                stroke={candle.color}
                strokeWidth="1.6"
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

        <div className="mt-3 d-flex justify-content-between align-items-center text-secondary small">
          {labels.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>

        <div className="mt-3 d-flex justify-content-between text-secondary small">
          <span>Open {valueFormatter(firstPrice)}</span>
          <span>Last {valueFormatter(lastPrice)}</span>
          <span>Range {valueFormatter(Math.min(...values))} - {valueFormatter(Math.max(...values))}</span>
        </div>
      </div>
    </div>
  )
}
