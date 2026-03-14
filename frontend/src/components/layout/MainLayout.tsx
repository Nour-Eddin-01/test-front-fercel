import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Watchlist } from '@/components/watchlist/Watchlist'
import { useView } from '@/context/ViewContext'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { viewMode } = useView()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64">
        <Header />
        
        <div className="flex">
          {/* Main Content Area */}
          <main className="flex-1 p-6">
            {children}
          </main>
          
          {/* Right Sidebar - Watchlist */}
          <aside className="sticky top-16 h-[calc(100vh-4rem)] w-80 shrink-0 overflow-y-auto border-l border-border bg-card p-4">
            <Watchlist />
          </aside>
        </div>
      </div>
    </div>
  )
}
