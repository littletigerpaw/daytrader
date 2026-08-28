import http from 'node:http'

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'

const fallbackQuoteMap = {
  'BTC/USD': 62140.18,
  'ETH/USD': 3481.62,
  'SOL/USD': 162.41,
  'DOGE/USD': 0.1726,
  'EUR/USD': 1.0842,
  'GBP/USD': 1.2678,
  'USD/JPY': 157.46,
  'AUD/USD': 0.6641,
  'XAU/USD': 2344.12,
  'XAG/USD': 29.46,
  'WTI/USD': 78.94,
}

const fallbackSeries = {
  'BTC/USD': [61_900, 62_150, 62_050, 62_400, 62_900, 63_300, 62_140],
  'ETH/USD': [3_050, 3_110, 3_160, 3_220, 3_300, 3_520, 3_481],
  'SOL/USD': [146, 149, 151, 154, 158, 165, 162],
  'DOGE/USD': [0.167, 0.168, 0.169, 0.170, 0.171, 0.173, 0.1726],
  'EUR/USD': [1.0812, 1.0818, 1.0828, 1.0834, 1.0840, 1.0846, 1.0842],
  'GBP/USD': [1.2652, 1.2658, 1.2664, 1.2670, 1.2675, 1.2679, 1.2678],
  'USD/JPY': [156.8, 157.0, 157.1, 157.3, 157.5, 157.6, 157.46],
  'AUD/USD': [0.6612, 0.6621, 0.6630, 0.6638, 0.6644, 0.6649, 0.6641],
  'XAU/USD': [2314, 2320, 2328, 2336, 2342, 2348, 2344],
  'XAG/USD': [28.2, 28.5, 28.8, 29.0, 29.3, 29.6, 29.46],
  'WTI/USD': [74.3, 75.1, 75.8, 76.7, 77.6, 78.1, 78.94],
}

const buildFallbackMarketData = () => [
  { symbol: 'EUR/USD', type: 'Forex', price: fallbackQuoteMap['EUR/USD'], change: 0.14, volume: '3.2M' },
  { symbol: 'GBP/USD', type: 'Forex', price: fallbackQuoteMap['GBP/USD'], change: -0.21, volume: '2.7M' },
  { symbol: 'USD/JPY', type: 'Forex', price: fallbackQuoteMap['USD/JPY'], change: 0.52, volume: '4.1M' },
  { symbol: 'AUD/USD', type: 'Forex', price: fallbackQuoteMap['AUD/USD'], change: 0.45, volume: '1.9M' },
  { symbol: 'BTC/USD', type: 'Crypto', price: fallbackQuoteMap['BTC/USD'], change: 2.46, volume: '$18.3B' },
  { symbol: 'ETH/USD', type: 'Crypto', price: fallbackQuoteMap['ETH/USD'], change: 1.94, volume: '$9.4B' },
  { symbol: 'SOL/USD', type: 'Crypto', price: fallbackQuoteMap['SOL/USD'], change: 3.88, volume: '$5.1B' },
  { symbol: 'DOGE/USD', type: 'Crypto', price: fallbackQuoteMap['DOGE/USD'], change: 1.12, volume: '$1.7B' },
  { symbol: 'XAU/USD', type: 'Commodity', price: fallbackQuoteMap['XAU/USD'], change: 1.14, volume: '$3.4B' },
  { symbol: 'XAG/USD', type: 'Commodity', price: fallbackQuoteMap['XAG/USD'], change: -0.62, volume: '$1.2B' },
  { symbol: 'WTI/USD', type: 'Commodity', price: fallbackQuoteMap['WTI/USD'], change: 2.35, volume: '$1.0B' },
]

const getPairPriceFromRates = (symbol, rates) => {
  if (!rates) return null

  switch (symbol) {
    case 'EUR/USD':
      return rates.EUR ? Number(1 / Number(rates.EUR)) : null
    case 'GBP/USD':
      return rates.GBP ? Number(1 / Number(rates.GBP)) : null
    case 'AUD/USD':
      return rates.AUD ? Number(1 / Number(rates.AUD)) : null
    case 'USD/JPY':
      return rates.JPY ? Number(rates.JPY) : null
    default:
      return null
  }
}

async function fetchLiveMarketSnapshot() {
  const fallback = {
    marketData: buildFallbackMarketData(),
    chartSeries: fallbackSeries,
    liveStatus: 'fallback',
    timeline: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
  }

  try {
    const cryptoRequests = [
      fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot'),
      fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot'),
      fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot'),
      fetch('https://api.coinbase.com/v2/prices/DOGE-USD/spot'),
    ]

    const [cryptoResponses, fxResponse, goldResponse] = await Promise.all([
      Promise.all(cryptoRequests),
      fetch('https://open.er-api.com/v6/latest/USD'),
      fetch('https://api.gold-api.com/price/XAU'),
    ])

    const liveMarketData = buildFallbackMarketData()
    let hasLiveData = false

    const cryptoSymbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'DOGE/USD']
    for (let index = 0; index < cryptoSymbols.length; index += 1) {
      const symbol = cryptoSymbols[index]
      const response = cryptoResponses[index]
      if (!response || !response.ok) continue

      const payload = await response.json()
      const price = Number(payload?.data?.amount)
      if (!Number.isFinite(price) || price <= 0) continue

      const itemIndex = liveMarketData.findIndex((entry) => entry.symbol === symbol)
      if (itemIndex >= 0) {
        liveMarketData[itemIndex] = { ...liveMarketData[itemIndex], price, volume: 'Live' }
        hasLiveData = true
      }
    }

    if (fxResponse.ok) {
      const fxPayload = await fxResponse.json()
      const rates = fxPayload?.rates || {}
      ;['EUR/USD', 'GBP/USD', 'AUD/USD', 'USD/JPY'].forEach((symbol) => {
        const value = getPairPriceFromRates(symbol, rates)
        const index = liveMarketData.findIndex((entry) => entry.symbol === symbol)
        if (value && index >= 0) {
          liveMarketData[index] = { ...liveMarketData[index], price: value, volume: 'Live' }
          hasLiveData = true
        }
      })
    }

    if (goldResponse.ok) {
      const goldPayload = await goldResponse.json()
      const price = Number(goldPayload?.price)
      const index = liveMarketData.findIndex((entry) => entry.symbol === 'XAU/USD')
      if (Number.isFinite(price) && price > 0 && index >= 0) {
        liveMarketData[index] = { ...liveMarketData[index], price, volume: 'Live' }
        hasLiveData = true
      }
    }

    return {
      marketData: liveMarketData,
      chartSeries: fallbackSeries,
      liveStatus: hasLiveData ? 'live' : 'fallback',
      timeline: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    }
  } catch (error) {
    console.warn('Public market feeds unavailable; using fallback values.', error)
    return fallback
  }
}

const jsonResponse = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(payload))
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    jsonResponse(res, 200, { ok: true })
    return
  }

  if (req.url === '/api/health' && req.method === 'GET') {
    jsonResponse(res, 200, { ok: true, service: 'DayTrade API', status: 'running' })
    return
  }

  if (req.url === '/api/market' && req.method === 'GET') {
    fetchLiveMarketSnapshot().then((payload) => {
      jsonResponse(res, 200, payload)
    }).catch((error) => {
      console.error('Market snapshot failed:', error)
      jsonResponse(res, 500, { marketData: buildFallbackMarketData(), chartSeries: fallbackSeries, liveStatus: 'fallback', timeline: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'] })
    })
    return
  }

  if (req.url === '/api/orders' && req.method === 'POST') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      try {
        const payload = body ? JSON.parse(body) : {}
        const { symbol, side, quantity, price } = payload

        if (!symbol || !side || !quantity || !price) {
          jsonResponse(res, 400, { error: 'Missing order details' })
          return
        }

        jsonResponse(res, 200, {
          success: true,
          order: {
            symbol,
            side,
            quantity,
            price,
            status: 'queued',
            broker: 'paper-trading',
            orderId: `ord_${Date.now()}`,
          },
        })
      } catch (error) {
        jsonResponse(res, 400, { error: 'Invalid JSON payload' })
      }
    })
    return
  }

  jsonResponse(res, 404, { error: 'Not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`DayTrade API running on http://${HOST}:${PORT}`)
})
