export default function Sidebar({ activeView, setActiveView }) {
  const navItems = [
    { key: 'markets', label: 'Dashboard' },
    { key: 'forex', label: 'Forex' },
    { key: 'crypto', label: 'Crypto' },
    { key: 'commodities', label: 'Commodities' },
  ]

  return (
    <aside className="d-flex flex-column bg-dark border border-secondary rounded-4 p-3" style={{ width: '220px', minHeight: '760px' }}>
      <div className="mb-4">
        <div className="text-uppercase text-primary small fw-bold">Trade desk</div>
        <h2 className="h4 text-white mt-2 mb-0">DayTrade Pro</h2>
      </div>

      <nav className="d-flex flex-column gap-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`btn text-start ${activeView === item.key ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
            onClick={() => setActiveView(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="card bg-black bg-opacity-25 border-secondary">
          <div className="card-body">
            <div className="text-secondary small text-uppercase">Balance</div>
            <div className="fw-bold text-white fs-5">$24.8k</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
