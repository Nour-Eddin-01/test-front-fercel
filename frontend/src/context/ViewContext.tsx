import { createContext, useContext, useState, type ReactNode } from 'react'

type ViewMode = 'social' | 'market'

interface ViewContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('social')

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'social' ? 'market' : 'social'))
  }

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </ViewContext.Provider>
  )
}

export function useView() {
  const context = useContext(ViewContext)
  if (!context) {
    throw new Error('useView must be used within a ViewProvider')
  }
  return context
}
