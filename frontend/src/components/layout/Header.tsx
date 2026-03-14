import { Search, Bell, LineChart, Users2 } from 'lucide-react'
import { useView } from '../../context/ViewContext'
import { cn } from '../../lib/utils'

export function Header() {
  const { viewMode, toggleViewMode } = useView()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stocks, users..."
            className="h-10 w-80 rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Center Section - View Toggle */}
      <div className="flex items-center">
        <div className="flex items-center rounded-lg border border-border bg-background p-1">
          <button
            onClick={() => toggleViewMode()}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              viewMode === 'social'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users2 className="h-4 w-4" />
            Social
          </button>
          <button
            onClick={() => toggleViewMode()}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              viewMode === 'market'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LineChart className="h-4 w-4" />
            Live Market
          </button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        <MarketStatus />
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60" />
      </div>
    </header>
  )
}

function MarketStatus() {
  const isMarketOpen = isMarketHours()

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          isMarketOpen ? 'bg-success animate-pulse' : 'bg-muted-foreground'
        )}
      />
      <span className="text-xs font-medium text-muted-foreground">
        {isMarketOpen ? 'Market Open' : 'Market Closed'}
      </span>
    </div>
  )
}

function isMarketHours(): boolean {
  const now = new Date()
  const moroccoTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }))
  const hours = moroccoTime.getHours()
  const day = moroccoTime.getDay()
  
  // Casablanca Stock Exchange: Mon-Fri, 9:30 AM - 3:30 PM
  if (day === 0 || day === 6) return false
  if (hours < 9 || hours >= 16) return false
  if (hours === 9 && moroccoTime.getMinutes() < 30) return false
  if (hours === 15 && moroccoTime.getMinutes() > 30) return false
  
  return true
}
