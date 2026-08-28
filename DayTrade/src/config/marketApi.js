export async function fetchLiveMarketData() {
  const response = await fetch('/api/market')

  if (!response.ok) {
    throw new Error('Unable to load market data from the trading API.')
  }

  return response.json()
}

export function getTimelineLabels(length = 7) {
  const labels = []
  const now = new Date()

  for (let index = length - 1; index >= 0; index -= 1) {
    const time = new Date(now.getTime() - index * 60 * 60 * 1000)
    labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }

  return labels
}
