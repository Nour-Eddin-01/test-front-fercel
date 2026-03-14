import { ViewProvider, useView } from './context/ViewContext'
import { MainLayout } from './components/layout/MainLayout'
import { SocialFeed } from './components/social/SocialFeed'
import { MarketDashboard } from './components/market/MarketDashboard'

function AppContent() {
  const { viewMode } = useView()

  return (
    <MainLayout>
      {viewMode === 'social' ? <SocialFeed /> : <MarketDashboard />}
    </MainLayout>
  )
}

function App() {
  return (
    <ViewProvider>
      <AppContent />
    </ViewProvider>
  )
}

export default App
