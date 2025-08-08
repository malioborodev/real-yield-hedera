import axios from 'axios'

// Mirror Node API interfaces
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

interface TopicMessage {
  consensus_timestamp: string
  topic_id: string
  message: string
  payer_account_id: string
  sequence_number: number
}

class MirrorNodeService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com'
  }

  // Get account token balances
  public async getAccountTokenBalances(accountId: string): Promise<AccountTokenBalance[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/accounts/${accountId}/tokens`
      )
      
      return response.data.tokens || []
    } catch (error) {
      console.error('Failed to fetch account token balances:', error)
      return []
    }
  }

  // Get account NFTs
  public async getAccountNFTs(accountId: string, tokenId?: string): Promise<NFTInfo[]> {
    try {
      let url = `${this.baseUrl}/api/v1/accounts/${accountId}/nfts`
      if (tokenId) {
        url += `?token.id=${tokenId}`
      }
      
      const response = await axios.get(url)
      return response.data.nfts || []
    } catch (error) {
      console.error('Failed to fetch account NFTs:', error)
      return []
    }
  }

  // Get specific NFT information
  public async getNFTInfo(tokenId: string, serialNumber: number): Promise<NFTInfo | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/tokens/${tokenId}/nfts/${serialNumber}`
      )
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch NFT info:', error)
      return null
    }
  }

  // Get token information
  public async getTokenInfo(tokenId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/tokens/${tokenId}`
      )
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch token info:', error)
      return null
    }
  }

  // Get transaction details
  public async getTransaction(transactionId: string): Promise<TransactionInfo | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/transactions/${transactionId}`
      )
      
      return response.data.transactions?.[0] || null
    } catch (error) {
      console.error('Failed to fetch transaction:', error)
      return null
    }
  }

  // Get account transactions
  public async getAccountTransactions(
    accountId: string, 
    limit: number = 25,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<TransactionInfo[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/transactions?account.id=${accountId}&limit=${limit}&order=${order}`
      )
      
      return response.data.transactions || []
    } catch (error) {
      console.error('Failed to fetch account transactions:', error)
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
      const response = await axios.get(
        `${this.baseUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=${order}`
      )
      
      return response.data.messages || []
    } catch (error) {
      console.error('Failed to fetch topic messages:', error)
      return []
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
      const response = await axios.get(
        `${this.baseUrl}/api/v1/accounts/${accountId}`
      )
      
      const balance = response.data.balance?.balance || 0
      return balance / 100000000 // Convert tinybars to HBAR
    } catch (error) {
      console.error('Failed to fetch account balance:', error)
      return 0
    }
  }

  // Get network status
  public async getNetworkStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/network/nodes`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch network status:', error)
      return null
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
      const params = new URLSearchParams()
      
      if (criteria.accountId) params.append('account.id', criteria.accountId)
      if (criteria.tokenId) params.append('token.id', criteria.tokenId)
      if (criteria.transactionType) params.append('transactiontype', criteria.transactionType)
      if (criteria.timestamp) params.append('timestamp', criteria.timestamp)
      if (criteria.limit) params.append('limit', criteria.limit.toString())
      
      const response = await axios.get(
        `${this.baseUrl}/api/v1/transactions?${params.toString()}`
      )
      
      return response.data.transactions || []
    } catch (error) {
      console.error('Failed to search transactions:', error)
      return []
    }
  }
}

export const mirrorNodeService = new MirrorNodeService()
export default mirrorNodeService
export type { AccountTokenBalance, NFTInfo, InvoiceNFTMetadata, TransactionInfo, TopicMessage }