import { 
  Home, 
  TrendingUp, 
  Briefcase, 
  Users, 
  Bell, 
  Settings, 
  BarChart3,
  MessageSquare,
  Trophy,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useView } from '@/context/ViewContext'

const socialNavItems = [
  { icon: Home, label: 'Feed', href: '/' },
  { icon: TrendingUp, label: 'Trending', href: '/trending' },
  { icon: Users, label: 'Following', href: '/following' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: MessageSquare, label: 'Messages', href: '/messages' },
]

const marketNavItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/' },
  { icon: TrendingUp, label: 'Markets', href: '/markets' },
  { icon: Briefcase, label: 'Portfolio', href: '/portfolio' },
  { icon: Wallet, label: 'Positions', href: '/positions' },
]

const bottomNavItems = [
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const { viewMode } = useView()
  const navItems = viewMode === 'social' ? socialNavItems : marketNavItems

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">TradeHub</h1>
            <p className="text-xs text-muted-foreground">Bourse de Casablanca</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="mb-2 px-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {viewMode === 'social' ? 'Social' : 'Trading'}
            </span>
          </div>
          {navItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border px-3 py-4">
          {bottomNavItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Trader Pro</p>
              <p className="truncate text-xs text-muted-foreground">Level 12</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ 
  icon: Icon, 
  label, 
  href, 
  active = false 
}: { 
  icon: typeof Home
  label: string
  href: string
  active?: boolean 
}) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </a>
  )
}
