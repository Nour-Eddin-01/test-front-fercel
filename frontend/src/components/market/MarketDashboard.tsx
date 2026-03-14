import { PortfolioStats } from './PortfolioStats'
import { MarketOverview } from './MarketOverview'
import { PositionsTable } from './PositionsTable'
import { SimpleChart } from './TradingViewWidget'

// Mock chart data
const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  time: `${i + 1}`,
  price: 13000 + Math.random() * 500 + i * 10,
}))

export function MarketDashboard() {
  return (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <PortfolioStats />

      {/* Main Chart */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="font-semibold text-foreground">MASI Index</h3>
                <p className="text-sm text-muted-foreground">Moroccan All Shares Index</p>
              </div>
              <div className="flex items-center gap-2">
                {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((period) => (
                  <button
                    key={period}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    data-active={period === '1M'}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <SimpleChart data={mockChartData} height={350} color="success" />
            </div>
          </div>
        </div>

        {/* Quick Trade Panel */}
        <div className="space-y-4">
          <QuickTradePanel />
          <RecentTrades />
        </div>
      </div>

      {/* Market Overview */}
      <MarketOverview />

      {/* Positions Table */}
      <PositionsTable />
    </div>
  )
}

function QuickTradePanel() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold text-foreground">Quick Trade</h3>
      
      <div className="space-y-4">
        {/* Stock Input */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Stock
          </label>
          <input
            type="text"
            placeholder="Search by ISIN..."
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Quantity Input */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Quantity
          </label>
          <input
            type="number"
            placeholder="0"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Trade Type Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="h-11 rounded-lg bg-success font-semibold text-success-foreground transition-colors hover:bg-success/90">
            Buy
          </button>
          <button className="h-11 rounded-lg bg-destructive font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90">
            Sell
          </button>
        </div>
      </div>
    </div>
  )
}

function RecentTrades() {
  const trades = [
    { type: 'buy', stock: 'IAM', qty: 100, price: 131.50, time: '14:32' },
    { type: 'sell', stock: 'MNG', qty: 25, price: 1430.00, time: '11:15' },
    { type: 'buy', stock: 'BCP', qty: 50, price: 294.20, time: '10:45' },
  ]

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground">Recent Trades</h3>
      </div>
      <div className="divide-y divide-border">
        {trades.map((trade, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${trade.type === 'buy' ? 'bg-success' : 'bg-destructive'}`} />
              <div>
                <p className="font-medium text-foreground">{trade.stock}</p>
                <p className="text-xs text-muted-foreground">
                  {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.qty}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-foreground">{trade.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{trade.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
