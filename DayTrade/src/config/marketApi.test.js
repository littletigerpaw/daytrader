import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchLiveMarketData } from './marketApi.js'

test('fetchLiveMarketData uses live API data instead of demo values when available', async () => {
  const originalFetch = global.fetch

  global.fetch = async (url) => {
    if (url.includes('coinbase.com')) {
      return {
        ok: true,
        json: async () => ({ data: { amount: '62140.18' } }),
      }
    }

    if (url.includes('open.er-api.com')) {
      return {
        ok: true,
        json: async () => ({ rates: { EUR: 0.92, GBP: 0.79, AUD: 1.54, JPY: 145.2 } }),
      }
    }

    if (url.includes('api.gold-api.com')) {
      return {
        ok: true,
        json: async () => ({ price: 2340.5 }),
      }
    }

    throw new Error(`Unexpected URL: ${url}`)
  }

  try {
    const result = await fetchLiveMarketData()
    assert.equal(result.liveStatus, 'live')
    assert.ok(result.marketData.some((item) => item.symbol === 'BTC/USD' && item.price > 60000))
    assert.ok(result.marketData.some((item) => item.symbol === 'EUR/USD' && item.price > 0.9))
  } finally {
    global.fetch = originalFetch
  }
})
