import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { cn, formatPercent, formatNumber, formatVolume } from '@/lib/utils'

// Mock Moroccan market indices
const marketIndices = [
  { name: 'MASI', value: 13245.67, change: 1.24, volume: 125000000 },
  { name: 'MADEX', value: 10856.34, change: 1.18, volume: 98000000 },
  { name: 'MSI 20', value: 1089.45, change: -0.35, volume: 45000000 },
]

// Mock sector performance
const sectorPerformance = [
  { name: 'Banking', change: 2.15, leaders: ['ATW', 'BCP', 'CIH'] },
  { name: 'Telecom', change: 1.85, leaders: ['IAM', 'INWI'] },
  { name: 'Real Estate', change: -0.45, leaders: ['ADH', 'RDS'] },
  { name: 'Mining', change: -1.20, leaders: ['MNG', 'CMT'] },
  { name: 'Energy', change: 0.75, leaders: ['TQM', 'GAZ'] },
]

export function MarketOverview() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Market Indices */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Casablanca Indices</h3>
        </div>
        <div className="divide-y divide-border">
          {marketIndices.map((index) => (
            <div key={index.name} className="flex items-center justify-between px-4 py-4">
              <div>
                <h4 className="font-semibold text-foreground">{index.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Vol: {formatVolume(index.volume)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold text-foreground">
                  {formatNumber(index.value)}
                </p>
                <div className={cn(
                  'flex items-center justify-end gap-1 text-sm font-medium',
                  index.change >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {index.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatPercent(index.change)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Performance */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Sector Performance</h3>
        </div>
        <div className="divide-y divide-border">
          {sectorPerformance.map((sector) => (
            <div key={sector.name} className="flex items-center justify-between px-4 py-3">
              <div>
                <h4 className="font-medium text-foreground">{sector.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {sector.leaders.join(', ')}
                </p>
              </div>
              <div className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1',
                sector.change >= 0 
                  ? 'bg-success/10 text-success' 
                  : 'bg-destructive/10 text-destructive'
              )}>
                {sector.change >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span className="text-sm font-medium">{formatPercent(sector.change)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
