import { Trophy, Crown, Medal, Award } from 'lucide-react'
import { cn, formatPercent, formatCurrency } from '@/lib/utils'

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, username: 'AmineTrade', avatar: null, returnPct: 45.6, pnl: 456000, winRate: 72 },
  { rank: 2, username: 'CasaTrader', avatar: null, returnPct: 38.2, pnl: 382000, winRate: 68 },
  { rank: 3, username: 'MarrakechBull', avatar: null, returnPct: 32.8, pnl: 328000, winRate: 65 },
  { rank: 4, username: 'RabatInvestor', avatar: null, returnPct: 28.4, pnl: 284000, winRate: 61 },
  { rank: 5, username: 'FesTrader', avatar: null, returnPct: 24.1, pnl: 241000, winRate: 58 },
]

export function Leaderboard() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold text-foreground">Top Traders</h3>
      </div>
      <div className="divide-y divide-border">
        {leaderboardData.map((trader) => (
          <div
            key={trader.username}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
          >
            {/* Rank Badge */}
            <div className="relative">
              {trader.rank === 1 && (
                <Crown className="h-6 w-6 text-yellow-500" />
              )}
              {trader.rank === 2 && (
                <Medal className="h-6 w-6 text-gray-400" />
              )}
              {trader.rank === 3 && (
                <Award className="h-6 w-6 text-amber-600" />
              )}
              {trader.rank > 3 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {trader.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className={cn(
              'h-10 w-10 rounded-full',
              trader.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
              trader.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
              trader.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
              'bg-gradient-to-br from-primary to-primary/60'
            )} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-foreground">{trader.username}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Win Rate: {trader.winRate}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className={cn(
                'font-mono text-sm font-semibold',
                trader.returnPct >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {formatPercent(trader.returnPct)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(trader.pnl)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-3">
        <button className="w-full rounded-lg py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/10">
          Full Leaderboard
        </button>
      </div>
    </div>
  )
}
