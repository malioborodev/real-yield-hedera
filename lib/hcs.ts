'use client'

import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  TopicId,
  AccountId,
  PrivateKey,
  Timestamp
} from '@hashgraph/sdk'

// HCS message types
interface InvoiceAuditMessage {
  type: 'INVOICE_CREATED' | 'INVOICE_VERIFIED' | 'INVOICE_TRADED' | 'INVOICE_SETTLED'
  invoiceId: string
  timestamp: number
  data: any
  signature?: string
}

interface RegionalTopic {
  topicId: string
  region: string
  description: string
  createdAt: number
}

interface AuditTrailEntry {
  sequenceNumber: number
  consensusTimestamp: string
  message: InvoiceAuditMessage
  runningHash: string
}

export class HederaConsensusService {
  private client: Client
  private operatorId: AccountId
  private operatorKey: PrivateKey
  private regionalTopics: Map<string, TopicId> = new Map()
  private mainAuditTopic: TopicId | null = null

  constructor() {
    // Initialize Hedera client for testnet
    this.client = Client.forTestnet()
    
    // Set operator using environment variables
    const operatorId = process.env.HEDERA_OPERATOR_ID || process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || '0.0.123456'
    this.operatorId = AccountId.fromString(operatorId)
    
    // In browser environment, use mock mode
    if (typeof window !== 'undefined') {
      console.log('Running in browser mode - using existing topic IDs')
      this.operatorKey = PrivateKey.generate() // Generate dummy key for browser
      this.initializeTopics().catch(console.error)
      return
    }
    
    // Server-side initialization with real credentials
    const privateKeyString = process.env.HEDERA_OPERATOR_KEY || '302e020100300506032b657004220420a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
    
    try {
      this.operatorKey = PrivateKey.fromString(privateKeyString)
      this.client.setOperator(this.operatorId, this.operatorKey)
      console.log('Hedera client initialized for server-side operations')
    } catch (error) {
      console.warn('Failed to set operator with provided key:', error)
      this.operatorKey = PrivateKey.generate()
    }
    
    // Initialize topics
    this.initializeTopics().catch(console.error)
  }

  private async initializeTopics() {
    try {
      // In browser environment, use existing topic IDs from environment
      if (typeof window !== 'undefined') {
        // Use existing topic IDs for demo
        const mainTopicId = process.env.NEXT_PUBLIC_HCS_INVOICE_TOPIC
        if (mainTopicId) {
          this.mainAuditTopic = TopicId.fromString(mainTopicId)
          console.log('Using existing main audit topic:', this.mainAuditTopic.toString())
        }
        
        // Set up regional topics with existing IDs
        const regions = ['APAC', 'EMEA', 'AMERICAS']
        const topicIds = [
          process.env.NEXT_PUBLIC_HCS_FUNDING_TOPIC,
          process.env.NEXT_PUBLIC_HCS_SETTLEMENT_TOPIC,
          process.env.NEXT_PUBLIC_HCS_RISK_TOPIC
        ]
        
        regions.forEach((region, index) => {
          if (topicIds[index]) {
            this.regionalTopics.set(region, TopicId.fromString(topicIds[index]))
            console.log(`Using existing ${region} topic:`, topicIds[index])
          }
        })
        return
      }
      
      // Server-side topic creation (only if we have valid credentials)
      if (!this.mainAuditTopic) {
        this.mainAuditTopic = await this.createTopic('Real-Yield Main Audit Trail')
        console.log('Created main audit topic:', this.mainAuditTopic.toString())
      }
      
      // Create regional topics
      const regions = ['APAC', 'EMEA', 'AMERICAS']
      for (const region of regions) {
        if (!this.regionalTopics.has(region)) {
          const topicId = await this.createTopic(`Real-Yield ${region} Regional Topic`)
          this.regionalTopics.set(region, topicId)
          console.log(`Created ${region} topic:`, topicId.toString())
        }
      }
    } catch (error) {
      console.error('Error initializing HCS topics:', error)
    }
  }

  private async createTopic(memo: string): Promise<TopicId> {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(memo)
        .setAdminKey(this.operatorKey.publicKey)
        .setSubmitKey(this.operatorKey.publicKey)
        .freezeWith(this.client)

      const signedTransaction = await transaction.sign(this.operatorKey)
      const response = await signedTransaction.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      const topicId = receipt.topicId
      if (!topicId) {
        throw new Error('Failed to create topic')
      }
      
      console.log(`Created HCS topic: ${topicId.toString()}`)
      return topicId
    } catch (error) {
      console.error('Error creating HCS topic:', error)
      throw error
    }
  }

  async submitInvoiceToHCS(
    invoiceData: any,
    region: string = 'APAC',
    messageType: InvoiceAuditMessage['type'] = 'INVOICE_CREATED'
  ): Promise<string> {
    try {
      const message: InvoiceAuditMessage = {
        type: messageType,
        invoiceId: invoiceData.id || `INV-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          exporter: invoiceData.exporter,
          importer: invoiceData.importer,
          commodity: invoiceData.commodity,
          faceValue: invoiceData.faceValue,
          tenor: invoiceData.tenor,
          estimatedPd: invoiceData.estimatedPd,
          region: region,
          hash: this.generateDataHash(invoiceData)
        }
      }

      // In browser environment, use mock submission
      if (typeof window !== 'undefined') {
        console.log(`[MOCK] Invoice ${message.invoiceId} submitted to HCS for region ${region}`, message)
        return `mock:${message.invoiceId}`
      }

      // Submit to both main audit topic and regional topic (server-side only)
      const mainSubmission = this.submitMessageToTopic(this.mainAuditTopic!, message)
      
      const regionalTopicId = this.regionalTopics.get(region)
      const regionalSubmission = regionalTopicId ? 
        this.submitMessageToTopic(regionalTopicId, message) : 
        Promise.resolve('No regional topic')

      const [mainResult, regionalResult] = await Promise.all([mainSubmission, regionalSubmission])
      
      console.log(`Invoice submitted to HCS - Main: ${mainResult}, Regional: ${regionalResult}`)
      return mainResult
    } catch (error) {
      console.error('Error submitting invoice to HCS:', error)
      throw error
    }
  }

  private async submitMessageToTopic(topicId: TopicId, message: InvoiceAuditMessage): Promise<string> {
    try {
      const messageJson = JSON.stringify(message)
      const messageBytes = new TextEncoder().encode(messageJson)

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(messageBytes)
        .freezeWith(this.client)

      const signedTransaction = await transaction.sign(this.operatorKey)
      const response = await signedTransaction.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      return `${topicId.toString()}:${receipt.topicSequenceNumber}`
    } catch (error) {
      console.error('Error submitting message to topic:', error)
      throw error
    }
  }

  async verifyInvoiceChain(invoiceId: string): Promise<AuditTrailEntry[]> {
    try {
      // In production, this would query the Mirror Node API for topic messages
      // For now, return mock audit trail
      const mockAuditTrail: AuditTrailEntry[] = [
        {
          sequenceNumber: 1,
          consensusTimestamp: new Date(Date.now() - 86400000).toISOString(),
          message: {
            type: 'INVOICE_CREATED',
            invoiceId,
            timestamp: Date.now() - 86400000,
            data: { status: 'created', verified: true }
          },
          runningHash: this.generateRunningHash('created', invoiceId)
        },
        {
          sequenceNumber: 2,
          consensusTimestamp: new Date(Date.now() - 43200000).toISOString(),
          message: {
            type: 'INVOICE_VERIFIED',
            invoiceId,
            timestamp: Date.now() - 43200000,
            data: { status: 'verified', riskAssessed: true }
          },
          runningHash: this.generateRunningHash('verified', invoiceId)
        }
      ]
      
      return mockAuditTrail
    } catch (error) {
      console.error('Error verifying invoice chain:', error)
      return []
    }
  }

  async getRegionalTopicInfo(region: string): Promise<any> {
    try {
      const topicId = this.regionalTopics.get(region)
      if (!topicId) {
        throw new Error(`No topic found for region: ${region}`)
      }

      const query = new TopicInfoQuery()
        .setTopicId(topicId)

      const info = await query.execute(this.client)
      
      return {
        topicId: topicId.toString(),
        memo: info.topicMemo,
        sequenceNumber: info.sequenceNumber,
        adminKey: info.adminKey?.toString(),
        submitKey: info.submitKey?.toString(),
        autoRenewPeriod: info.autoRenewPeriod?.seconds
      }
    } catch (error) {
      console.error('Error getting regional topic info:', error)
      return null
    }
  }

  async getInvoiceAuditHistory(invoiceId: string, region?: string): Promise<InvoiceAuditMessage[]> {
    try {
      // In production, this would query Mirror Node API
      // Mock implementation for demonstration
      const mockHistory: InvoiceAuditMessage[] = [
        {
          type: 'INVOICE_CREATED',
          invoiceId,
          timestamp: Date.now() - 86400000,
          data: {
            exporter: 'Singapore Agri Corp',
            importer: 'Rotterdam Trading BV',
            commodity: 'Crude Palm Oil',
            faceValue: 50000,
            region: region || 'APAC'
          }
        },
        {
          type: 'INVOICE_VERIFIED',
          invoiceId,
          timestamp: Date.now() - 43200000,
          data: {
            verificationStatus: 'passed',
            riskScore: 0.4,
            verifiedBy: 'AI Risk Engine'
          }
        }
      ]
      
      return mockHistory
    } catch (error) {
      console.error('Error getting invoice audit history:', error)
      return []
    }
  }

  async submitTradeEvent(invoiceId: string, tradeData: any): Promise<string> {
    try {
      const message: InvoiceAuditMessage = {
        type: 'INVOICE_TRADED',
        invoiceId,
        timestamp: Date.now(),
        data: {
          buyer: tradeData.buyer,
          seller: tradeData.seller,
          tradePrice: tradeData.tradePrice,
          tradeTimestamp: tradeData.timestamp,
          transactionHash: tradeData.transactionHash
        }
      }

      return await this.submitMessageToTopic(this.mainAuditTopic!, message)
    } catch (error) {
      console.error('Error submitting trade event:', error)
      throw error
    }
  }

  async submitSettlementEvent(invoiceId: string, settlementData: any): Promise<string> {
    try {
      const message: InvoiceAuditMessage = {
        type: 'INVOICE_SETTLED',
        invoiceId,
        timestamp: Date.now(),
        data: {
          settledAmount: settlementData.amount,
          settledBy: settlementData.settledBy,
          settlementDate: settlementData.date,
          collateralReleased: settlementData.collateralReleased
        }
      }

      return await this.submitMessageToTopic(this.mainAuditTopic!, message)
    } catch (error) {
      console.error('Error submitting settlement event:', error)
      throw error
    }
  }

  private generateDataHash(data: any): string {
    // Simple hash generation for demonstration
    // In production, use proper cryptographic hashing
    const jsonString = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  private generateRunningHash(action: string, invoiceId: string): string {
    // Simple running hash for demonstration
    const combined = `${action}-${invoiceId}-${Date.now()}`
    return this.generateDataHash(combined)
  }

  // Utility methods
  getMainAuditTopicId(): string | null {
    return this.mainAuditTopic?.toString() || null
  }

  getRegionalTopicId(region: string): string | null {
    const topicId = this.regionalTopics.get(region)
    return topicId?.toString() || null
  }

  getAllRegionalTopics(): RegionalTopic[] {
    const topics: RegionalTopic[] = []
    this.regionalTopics.forEach((topicId, region) => {
      topics.push({
        topicId: topicId.toString(),
        region,
        description: `${region} Regional Invoice Topic`,
        createdAt: Date.now() - Math.random() * 86400000
      })
    })
    return topics
  }
}

// Export singleton instance
// Only initialize HCS service in browser environment
export const hcsService = typeof window !== 'undefined' ? new HederaConsensusService() : null as any

// Export types for use in other files
export type { InvoiceAuditMessage, RegionalTopic, AuditTrailEntry }