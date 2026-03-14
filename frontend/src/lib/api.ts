const API_BASE = '/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'An error occurred')
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    this.setToken(data.access_token)
    return data
  }

  async register(email: string, username: string, password: string) {
    return this.request<{ access_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    })
  }

  // Stocks
  async getStocks(params?: { page?: number; limit?: number; sector?: string; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.sector) searchParams.set('sector', params.sector)
    if (params?.search) searchParams.set('search', params.search)
    
    return this.request<{ data: any[]; meta: any }>(`/stocks?${searchParams}`)
  }

  async getStockByIsin(isin: string) {
    return this.request<any>(`/stocks/isin/${isin}`)
  }

  async getStockHistory(id: string, params?: { limit?: number; from?: string; to?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    
    return this.request<any[]>(`/stocks/${id}/history?${searchParams}`)
  }

  // Portfolio
  async getPortfolio() {
    return this.request<any>('/portfolio')
  }

  async getPortfolioStats() {
    return this.request<any>('/portfolio/stats')
  }

  async getPerformance(days = 30) {
    return this.request<any[]>(`/portfolio/performance?days=${days}`)
  }

  // Trading
  async buyStock(stockId: string, quantity: number) {
    return this.request<any>('/trading/buy', {
      method: 'POST',
      body: JSON.stringify({ stockId, quantity }),
    })
  }

  async sellStock(stockId: string, quantity: number) {
    return this.request<any>('/trading/sell', {
      method: 'POST',
      body: JSON.stringify({ stockId, quantity }),
    })
  }

  async getPositions() {
    return this.request<any[]>('/trading/positions')
  }

  async getTradeHistory() {
    return this.request<any[]>('/trading/history')
  }

  // Posts
  async getFeed() {
    return this.request<any[]>('/posts/feed')
  }

  async createPost(data: { text?: string; imageUrl?: string; stockId?: string; visibility?: string }) {
    return this.request<any>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async reactToPost(postId: string, type: string) {
    return this.request<any>(`/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    })
  }

  async commentOnPost(postId: string, content: string) {
    return this.request<any>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  // Social
  async followUser(userId: string) {
    return this.request<any>(`/social/follow/${userId}`, { method: 'POST' })
  }

  async unfollowUser(userId: string) {
    return this.request<any>(`/social/unfollow/${userId}`, { method: 'DELETE' })
  }

  async getFollowers() {
    return this.request<any[]>('/social/followers')
  }

  async getFollowing() {
    return this.request<any[]>('/social/following')
  }
}

export const api = new ApiClient()

// SWR fetcher
export const fetcher = async (url: string) => {
  const token = api.getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const response = await fetch(`${API_BASE}${url}`, { headers })
  
  if (!response.ok) {
    throw new Error('Failed to fetch')
  }
  
  return response.json()
}
