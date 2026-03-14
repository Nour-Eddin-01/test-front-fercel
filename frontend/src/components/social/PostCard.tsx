import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react'
import { cn, formatPercent, getChangeBgColor } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface PostCardProps {
  post: {
    id: string
    author: {
      username: string
      avatarUrl?: string
      level: number
      skillLevel: string
    }
    text?: string
    stock?: {
      isin: string
      name: string
      currentPrice: number
      changePercent?: number
    }
    createdAt: string
    _count?: {
      reactions: number
      comments: number
    }
  }
}

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  const changePercent = post.stock?.changePercent ?? 0

  return (
    <article className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/80">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary/60" />
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-secondary text-[10px] font-bold text-foreground">
              {post.author.level}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{post.author.username}</span>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                post.author.skillLevel === 'expert' ? 'bg-primary/20 text-primary' :
                post.author.skillLevel === 'intermediate' ? 'bg-success/20 text-success' :
                'bg-muted text-muted-foreground'
              )}>
                {post.author.skillLevel}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
        <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      {post.text && (
        <p className="mt-4 text-sm leading-relaxed text-foreground">{post.text}</p>
      )}

      {/* Stock Mention Card */}
      {post.stock && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {changePercent >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div>
              <span className="font-semibold text-foreground">{post.stock.isin}</span>
              <p className="text-xs text-muted-foreground">{post.stock.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold text-foreground">
              {post.stock.currentPrice.toFixed(2)} MAD
            </p>
            <span className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              getChangeBgColor(changePercent)
            )}>
              {formatPercent(changePercent)}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
            <Heart className="h-4 w-4" />
            <span>{post._count?.reactions ?? 0}</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
            <MessageCircle className="h-4 w-4" />
            <span>{post._count?.comments ?? 0}</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
