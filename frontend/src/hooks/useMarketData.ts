import { useState, useEffect } from 'react'

// Types matching the scraper output
export interface StockData {
  isin: string
  name: string
  currentPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  changePercent: number
  volume: number
  sector: string
  lastUpdated: Date
}

export interface MarketIndex {
  name: string
  value: number
  change: number
  changePercent: number
}

// Moroccan stock base data for simulation
const MOROCCAN_STOCKS = [
  { isin: 'IAM', name: 'Maroc Telecom', sector: 'Telecom', basePrice: 130 },
  { isin: 'ATW', name: 'Attijariwafa Bank', sector: 'Banking', basePrice: 480 },
  { isin: 'BCP', name: 'Banque Centrale Populaire', sector: 'Banking', basePrice: 290 },
  { isin: 'BOA', name: 'Bank of Africa', sector: 'Banking', basePrice: 185 },
  { isin: 'CIH', name: 'CIH Bank', sector: 'Banking', basePrice: 340 },
  { isin: 'LHM', name: 'LafargeHolcim Maroc', sector: 'Construction', basePrice: 1800 },
  { isin: 'MNG', name: 'Managem', sector: 'Mining', basePrice: 1400 },
  { isin: 'CMT', name: 'CMT', sector: 'Mining', basePrice: 1650 },
  { isin: 'ADH', name: 'Addoha', sector: 'Real Estate', basePrice: 12 },
  { isin: 'RDS', name: 'Residences Dar Saada', sector: 'Real Estate', basePrice: 45 },
  { isin: 'TQM', name: 'Taqa Morocco', sector: 'Energy', basePrice: 1150 },
  { isin: 'GAZ', name: 'Afriquia Gaz', sector: 'Energy', basePrice: 4200 },
  { isin: 'SNP', name: 'Sonasid', sector: 'Steel', basePrice: 265 },
  { isin: 'LBV', name: 'Label Vie', sector: 'Retail', basePrice: 4500 },
  { isin: 'COL', name: 'Cosumar', sector: 'Food', basePrice: 195 },
  { isin: 'WAA', name: 'Wafa Assurance', sector: 'Insurance', basePrice: 4100 },
]

/**
 * Generate simulated real-time stock data
 * In production, this would fetch from your backend API
 */
function generateStockData(): StockData[] {
  return MOROCCAN_STOCKS.map(({ isin, name, sector, basePrice }) => {
    const volatility = 0.02
    const changePercent = (Math.random() - 0.5) * volatility * 100
    const currentPrice = basePrice * (1 + changePercent / 100)
    
    return {
      isin,
      name,
      sector,
      currentPrice: Math.round(currentPrice * 100) / 100,
      openPrice: basePrice,
      highPrice: Math.round(currentPrice * 1.01 * 100) / 100,
      lowPrice: Math.round(currentPrice * 0.99 * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 100000) + 10000,
      lastUpdated: new Date(),
    }
  })
}

function generateIndices(): MarketIndex[] {
  const baseIndices = [
    { name: 'MASI', baseValue: 13245.67 },
    { name: 'MADEX', baseValue: 10856.34 },
    { name: 'MSI 20', baseValue: 1089.45 },
  ]

  return baseIndices.map(({ name, baseValue }) => {
    const changePercent = (Math.random() - 0.5) * 2
    const change = baseValue * (changePercent / 100)
    
    return {
      name,
      value: Math.round((baseValue + change) * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    }
  })
}

/**
 * Hook to fetch and update market data
 */
export function useMarketData(refreshInterval = 30000) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In production, fetch from your backend API:
        // const response = await fetch('/api/stocks')
        // const data = await response.json()
        
        // For demo, use simulated data
        setStocks(generateStockData())
        setIndices(generateIndices())
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch market data'))
        setIsLoading(false)
      }
    }

    fetchData()

    // Refresh data periodically
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { stocks, indices, isLoading, error }
}

/**
 * Hook for a single stock
 */
export function useStock(isin: string) {
  const { stocks, isLoading, error } = useMarketData()
  const stock = stocks.find(s => s.isin === isin)
  
  return { stock, isLoading, error }
}

/**
 * Hook for stocks filtered by sector
 */
export function useStocksBySector(sector: string) {
  const { stocks, isLoading, error } = useMarketData()
  const filteredStocks = stocks.filter(s => s.sector === sector)
  
  return { stocks: filteredStocks, isLoading, error }
}

/**
 * Hook for top gainers/losers
 */
export function useTopMovers(count = 5) {
  const { stocks, isLoading, error } = useMarketData()
  
  const gainers = [...stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, count)
  
  const losers = [...stocks]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, count)
  
  return { gainers, losers, isLoading, error }
}
