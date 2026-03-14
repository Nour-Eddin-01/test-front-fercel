import { CreatePost } from './CreatePost'
import { PostCard } from './PostCard'
import { TrendingStocks } from './TrendingStocks'
import { Leaderboard } from './Leaderboard'

// Mock feed data
const mockPosts = [
  {
    id: '1',
    author: {
      username: 'AmineTrade',
      level: 15,
      skillLevel: 'expert',
    },
    text: 'IAM looking strong today! The telecom sector in Morocco is showing bullish momentum. Good time to watch for entry points around the 130 MAD support level.',
    stock: {
      isin: 'IAM',
      name: 'Maroc Telecom',
      currentPrice: 132.50,
      changePercent: 2.45,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    _count: { reactions: 24, comments: 8 },
  },
  {
    id: '2',
    author: {
      username: 'CasaTrader',
      level: 12,
      skillLevel: 'intermediate',
    },
    text: 'Banking sector consolidating after last week\'s rally. ATW and BCP both showing healthy pullbacks. Watching for continuation patterns before adding more positions.',
    stock: {
      isin: 'ATW',
      name: 'Attijariwafa Bank',
      currentPrice: 485.00,
      changePercent: -1.20,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    _count: { reactions: 18, comments: 5 },
  },
  {
    id: '3',
    author: {
      username: 'MarrakechBull',
      level: 8,
      skillLevel: 'intermediate',
    },
    text: 'Great week for my portfolio! Up 3.2% this week thanks to my BCP position. Remember: patience and discipline are key in this market.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    _count: { reactions: 42, comments: 12 },
  },
  {
    id: '4',
    author: {
      username: 'RabatInvestor',
      level: 6,
      skillLevel: 'beginner',
    },
    text: 'Just started trading on the Casablanca Stock Exchange. Any tips for a beginner? Looking to build a diversified portfolio focusing on dividend stocks.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    _count: { reactions: 15, comments: 23 },
  },
]

export function SocialFeed() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        <CreatePost />
        
        {/* Feed Posts */}
        <div className="space-y-4">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <TrendingStocks />
        <Leaderboard />
      </div>
    </div>
  )
}
