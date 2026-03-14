import { TrendingUp, TrendingDown, Wallet, PieChart, Activity, Target } from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'

interface PortfolioStatsProps {
  stats?: {
    totalValue: number
    cashBalance: number
    totalReturn: number
    totalPnL: number
    dayChange: number
    dayChangePct: number
  }
}

// Mock stats
const mockStats = {
  totalValue: 1245680.50,
  cashBalance: 245680.50,
  totalReturn: 24.57,
  totalPnL: 245680.50,
  dayChange: 12450.25,
  dayChangePct: 1.01,
}

export function PortfolioStats({ stats = mockStats }: PortfolioStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Portfolio Value */}
      <StatCard
        title="Portfolio Value"
        value={formatCurrency(stats.totalValue)}
        change={stats.dayChangePct}
        changeLabel={`${formatCurrency(stats.dayChange)} today`}
        icon={Wallet}
      />
      
      {/* Total Return */}
      <StatCard
        title="Total Return"
        value={formatPercent(stats.totalReturn)}
        change={stats.totalReturn}
        changeLabel={formatCurrency(stats.totalPnL)}
        icon={TrendingUp}
        isPercentValue
      />
      
      {/* Cash Balance */}
      <StatCard
        title="Cash Balance"
        value={formatCurrency(stats.cashBalance)}
        subtitle="Available to trade"
        icon={PieChart}
        neutral
      />
      
      {/* Day Performance */}
      <StatCard
        title="Day Performance"
        value={formatPercent(stats.dayChangePct)}
        change={stats.dayChangePct}
        changeLabel={formatCurrency(stats.dayChange)}
        icon={Activity}
        isPercentValue
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  subtitle?: string
  icon: typeof TrendingUp
  isPercentValue?: boolean
  neutral?: boolean
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  subtitle,
  icon: Icon,
  isPercentValue,
  neutral 
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true
  
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg',
          neutral ? 'bg-muted' : isPositive ? 'bg-success/10' : 'bg-destructive/10'
        )}>
          <Icon className={cn(
            'h-5 w-5',
            neutral ? 'text-muted-foreground' : isPositive ? 'text-success' : 'text-destructive'
          )} />
        </div>
      </div>
      
      <div className="mt-3">
        <p className={cn(
          'text-2xl font-bold',
          isPercentValue 
            ? (isPositive ? 'text-success' : 'text-destructive')
            : 'text-foreground'
        )}>
          {value}
        </p>
        
        {changeLabel && change !== undefined && (
          <div className="mt-1 flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            )}
            <span className={cn(
              'text-sm',
              isPositive ? 'text-success' : 'text-destructive'
            )}>
              {changeLabel}
            </span>
          </div>
        )}
        
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
