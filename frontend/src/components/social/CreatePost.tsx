import { useState } from 'react'
import { Image, Link, TrendingUp, Send, Globe, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreatePostProps {
  onSubmit?: (data: { text: string; visibility: string }) => void
}

export function CreatePost({ onSubmit }: CreatePostProps) {
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = () => {
    if (!text.trim()) return
    onSubmit?.({ text, visibility })
    setText('')
  }

  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 transition-colors',
      isFocused ? 'border-primary/50' : 'border-border'
    )}>
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60" />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Share your market insights..."
            className="min-h-[80px] w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            rows={3}
          />
          
          {/* Actions Bar */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Image className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Link className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-success/10 hover:text-success">
                <TrendingUp className="h-5 w-5" />
              </button>
              
              {/* Visibility Toggle */}
              <div className="ml-2 flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setVisibility('public')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-l-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                    visibility === 'public'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Public
                </button>
                <button
                  onClick={() => setVisibility('followers')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-r-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                    visibility === 'followers'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  Followers
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                text.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <Send className="h-4 w-4" />
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
