export default function PortfolioComparison({ holdings, marketData }) {
  const rows = holdings.map((holding) => {
    const market = marketData.find((item) => item.symbol === holding.symbol)
    const currentPrice = market?.price || holding.avgPrice || 0
    const currentValue = holding.units * currentPrice
    const pnl = (currentPrice - holding.avgPrice) * holding.units

    return {
      ...holding,
      currentPrice,
      currentValue,
      pnl,
      change: market?.change || 0,
    }
  })

  return (
    <div className="card bg-dark border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="text-uppercase text-primary small fw-bold mb-1">Portfolio</p>
            <h3 className="h5 mb-0 text-white">Performance</h3>
          </div>
          <span className="badge bg-success-subtle text-success">Live</span>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-borderless align-middle mb-0">
            <thead>
              <tr className="text-secondary small text-uppercase">
                <th>Symbol</th>
                <th>Price</th>
                <th>P&L</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.symbol}>
                  <td className="text-white fw-semibold">{row.symbol}</td>
                  <td className="text-white">
                    {row.symbol.includes('JPY') ? Number(row.currentPrice).toFixed(2) : Number(row.currentPrice).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </td>
                  <td className={row.pnl >= 0 ? 'text-success' : 'text-danger'}>
                    ${row.pnl.toFixed(2)}
                  </td>
                  <td className="text-white">${row.currentValue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
