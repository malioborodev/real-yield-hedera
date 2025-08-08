'use client'

// Mirror Node API integration for real-time Hedera data
interface MirrorNodeConfig {
  baseUrl: string
  network: 'mainnet' | 'testnet'
  apiKey?: string
}

interface TransactionData {
  consensus_timestamp: string
  transaction_id: string
  type: string
  result: string
  charged_tx_fee: number
  account_id: string
  transfers: {
    account: string
    amount: number
  }[]
  token_transfers?: {
    token_id: string
    account: string
    amount: number
  }[]
}

interface TopicMessage {
  consensus_timestamp: string
  topic_id: string
  message: string
  running_hash: string
  sequence_number: number
  payer_account_id: string
}

interface TokenInfo {
  token_id: string
  symbol: string
  name: string
  decimals: number
  total_supply: string
  treasury_account_id: string
  created_timestamp: string
  modified_timestamp: string
  memo: string
}

interface AccountInfo {
  account: string
  balance: {
    timestamp: string
    balance: number
    tokens: {
      token_id: string
      balance: number
    }[]
  }
  transactions: TransactionData[]
}

interface NetworkStats {
  timestamp: string
  tps: number
  gas_used: number
  active_nodes: number
  total_transactions: number
}

interface RealTimeMetrics {
  invoiceTokensCreated: number
  totalTradeVolume: number
  activeInvoices: number
  settledInvoices: number
  averageYield: number
  regionalDistribution: Record<string, number>
  commodityBreakdown: Record<string, number>
  riskDistribution: Record<string, number>
}

// Legacy interfaces for backward compatibility
interface AccountTokenBalance {
  token_id: string
  balance: number
  decimals: number
}

interface NFTInfo {
  token_id: string
  serial_number: number
  account_id: string
  created_timestamp: string
  metadata?: string
  spender?: string
}

interface InvoiceNFTMetadata {
  invoiceId: string
  exporterCompany: string
  importerCompany: string
  commodity: string
  faceValue: number
  tenor: number
  pd: number
  createdAt: string
  status: 'active' | 'funded' | 'settled' | 'defaulted'
}

interface TransactionInfo {
  transaction_id: string
  consensus_timestamp: string
  charged_tx_fee: number
  memo_base64?: string
  result: string
  transaction_hash: string
  transfers: Array<{
    account: string
    amount: number
  }>
}

export class MirrorNodeService {
  private config: MirrorNodeConfig
  private cache: Map<string, any> = new Map()
  private cacheTimeout = 30000 // 30 seconds
  private wsConnection: WebSocket | null = null
  private subscribers: Map<string, Function[]> = new Map()

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.config = {
      baseUrl: network === 'mainnet' 
        ? 'https://mainnet-public.mirrornode.hedera.com'
        : process.env.NEXT_PUBLIC_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com',
      network,
      apiKey: process.env.NEXT_PUBLIC_MIRROR_NODE_API_KEY
    }
  }

  private async makeRequest(endpoint: string, params?: Record<string, any>): Promise<any> {
    try {
      const url = new URL(`${this.config.baseUrl}/api/v1${endpoint}`)
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString())
          }
        })
      }

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`
      }

      const response = await fetch(url.toString(), { headers })
      
      if (!response.ok) {
        throw new Error(`Mirror Node API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Mirror Node request failed:', error)
      throw error
    }
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}:${JSON.stringify(params || {})}`
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Legacy method for backward compatibility
  public async getAccountTokenBalances(accountId: string): Promise<AccountTokenBalance[]> {
    try {
      const response = await this.makeRequest(`/accounts/${accountId}/tokens`)
      return response.tokens || []
    } catch (error) {
      console.error('Failed to fetch account token balances:', error)
      return []
    }
  }

  // Enhanced account operations
  async getAccountInfo(accountId: string): Promise<AccountInfo | null> {
    try {
      const cacheKey = this.getCacheKey('/accounts', { accountId })
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.makeRequest(`/accounts/${accountId}`)
      const balanceResponse = await this.makeRequest(`/accounts/${accountId}/balances`)
      const transactionsResponse = await this.makeRequest(`/accounts/${accountId}/transactions`, {
        limit: 25,
        order: 'desc'
      })

      const accountInfo: AccountInfo = {
        account: accountId,
        balance: balanceResponse.balances?.[0] || { timestamp: '', balance: 0, tokens: [] },
        transactions: transactionsResponse.transactions || []
      }

      this.setCache(cacheKey, accountInfo)
      return accountInfo
    } catch (error) {
      console.error('Error getting account info:', error)
      return null
    }
  }

  // Get account NFTs
  public async getAccountNFTs(accountId: string, tokenId?: string): Promise<NFTInfo[]> {
    try {
      const params = tokenId ? { 'token.id': tokenId } : undefined
      const response = await this.makeRequest(`/accounts/${accountId}/nfts`, params)
      return response.nfts || []
    } catch (error) {
      console.error('Failed to fetch account NFTs:', error)
      return []
    }
  }

  // Get specific NFT information
  public async getNFTInfo(tokenId: string, serialNumber: number): Promise<NFTInfo | null> {
    try {
      const response = await this.makeRequest(`/tokens/${tokenId}/nfts/${serialNumber}`)
      return response
    } catch (error) {
      console.error('Failed to fetch NFT info:', error)
      return null
    }
  }

  // Get token information
  public async getTokenInfo(tokenId: string): Promise<TokenInfo | null> {
    try {
      const cacheKey = this.getCacheKey('/tokens', { tokenId })
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const response = await this.makeRequest(`/tokens/${tokenId}`)
      this.setCache(cacheKey, response)
      return response
    } catch (error) {
      console.error('Failed to fetch token info:', error)
      return null
    }
  }

  // Get transaction details (legacy)
  public async getTransaction(transactionId: string): Promise<TransactionInfo | null> {
    try {
      const response = await this.makeRequest(`/transactions/${transactionId}`)
      return response.transactions?.[0] || null
    } catch (error) {
      console.error('Failed to fetch transaction:', error)
      return null
    }
  }

  // Enhanced transaction operations
  async getTransactionData(transactionId: string): Promise<TransactionData | null> {
    try {
      const response = await this.makeRequest(`/transactions/${transactionId}`)
      return response.transactions?.[0] || null
    } catch (error) {
      console.error('Error getting transaction:', error)
      return null
    }
  }

  // Get account transactions (legacy)
  public async getAccountTransactions(
    accountId: string, 
    limit: number = 25,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<TransactionInfo[]> {
    try {
      const response = await this.makeRequest('/transactions', {
        'account.id': accountId,
        limit,
        order
      })
      return response.transactions || []
    } catch (error) {
      console.error('Failed to fetch account transactions:', error)
      return []
    }
  }

  // Enhanced account transactions
  async getAccountTransactionData(
    accountId: string, 
    limit: number = 25,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<TransactionData[]> {
    try {
      const response = await this.makeRequest(`/accounts/${accountId}/transactions`, {
        limit,
        order
      })
      return response.transactions || []
    } catch (error) {
      console.error('Error getting account transactions:', error)
      return []
    }
  }

  // Get HCS topic messages
  public async getTopicMessages(
    topicId: string,
    limit: number = 25,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<TopicMessage[]> {
    try {
      const response = await this.makeRequest(`/topics/${topicId}/messages`, {
        limit,
        order
      })
      return response.messages || []
    } catch (error) {
      console.error('Failed to fetch topic messages:', error)
      return []
    }
  }

  async getTopicInfo(topicId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/topics/${topicId}`)
      return response
    } catch (error) {
      console.error('Error getting topic info:', error)
      return null
    }
  }

  // Parse invoice NFT metadata
  public parseInvoiceNFTMetadata(metadata: string): InvoiceNFTMetadata | null {
    try {
      // Decode base64 metadata if needed
      let decodedMetadata = metadata
      if (metadata.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
        decodedMetadata = atob(metadata)
      }
      
      return JSON.parse(decodedMetadata) as InvoiceNFTMetadata
    } catch (error) {
      console.error('Failed to parse NFT metadata:', error)
      return null
    }
  }

  // Get invoice NFTs for an account
  public async getInvoiceNFTs(accountId: string): Promise<Array<NFTInfo & { parsedMetadata?: InvoiceNFTMetadata }>> {
    try {
      const invoiceTokenId = process.env.NEXT_PUBLIC_INVOICE_NFT_TOKEN
      if (!invoiceTokenId) {
        console.warn('Invoice NFT token ID not configured')
        return []
      }

      const nfts = await this.getAccountNFTs(accountId, invoiceTokenId)
      
      // Parse metadata for each NFT
      return nfts.map(nft => {
        const parsedMetadata = nft.metadata ? this.parseInvoiceNFTMetadata(nft.metadata) : null
        return {
          ...nft,
          parsedMetadata: parsedMetadata || undefined
        }
      })
    } catch (error) {
      console.error('Failed to fetch invoice NFTs:', error)
      return []
    }
  }

  // Get audit trail for an invoice
  public async getInvoiceAuditTrail(invoiceId: string): Promise<TopicMessage[]> {
    try {
      const auditMessages: TopicMessage[] = []
      
      // Get messages from all audit topics
      const topics = [
        process.env.NEXT_PUBLIC_HCS_INVOICE_TOPIC,
        process.env.NEXT_PUBLIC_HCS_FUNDING_TOPIC,
        process.env.NEXT_PUBLIC_HCS_SETTLEMENT_TOPIC,
        process.env.NEXT_PUBLIC_HCS_RISK_TOPIC
      ].filter(Boolean) as string[]

      for (const topicId of topics) {
        const messages = await this.getTopicMessages(topicId, 100)
        
        // Filter messages related to this invoice
        const invoiceMessages = messages.filter(msg => {
          try {
            const parsedMessage = JSON.parse(atob(msg.message))
            return parsedMessage.invoiceId === invoiceId
          } catch {
            return false
          }
        })
        
        auditMessages.push(...invoiceMessages)
      }
      
      // Sort by timestamp
      return auditMessages.sort((a, b) => 
        new Date(a.consensus_timestamp).getTime() - new Date(b.consensus_timestamp).getTime()
      )
    } catch (error) {
      console.error('Failed to fetch invoice audit trail:', error)
      return []
    }
  }

  // Get account HBAR balance
  public async getAccountBalance(accountId: string): Promise<number> {
    try {
      const response = await this.makeRequest(`/accounts/${accountId}`)
      const balance = response.balance?.balance || 0
      return balance / 100000000 // Convert tinybars to HBAR
    } catch (error) {
      console.error('Failed to fetch account balance:', error)
      return 0
    }
  }

  // Get network status
  public async getNetworkStatus() {
    try {
      const response = await this.makeRequest('/network/nodes')
      return response
    } catch (error) {
      console.error('Failed to fetch network status:', error)
      return null
    }
  }

  // Network statistics
  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const response = await this.makeRequest('/network/supply')
      const transactionsResponse = await this.makeRequest('/transactions', { limit: 1 })
      
      // Mock network stats (Mirror Node doesn't provide all these metrics)
      return {
        timestamp: new Date().toISOString(),
        tps: Math.floor(Math.random() * 100) + 50, // Mock TPS
        gas_used: Math.floor(Math.random() * 1000000), // Mock gas
        active_nodes: 39, // Hedera mainnet nodes
        total_transactions: transactionsResponse.transactions?.[0]?.consensus_timestamp || 0
      }
    } catch (error) {
      console.error('Error getting network stats:', error)
      return {
        timestamp: new Date().toISOString(),
        tps: 0,
        gas_used: 0,
        active_nodes: 0,
        total_transactions: 0
      }
    }
  }

  // Search transactions by criteria
  public async searchTransactions(criteria: {
    accountId?: string
    tokenId?: string
    transactionType?: string
    timestamp?: string
    limit?: number
  }): Promise<TransactionInfo[]> {
    try {
      const params: Record<string, any> = {}
      
      if (criteria.accountId) params['account.id'] = criteria.accountId
      if (criteria.tokenId) params['token.id'] = criteria.tokenId
      if (criteria.transactionType) params['transactiontype'] = criteria.transactionType
      if (criteria.timestamp) params['timestamp'] = criteria.timestamp
      if (criteria.limit) params['limit'] = criteria.limit
      
      const response = await this.makeRequest('/transactions', params)
      return response.transactions || []
    } catch (error) {
      console.error('Failed to search transactions:', error)
      return []
    }
  }

  // Real-time invoice analytics
  async getInvoiceAnalytics(): Promise<RealTimeMetrics> {
    try {
      // In production, this would aggregate data from HCS topics and token transactions
      // For now, return mock analytics
      const mockMetrics: RealTimeMetrics = {
        invoiceTokensCreated: Math.floor(Math.random() * 1000) + 500,
        totalTradeVolume: Math.floor(Math.random() * 10000000) + 5000000,
        activeInvoices: Math.floor(Math.random() * 500) + 200,
        settledInvoices: Math.floor(Math.random() * 300) + 100,
        averageYield: Math.random() * 0.1 + 0.05, // 5-15%
        regionalDistribution: {
          'APAC': Math.floor(Math.random() * 40) + 30,
          'EMEA': Math.floor(Math.random() * 30) + 20,
          'AMERICAS': Math.floor(Math.random() * 25) + 15,
          'AFRICA': Math.floor(Math.random() * 15) + 10,
          'MIDDLE_EAST': Math.floor(Math.random() * 10) + 5
        },
        commodityBreakdown: {
          'Crude Palm Oil': Math.floor(Math.random() * 30) + 20,
          'Rice': Math.floor(Math.random() * 25) + 15,
          'Wheat': Math.floor(Math.random() * 20) + 10,
          'Soybeans': Math.floor(Math.random() * 15) + 10,
          'Corn': Math.floor(Math.random() * 10) + 5
        },
        riskDistribution: {
          'Low Risk (0-0.3)': Math.floor(Math.random() * 50) + 40,
          'Medium Risk (0.3-0.6)': Math.floor(Math.random() * 30) + 25,
          'High Risk (0.6-1.0)': Math.floor(Math.random() * 20) + 10
        }
      }

      return mockMetrics
    } catch (error) {
      console.error('Error getting invoice analytics:', error)
      return {
        invoiceTokensCreated: 0,
        totalTradeVolume: 0,
        activeInvoices: 0,
        settledInvoices: 0,
        averageYield: 0,
        regionalDistribution: {},
        commodityBreakdown: {},
        riskDistribution: {}
      }
    }
  }

  // Real-time subscriptions (WebSocket)
  async subscribeToAccount(accountId: string, callback: (data: any) => void): Promise<void> {
    const key = `account:${accountId}`
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
    }
    this.subscribers.get(key)!.push(callback)
    
    // Start WebSocket connection if not already connected
    if (!this.wsConnection) {
      this.initWebSocket()
    }
  }

  async subscribeToToken(tokenId: string, callback: (data: any) => void): Promise<void> {
    const key = `token:${tokenId}`
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
    }
    this.subscribers.get(key)!.push(callback)
    
    if (!this.wsConnection) {
      this.initWebSocket()
    }
  }

  async subscribeToTopic(topicId: string, callback: (data: any) => void): Promise<void> {
    const key = `topic:${topicId}`
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
    }
    this.subscribers.get(key)!.push(callback)
    
    if (!this.wsConnection) {
      this.initWebSocket()
    }
  }

  private initWebSocket(): void {
    // Note: Hedera Mirror Node doesn't provide WebSocket API
    // This is a mock implementation for demonstration
    console.log('WebSocket connection would be initialized here')
    
    // Simulate real-time updates with polling
    setInterval(() => {
      this.simulateRealTimeUpdates()
    }, 5000) // Poll every 5 seconds
  }

  private simulateRealTimeUpdates(): void {
    // Simulate real-time data updates
    this.subscribers.forEach((callbacks, key) => {
      const [type, id] = key.split(':')
      const mockData = {
        type,
        id,
        timestamp: Date.now(),
        data: {
          balance: Math.floor(Math.random() * 1000000),
          transactions: Math.floor(Math.random() * 10),
          lastActivity: new Date().toISOString()
        }
      }
      
      callbacks.forEach(callback => {
        try {
          callback(mockData)
        } catch (error) {
          console.error('Error in subscription callback:', error)
        }
      })
    })
  }

  unsubscribe(key: string, callback: Function): void {
    const callbacks = this.subscribers.get(key)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
      if (callbacks.length === 0) {
        this.subscribers.delete(key)
      }
    }
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear()
  }

  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout
  }

  getNetworkUrl(): string {
    return this.config.baseUrl
  }

  isMainnet(): boolean {
    return this.config.network === 'mainnet'
  }

  // Token operations
  async getTokenTransactions(
    tokenId: string,
    limit: number = 25
  ): Promise<TransactionData[]> {
    try {
      const response = await this.makeRequest('/transactions', {
        'account.id': tokenId,
        transactiontype: 'TOKENTRANSFER',
        limit,
        order: 'desc'
      })
      return response.transactions || []
    } catch (error) {
      console.error('Error getting token transactions:', error)
      return []
    }
  }

  async getTokenHolders(tokenId: string): Promise<{ account_id: string; balance: number }[]> {
    try {
      const response = await this.makeRequest(`/tokens/${tokenId}/balances`)
      return response.balances || []
    } catch (error) {
      console.error('Error getting token holders:', error)
      return []
    }
  }

  // Analytics helpers
  async getInvoiceTokenMetrics(tokenIds: string[]): Promise<any[]> {
    const metrics = []
    
    for (const tokenId of tokenIds) {
      try {
        const tokenInfo = await this.getTokenInfo(tokenId)
        const transactions = await this.getTokenTransactions(tokenId, 10)
        const holders = await this.getTokenHolders(tokenId)
        
        metrics.push({
          tokenId,
          info: tokenInfo,
          recentTransactions: transactions.length,
          holderCount: holders.length,
          totalVolume: transactions.reduce((sum, tx) => {
            const tokenTransfers = tx.token_transfers?.filter(t => t.token_id === tokenId) || []
            return sum + tokenTransfers.reduce((txSum, transfer) => txSum + Math.abs(transfer.amount), 0)
          }, 0)
        })
      } catch (error) {
        console.error(`Error getting metrics for token ${tokenId}:`, error)
      }
    }
    
    return metrics
  }

  async getRegionalActivity(region: string): Promise<any> {
    // Mock implementation - in production would filter by region metadata
    return {
      region,
      activeTokens: Math.floor(Math.random() * 100) + 50,
      totalVolume: Math.floor(Math.random() * 5000000) + 1000000,
      averageYield: Math.random() * 0.1 + 0.05,
      topCommodities: [
        { name: 'Crude Palm Oil', volume: Math.floor(Math.random() * 1000000) },
        { name: 'Rice', volume: Math.floor(Math.random() * 800000) },
        { name: 'Wheat', volume: Math.floor(Math.random() * 600000) }
      ]
    }
  }

  // Monitor token transfers for specific tokens
  async monitorTokenTransfers(tokenIds: string[]): Promise<TransactionData[]> {
    const allTransfers: TransactionData[] = []
    
    for (const tokenId of tokenIds) {
      try {
        const response = await this.makeRequest('/transactions', {
          'account.id': tokenId,
          transactiontype: 'TOKENTRANSFER',
          limit: 10,
          order: 'desc'
        })
        
        if (response.transactions) {
          allTransfers.push(...response.transactions)
        }
      } catch (error) {
        console.error(`Error monitoring transfers for token ${tokenId}:`, error)
      }
    }
    
    return allTransfers.sort((a, b) => 
      new Date(b.consensus_timestamp).getTime() - new Date(a.consensus_timestamp).getTime()
    )
  }
}

// Export singleton instance
export const mirrorNodeService = new MirrorNodeService()
export default mirrorNodeService

// Export types for use in other files
export type {
  TransactionData,
  TopicMessage,
  TokenInfo,
  AccountInfo,
  NetworkStats,
  RealTimeMetrics,
  AccountTokenBalance,
  NFTInfo,
  InvoiceNFTMetadata,
  TransactionInfo
}