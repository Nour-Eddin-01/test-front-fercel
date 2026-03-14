import { useState } from 'react'
import { Star, Plus, TrendingUp, TrendingDown, Search, X, Eye } from 'lucide-react'
import { cn, formatPercent, getChangeColor } from '../../lib/utils'

// Mock watchlist data - Moroccan stocks
const mockWatchlist = [
  { isin: 'IAM', name: 'Maroc Telecom', price: 132.50, change: 2.45, sector: 'Telecom' },
  { isin: 'ATW', name: 'Attijariwafa Bank', price: 485.00, change: -1.20, sector: 'Banking' },
  { isin: 'BCP', name: 'Banque Centrale Populaire', price: 295.80, change: 3.15, sector: 'Banking' },
  { isin: 'LHM', name: 'LafargeHolcim Maroc', price: 1850.00, change: 0.85, sector: 'Construction' },
  { isin: 'MNG', name: 'Managem', price: 1425.00, change: -2.30, sector: 'Mining' },
  { isin: 'CIH', name: 'CIH Bank', price: 345.50, change: 1.75, sector: 'Banking' },
  { isin: 'ADH', name: 'Addoha', price: 12.85, change: -0.50, sector: 'Real Estate' },
  { isin: 'TQM', name: 'Taqa Morocco', price: 1180.00, change: 0.65, sector: 'Energy' },
]

export function Watchlist() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  const filteredStocks = mockWatchlist.filter(
    stock => 
      stock.isin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Watchlist</h2>
        </div>
        <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stocks..."
          className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Stock List */}
      <div className="flex-1 -mx-4 overflow-y-auto">
        <div className="divide-y divide-border">
          {filteredStocks.map((stock) => (
            <WatchlistItem
              key={stock.isin}
              stock={stock}
              isSelected={selectedStock === stock.isin}
              onSelect={() => setSelectedStock(stock.isin)}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Gainers</span>
          <span className="font-medium text-success">
            {mockWatchlist.filter(s => s.change > 0).length}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Losers</span>
          <span className="font-medium text-destructive">
            {mockWatchlist.filter(s => s.change < 0).length}
          </span>
        </div>
      </div>
    </div>
  )
}

interface WatchlistItemProps {
  stock: {
    isin: string
    name: string
    price: number
    change: number
    sector: string
  }
  isSelected: boolean
  onSelect: () => void
}

function WatchlistItem({ stock, isSelected, onSelect }: WatchlistItemProps) {
  const [isStarred, setIsStarred] = useState(false)

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
        isSelected ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-muted/50'
      )}
    >
      {/* Star */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsStarred(!isStarred)
        }}
        className={cn(
          'shrink-0 transition-colors',
          isStarred ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'
        )}
      >
        <Star className={cn('h-4 w-4', isStarred && 'fill-current')} />
      </button>

      {/* Stock Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{stock.isin}</span>
          {stock.change >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{stock.name}</p>
      </div>

      {/* Price Info */}
      <div className="text-right">
        <p className="font-mono text-sm font-medium text-foreground">
          {stock.price.toFixed(2)}
        </p>
        <span className={cn(
          'text-xs font-medium',
          getChangeColor(stock.change)
        )}>
          {formatPercent(stock.change)}
        </span>
      </div>
    </div>
  )
}
