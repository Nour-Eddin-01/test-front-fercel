export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string
  bio?: string
  skillLevel: 'beginner' | 'intermediate' | 'expert'
  totalBalance: number
  totalReturn: number
  totalPnL: number
  level: number
  xp: number
  isOnline: boolean
  lastSeenAt?: string
  createdAt: string
}

export interface Stock {
  id: string
  isin: string
  name: string
  sector: string
  currentPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  volume: number
  change?: number
  changePercent?: number
}

export interface Position {
  id: string
  stockId: string
  stock: Stock
  quantity: number
  averageCost: number
  currentPrice: number
  totalValue: number
  pnl: number
  pnlPercent: number
}

export interface Trade {
  id: string
  stockId: string
  stock: Stock
  type: 'buy' | 'sell'
  quantity: number
  price: number
  totalValue: number
  executedAt: string
}

export interface Portfolio {
  id: string
  userId: string
  totalValue: number
  cashBalance: number
  positions: Position[]
}

export interface Post {
  id: string
  authorId: string
  author: User
  text?: string
  imageUrl?: string
  linkUrl?: string
  stockId?: string
  stock?: Stock
  visibility: 'public' | 'followers'
  createdAt: string
  updatedAt: string
  comments: PostComment[]
  reactions: PostReaction[]
  _count?: {
    comments: number
    reactions: number
  }
}

export interface PostComment {
  id: string
  postId: string
  authorId: string
  author: User
  content: string
  createdAt: string
}

export interface PostReaction {
  id: string
  postId: string
  userId: string
  user: User
  type: 'like' | 'love' | 'insightful'
  createdAt: string
}

export interface LeaderboardEntry {
  id: string
  userId: string
  user: User
  rank: number
  totalReturnPct: number
  totalPnL: number
  tradesCount: number
  winRate: number
}

export interface PriceHistory {
  id: string
  stockId: string
  price: number
  timestamp: string
}

export type ViewMode = 'social' | 'market'
