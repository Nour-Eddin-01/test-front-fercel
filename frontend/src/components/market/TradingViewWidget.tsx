import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol?: string
  theme?: 'dark' | 'light'
  height?: number
}

declare global {
  interface Window {
    TradingView: any
  }
}

export function TradingViewWidget({ 
  symbol = 'MOEX:MTLR', 
  theme = 'dark',
  height = 500 
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: 'D',
          timezone: 'Africa/Casablanca',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#0a0e14',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          hide_side_toolbar: false,
          studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [symbol, theme])

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div 
        id="tradingview_widget" 
        ref={containerRef}
        style={{ height }}
      />
    </div>
  )
}

// Alternative: Simple chart component using Recharts for when TradingView is not needed
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface SimpleChartProps {
  data: { time: string; price: number }[]
  height?: number
  color?: 'success' | 'destructive'
}

export function SimpleChart({ data, height = 300, color = 'success' }: SimpleChartProps) {
  const strokeColor = color === 'success' ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)'
  const fillColor = color === 'success' ? 'hsl(142 71% 45% / 0.1)' : 'hsl(0 84% 60% / 0.1)'

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(217 33% 17%)" 
            vertical={false}
          />
          <XAxis 
            dataKey="time" 
            stroke="hsl(215 20% 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(215 20% 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222 47% 9%)',
              border: '1px solid hsl(217 33% 17%)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(210 40% 98%)' }}
            itemStyle={{ color: strokeColor }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
