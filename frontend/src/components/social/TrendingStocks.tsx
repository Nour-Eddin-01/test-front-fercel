import { TrendingUp, TrendingDown, Flame } from 'lucide-react'
import { cn, formatPercent, getChangeColor } from '@/lib/utils'

// Mock data for Moroccan stocks
const trendingStocks = [
  { isin: 'IAM', name: 'Maroc Telecom', price: 132.50, change: 2.45 },
  { isin: 'ATW', name: 'Attijariwafa Bank', price: 485.00, change: -1.20 },
  { isin: 'BCP', name: 'Banque Centrale Populaire', price: 295.80, change: 3.15 },
  { isin: 'LHM', name: 'LafargeHolcim Maroc', price: 1850.00, change: 0.85 },
  { isin: 'MNG', name: 'Managem', price: 1425.00, change: -2.30 },
]

export function TrendingStocks() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Flame className="h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-foreground">Trending in Morocco</h3>
      </div>
      <div className="divide-y divide-border">
        {trendingStocks.map((stock, index) => (
          <div
            key={stock.isin}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{stock.isin}</span>
                  {stock.change > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stock.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-medium text-foreground">
                {stock.price.toFixed(2)}
              </p>
              <span className={cn('text-xs font-medium', getChangeColor(stock.change))}>
                {formatPercent(stock.change)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-3">
        <button className="w-full rounded-lg py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/10">
          View All Markets
        </button>
      </div>
    </div>
  )
}
