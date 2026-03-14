import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react'
import { cn, formatCurrency, formatPercent, formatNumber } from '@/lib/utils'

// Mock positions data
const mockPositions = [
  {
    id: '1',
    stock: { isin: 'IAM', name: 'Maroc Telecom', sector: 'Telecom' },
    quantity: 500,
    averageCost: 125.50,
    currentPrice: 132.50,
    totalValue: 66250,
    pnl: 3500,
    pnlPercent: 5.58,
  },
  {
    id: '2',
    stock: { isin: 'ATW', name: 'Attijariwafa Bank', sector: 'Banking' },
    quantity: 200,
    averageCost: 495.00,
    currentPrice: 485.00,
    totalValue: 97000,
    pnl: -2000,
    pnlPercent: -2.02,
  },
  {
    id: '3',
    stock: { isin: 'BCP', name: 'Banque Centrale Populaire', sector: 'Banking' },
    quantity: 350,
    averageCost: 280.00,
    currentPrice: 295.80,
    totalValue: 103530,
    pnl: 5530,
    pnlPercent: 5.64,
  },
  {
    id: '4',
    stock: { isin: 'LHM', name: 'LafargeHolcim Maroc', sector: 'Construction' },
    quantity: 50,
    averageCost: 1780.00,
    currentPrice: 1850.00,
    totalValue: 92500,
    pnl: 3500,
    pnlPercent: 3.93,
  },
  {
    id: '5',
    stock: { isin: 'MNG', name: 'Managem', sector: 'Mining' },
    quantity: 75,
    averageCost: 1500.00,
    currentPrice: 1425.00,
    totalValue: 106875,
    pnl: -5625,
    pnlPercent: -5.00,
  },
]

export function PositionsTable() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground">Open Positions</h3>
        <span className="text-sm text-muted-foreground">{mockPositions.length} positions</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Avg Cost
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Value
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                P/L
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockPositions.map((position) => (
              <tr 
                key={position.id} 
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-xs font-bold text-primary">
                        {position.stock.isin.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{position.stock.isin}</p>
                      <p className="text-xs text-muted-foreground">{position.stock.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                  {formatNumber(position.quantity)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                  {position.averageCost.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                  {position.currentPrice.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm font-medium text-foreground">
                  {formatCurrency(position.totalValue)}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={cn(
                      'flex items-center gap-1 font-mono text-sm font-medium',
                      position.pnl >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {position.pnl >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {formatCurrency(Math.abs(position.pnl))}
                    </span>
                    <span className={cn(
                      'text-xs',
                      position.pnlPercent >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {formatPercent(position.pnlPercent)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
