import { useEffect, useMemo, useState } from 'react'
import './App.css'
import CommodityPage from './components/CommodityPage'
import CryptoPage from './components/CryptoPage'
import ForexPage from './components/ForexPage'
import HomePage from './components/homepage/HomePage'
import Sidebar from './components/Sidebar'
import Watchlist from './components/Watchlist'
import OrderHistory from './components/OrderHistory'
import TrendChart from './components/TrendChart'
import OrderBook from './components/OrderBook'
import PortfolioComparison from './components/PortfolioComparison'
import { fetchLiveMarketData, getTimelineLabels } from './config/marketApi'

const defaultMarketData = [
  { symbol: 'EUR/USD', type: 'Forex', price: 1.0842, change: 0.14, volume: '3.2M' },
  { symbol: 'GBP/USD', type: 'Forex', price: 1.2678, change: -0.21, volume: '2.7M' },
  { symbol: 'USD/JPY', type: 'Forex', price: 157.46, change: 0.52, volume: '4.1M' },
  { symbol: 'BTC/USD', type: 'Crypto', price: 62140.18, change: 2.46, volume: '$18.3B' },
  { symbol: 'ETH/USD', type: 'Crypto', price: 3481.62, change: 1.94, volume: '$9.4B' },
  { symbol: 'SOL/USD', type: 'Crypto', price: 162.41, change: 3.88, volume: '$5.1B' },
  { symbol: 'DOGE/USD', type: 'Crypto', price: 0.1726, change: 1.12, volume: '$1.7B' },
]

const initialHoldings = [
  { symbol: 'BTC/USD', units: 0.18, avgPrice: 61250 },
  { symbol: 'EUR/USD', units: 2500, avgPrice: 1.0821 },
  { symbol: 'SOL/USD', units: 18, avgPrice: 142.8 },
]

const accountSummary = [
  { label: 'Net liquidity', value: '$24,800.00' },
  { label: 'Open P&L', value: '+$1,240.00' },
  { label: 'Win rate', value: '67.8%' },
]

const defaultWatchlistItems = [
  { symbol: 'BTC/USD', type: 'Crypto', price: '$62,140.18', change: '+2.46%', trend: 'up' },
  { symbol: 'ETH/USD', type: 'Crypto', price: '$3,481.62', change: '+1.94%', trend: 'up' },
  { symbol: 'SOL/USD', type: 'Crypto', price: '$162.41', change: '+3.88%', trend: 'up' },
  { symbol: 'EUR/USD', type: 'Forex', price: '1.0842', change: '-0.22%', trend: 'down' },
  { symbol: 'XAU/USD', type: 'Commodity', price: '$2,336.80', change: '+0.78%', trend: 'up' },
]

const defaultOrderHistory = [
  { symbol: 'BTC/USD', side: 'Buy', qty: 0.32, time: '09:42 AM' },
  { symbol: 'ETH/USD', side: 'Sell', qty: 1.10, time: '08:15 AM' },
  { symbol: 'EUR/USD', side: 'Buy', qty: 1500, time: 'Yesterday' },
  { symbol: 'XAU/USD', side: 'Sell', qty: 1.50, time: 'Mon' },
]

const defaultChartSeries = {
  'BTC/USD': [62_000, 61_800, 63_200, 62_500, 63_900, 64_100, 62_140],
  'ETH/USD': [3_120, 3_240, 3_300, 3_280, 3_420, 3_520, 3_481],
  'SOL/USD': [148, 152, 156, 150, 160, 165, 162],
  'EUR/USD': [1.07, 1.073, 1.081, 1.079, 1.083, 1.085, 1.0842],
  'DOGE/USD': [0.17, 0.165, 0.169, 0.171, 0.174, 0.173, 0.1726],
  'GBP/USD': [1.25, 1.241, 1.253, 1.266, 1.268, 1.267, 1.2678],
  'USD/JPY': [156.1, 156.5, 157.2, 156.9, 157.4, 157.8, 157.46],
}

const defaultTimeline = getTimelineLabels(7)

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD')
  const [tradeSide, setTradeSide] = useState('Buy')
  const [orderType, setOrderType] = useState('Market')
  const [units, setUnits] = useState('0.5')
  const [cashBalance, setCashBalance] = useState(25000)
  const [holdings, setHoldings] = useState(initialHoldings)
  const [watchlistItems, setWatchlistItems] = useState(defaultWatchlistItems)
  const [orderHistory, setOrderHistory] = useState(defaultOrderHistory)
  const [activeView, setActiveView] = useState('markets')
  const [marketData, setMarketData] = useState(defaultMarketData)
  const [chartSeries, setChartSeries] = useState(defaultChartSeries)
  const [marketTimeline, setMarketTimeline] = useState(defaultTimeline)
  const [liveStatus, setLiveStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    fetchLiveMarketData().then((result) => {
      if (!isMounted) return
      setMarketData(result.marketData)
      setChartSeries(result.chartSeries)
      setMarketTimeline(result.timeline || getTimelineLabels(7))
      setLiveStatus(result.liveStatus || 'fallback')
    }).catch((error) => {
      console.warn('Live market feed unavailable, using fallback values.', error)
      setLiveStatus('fallback')
    })

    return () => {
      isMounted = false
    }
  }, [])

  const selectedAsset = useMemo(
    () => marketData.find((item) => item.symbol === selectedSymbol) || marketData[0],
    [selectedSymbol],
  )

  const activeHolding = holdings.find((item) => item.symbol === selectedSymbol)
  const tradeAmount = Number(units || 0) * selectedAsset.price
  const chartData = chartSeries[selectedSymbol] || chartSeries['BTC/USD']

  const recordTrade = (symbol, side, quantity, price) => {
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setOrderHistory((current) => [
      { symbol, side, qty: Number(quantity), time: formattedTime },
      ...current,
    ].slice(0, 6))

    setWatchlistItems((current) => {
      const existing = current.find((item) => item.symbol === symbol)
      const nextPrice = `${symbol.includes('/') ? (symbol.includes('JPY') ? price.toFixed(2) : price.toFixed(4)) : `$${price.toLocaleString()}`}`
      const newChange = `${side === 'Buy' ? '+' : '-'}${Math.abs(Number((price * 0.005).toFixed(2)))}${symbol.includes('/') ? '%' : '%'}`

      if (existing) {
        return current.map((item) =>
          item.symbol === symbol
            ? { ...item, price: nextPrice, change: newChange, trend: side === 'Buy' ? 'up' : 'down' }
            : item,
        )
      }

      return [
        { symbol, type: symbol.includes('/') ? (symbol.includes('USD') ? 'Forex' : 'Crypto') : 'Commodity', price: nextPrice, change: newChange, trend: side === 'Buy' ? 'up' : 'down' },
        ...current,
      ].slice(0, 5)
    })
  }

  const handleWatchlistSelect = (symbol) => {
    setSelectedSymbol(symbol)

    if (['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'].includes(symbol)) {
      setActiveView('forex')
      return
    }

    if (['BTC/USD', 'ETH/USD', 'SOL/USD', 'DOGE/USD'].includes(symbol)) {
      setActiveView('crypto')
      return
    }

    setActiveView('commodities')
  }

  const handleTrade = () => {
    const quantity = Number(units)
    if (!quantity || quantity <= 0) return

    if (tradeSide === 'Buy' && cashBalance < tradeAmount) {
      alert('Not enough cash balance for this order.')
      return
    }

    setHoldings((current) => {
      const next = [...current]
      const index = next.findIndex((item) => item.symbol === selectedSymbol)

      if (tradeSide === 'Buy') {
        if (index >= 0) {
          const previous = next[index]
          const newUnits = previous.units + quantity
          const newAvgPrice = (previous.avgPrice * previous.units + selectedAsset.price * quantity) / newUnits
          next[index] = { ...previous, units: newUnits, avgPrice: newAvgPrice }
        } else {
          next.push({ symbol: selectedSymbol, units: quantity, avgPrice: selectedAsset.price })
        }
      } else {
        if (index === -1) return current

        const previous = next[index]
        const remainingUnits = previous.units - quantity

        if (remainingUnits <= 0) {
          next.splice(index, 1)
        } else {
          next[index] = { ...previous, units: remainingUnits }
        }
      }

      return next
    })

    setCashBalance((current) =>
      tradeSide === 'Buy' ? current - tradeAmount : current + tradeAmount,
    )

    recordTrade(selectedSymbol, tradeSide, quantity, selectedAsset.price)
  }

  const handleForexTrade = (pair, side, quantity) => {
    const parsedQuantity = Number(quantity)
    if (!pair || !parsedQuantity || parsedQuantity <= 0) return

    const tradeValue = parsedQuantity * pair.price

    if (side === 'Buy' && cashBalance < tradeValue) {
      alert('Not enough cash balance for this forex trade.')
      return
    }

    setHoldings((current) => {
      const next = [...current]
      const index = next.findIndex((item) => item.symbol === pair.symbol)

      if (side === 'Buy') {
        if (index >= 0) {
          const previous = next[index]
          const newUnits = previous.units + parsedQuantity
          const newAvgPrice = (previous.avgPrice * previous.units + pair.price * parsedQuantity) / newUnits
          next[index] = { ...previous, units: newUnits, avgPrice: newAvgPrice }
        } else {
          next.push({ symbol: pair.symbol, units: parsedQuantity, avgPrice: pair.price })
        }
      } else {
        if (index === -1) return current

        const previous = next[index]
        const remainingUnits = previous.units - parsedQuantity

        if (remainingUnits <= 0) {
          next.splice(index, 1)
        } else {
          next[index] = { ...previous, units: remainingUnits }
        }
      }

      return next
    })

    setCashBalance((current) =>
      side === 'Buy' ? current - tradeValue : current + tradeValue,
    )

    recordTrade(pair.symbol, side, parsedQuantity, pair.price)
  }

  const handleCryptoTrade = (coin, side, quantity) => {
    const parsedQuantity = Number(quantity)
    if (!coin || !parsedQuantity || parsedQuantity <= 0) return

    const tradeValue = parsedQuantity * coin.price

    if (side === 'Buy' && cashBalance < tradeValue) {
      alert('Not enough cash balance for this crypto trade.')
      return
    }

    setHoldings((current) => {
      const next = [...current]
      const index = next.findIndex((item) => item.symbol === coin.symbol)

      if (side === 'Buy') {
        if (index >= 0) {
          const previous = next[index]
          const newUnits = previous.units + parsedQuantity
          const newAvgPrice = (previous.avgPrice * previous.units + coin.price * parsedQuantity) / newUnits
          next[index] = { ...previous, units: newUnits, avgPrice: newAvgPrice }
        } else {
          next.push({ symbol: coin.symbol, units: parsedQuantity, avgPrice: coin.price })
        }
      } else {
        if (index === -1) return current

        const previous = next[index]
        const remainingUnits = previous.units - parsedQuantity

        if (remainingUnits <= 0) {
          next.splice(index, 1)
        } else {
          next[index] = { ...previous, units: remainingUnits }
        }
      }

      return next
    })

    setCashBalance((current) =>
      side === 'Buy' ? current - tradeValue : current + tradeValue,
    )

    recordTrade(coin.symbol, side, parsedQuantity, coin.price)
  }

  const handleCommodityTrade = (item, side, quantity) => {
    const parsedQuantity = Number(quantity)
    if (!item || !parsedQuantity || parsedQuantity <= 0) return

    const tradeValue = parsedQuantity * item.price

    if (side === 'Buy' && cashBalance < tradeValue) {
      alert('Not enough cash balance for this commodity trade.')
      return
    }

    setHoldings((current) => {
      const next = [...current]
      const index = next.findIndex((entry) => entry.symbol === item.symbol)

      if (side === 'Buy') {
        if (index >= 0) {
          const previous = next[index]
          const newUnits = previous.units + parsedQuantity
          const newAvgPrice = (previous.avgPrice * previous.units + item.price * parsedQuantity) / newUnits
          next[index] = { ...previous, units: newUnits, avgPrice: newAvgPrice }
        } else {
          next.push({ symbol: item.symbol, units: parsedQuantity, avgPrice: item.price })
        }
      } else {
        if (index === -1) return current

        const previous = next[index]
        const remainingUnits = previous.units - parsedQuantity

        if (remainingUnits <= 0) {
          next.splice(index, 1)
        } else {
          next[index] = { ...previous, units: remainingUnits }
        }
      }

      return next
    })

    setCashBalance((current) =>
      side === 'Buy' ? current - tradeValue : current + tradeValue,
    )

    recordTrade(item.symbol, side, parsedQuantity, item.price)
  }

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      <div className="d-flex gap-3 align-items-start">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        <main className="flex-grow-1">
          <header className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <p className="text-uppercase text-primary small fw-bold mb-2">Trade desk</p>
              <h1 className="display-6 fw-bold mb-0 text-white">DayTrade Pro</h1>
            </div>

            <div className="d-flex gap-2 align-items-center flex-wrap">
              <span className={`badge rounded-pill px-3 py-2 ${liveStatus === 'live' ? 'bg-success-subtle text-success' : liveStatus === 'fallback' ? 'bg-warning-subtle text-warning' : 'bg-secondary-subtle text-white'}`}>
                {liveStatus === 'live' ? 'Live market feed' : liveStatus === 'fallback' ? 'Fallback demo feed' : 'Loading market feed'}
              </span>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${activeView === 'markets' ? 'btn-primary' : 'btn-outline-light'}`}
                  onClick={() => setActiveView('markets')}
                >
                  Markets
                </button>
                <button
                  type="button"
                  className={`btn ${activeView === 'forex' ? 'btn-primary' : 'btn-outline-light'}`}
                  onClick={() => setActiveView('forex')}
                >
                  Forex
                </button>
                <button
                  type="button"
                  className={`btn ${activeView === 'crypto' ? 'btn-primary' : 'btn-outline-light'}`}
                  onClick={() => setActiveView('crypto')}
                >
                  Crypto
                </button>
                <button
                  type="button"
                  className={`btn ${activeView === 'commodities' ? 'btn-primary' : 'btn-outline-light'}`}
                  onClick={() => setActiveView('commodities')}
                >
                  Commodities
                </button>
              </div>
              <button type="button" className="btn btn-success">Add account</button>
            </div>
          </header>

          {activeView === 'markets' && (
            <>
              <HomePage
                marketData={marketData}
                selectedSymbol={selectedSymbol}
                setSelectedSymbol={setSelectedSymbol}
                selectedAsset={selectedAsset}
                tradeSide={tradeSide}
                setTradeSide={setTradeSide}
                orderType={orderType}
                setOrderType={setOrderType}
                units={units}
                setUnits={setUnits}
                tradeAmount={tradeAmount}
                activeHolding={activeHolding}
                handleTrade={handleTrade}
                holdings={holdings}
                cashBalance={cashBalance}
                accountSummary={accountSummary}
                watchlistItems={watchlistItems}
                orderHistory={orderHistory}
                chartData={chartData}
                setActiveView={setActiveView}
                handleWatchlistSelect={handleWatchlistSelect}
                timeline={marketTimeline}
              />

              <section className="row g-3 mt-2">
                <div className="col-lg-5">
                  <OrderBook symbol={selectedSymbol} price={selectedAsset.price} />
                </div>
                <div className="col-lg-7">
                  <PortfolioComparison holdings={holdings} marketData={marketData} />
                </div>
              </section>
            </>
          )}

          {activeView === 'forex' && (
            <ForexPage
              marketData={marketData}
              chartSeries={chartSeries}
              onTrade={handleForexTrade}
              cashBalance={cashBalance}
            />
          )}
          {activeView === 'crypto' && (
            <CryptoPage
              marketData={marketData}
              chartSeries={chartSeries}
              onTrade={handleCryptoTrade}
              cashBalance={cashBalance}
            />
          )}
          {activeView === 'commodities' && (
            <CommodityPage
              marketData={marketData}
              chartSeries={chartSeries}
              onTrade={handleCommodityTrade}
              cashBalance={cashBalance}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
