import { 
  Client, 
  TopicCreateTransaction, 
  TopicMessageSubmitTransaction, 
  TopicId,
  PrivateKey,
  AccountId
} from '@hashgraph/sdk'

// Audit event types for HCS logging
export enum AuditEventType {
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_FUNDED = 'INVOICE_FUNDED', 
  INVOICE_SETTLED = 'INVOICE_SETTLED',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  COLLATERAL_LOCKED = 'COLLATERAL_LOCKED',
  COLLATERAL_RELEASED = 'COLLATERAL_RELEASED',
  YIELD_DISTRIBUTED = 'YIELD_DISTRIBUTED'
}

// HCS Topic IDs for different audit trails
export const AUDIT_TOPICS = {
  INVOICE: process.env.NEXT_PUBLIC_HCS_INVOICE_TOPIC || '0.0.123456',
  FUNDING: process.env.NEXT_PUBLIC_HCS_FUNDING_TOPIC || '0.0.123457', 
  SETTLEMENT: process.env.NEXT_PUBLIC_HCS_SETTLEMENT_TOPIC || '0.0.123458',
  RISK: process.env.NEXT_PUBLIC_HCS_RISK_TOPIC || '0.0.123459'
}

interface AuditEntry {
  eventType: AuditEventType
  timestamp: number
  invoiceId?: string
  accountId?: string
  amount?: number
  metadata?: Record<string, any>
}

class HCSService {
  private client: Client | null = null

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'
    
    if (network === 'mainnet') {
      this.client = Client.forMainnet()
    } else {
      this.client = Client.forTestnet()
    }

    // Set operator if available (for backend operations)
    // Only set operator in server-side environment
    if (typeof window === 'undefined') {
      const operatorId = process.env.HEDERA_OPERATOR_ID
      const operatorKey = process.env.HEDERA_OPERATOR_KEY
      
      if (operatorId && operatorKey && this.client) {
        try {
          this.client.setOperator(
            AccountId.fromString(operatorId),
            PrivateKey.fromString(operatorKey)
          )
        } catch (error) {
          console.warn('Failed to set Hedera operator:', error)
        }
      }
    }
  }

  // Create HCS topics for audit logging
  public async createAuditTopics(): Promise<Record<string, string>> {
    if (!this.client) {
      throw new Error('HCS client not initialized')
    }

    const topics: Record<string, string> = {}
    
    try {
      // Create invoice audit topic
      const invoiceTopicTx = new TopicCreateTransaction()
        .setTopicMemo('Real Yield - Invoice Audit Trail')
        .setSubmitKey(this.client.operatorPublicKey!)
      
      const invoiceTopicResponse = await invoiceTopicTx.execute(this.client)
      const invoiceTopicReceipt = await invoiceTopicResponse.getReceipt(this.client)
      topics.invoice = invoiceTopicReceipt.topicId!.toString()

      // Create funding audit topic
      const fundingTopicTx = new TopicCreateTransaction()
        .setTopicMemo('Real Yield - Funding Audit Trail')
        .setSubmitKey(this.client.operatorPublicKey!)
      
      const fundingTopicResponse = await fundingTopicTx.execute(this.client)
      const fundingTopicReceipt = await fundingTopicResponse.getReceipt(this.client)
      topics.funding = fundingTopicReceipt.topicId!.toString()

      // Create settlement audit topic
      const settlementTopicTx = new TopicCreateTransaction()
        .setTopicMemo('Real Yield - Settlement Audit Trail')
        .setSubmitKey(this.client.operatorPublicKey!)
      
      const settlementTopicResponse = await settlementTopicTx.execute(this.client)
      const settlementTopicReceipt = await settlementTopicResponse.getReceipt(this.client)
      topics.settlement = settlementTopicReceipt.topicId!.toString()

      // Create risk audit topic
      const riskTopicTx = new TopicCreateTransaction()
        .setTopicMemo('Real Yield - Risk Assessment Audit Trail')
        .setSubmitKey(this.client.operatorPublicKey!)
      
      const riskTopicResponse = await riskTopicTx.execute(this.client)
      const riskTopicReceipt = await riskTopicResponse.getReceipt(this.client)
      topics.risk = riskTopicReceipt.topicId!.toString()

      return topics
    } catch (error) {
      console.error('Failed to create HCS topics:', error)
      throw error
    }
  }

  // Submit audit entry to appropriate HCS topic
  public async logAuditEntry(
    entry: AuditEntry,
    topicId?: string
  ): Promise<string> {
    if (!this.client) {
      throw new Error('HCS client not initialized')
    }

    try {
      // Determine topic based on event type if not provided
      let targetTopicId = topicId
      if (!targetTopicId) {
        switch (entry.eventType) {
          case AuditEventType.INVOICE_CREATED:
            targetTopicId = AUDIT_TOPICS.INVOICE
            break
          case AuditEventType.INVOICE_FUNDED:
          case AuditEventType.COLLATERAL_LOCKED:
          case AuditEventType.COLLATERAL_RELEASED:
            targetTopicId = AUDIT_TOPICS.FUNDING
            break
          case AuditEventType.INVOICE_SETTLED:
          case AuditEventType.YIELD_DISTRIBUTED:
            targetTopicId = AUDIT_TOPICS.SETTLEMENT
            break
          case AuditEventType.RISK_ASSESSMENT:
            targetTopicId = AUDIT_TOPICS.RISK
            break
          default:
            targetTopicId = AUDIT_TOPICS.INVOICE
        }
      }

      // Prepare audit message
      const auditMessage = {
        ...entry,
        timestamp: entry.timestamp || Date.now(),
        version: '1.0'
      }

      // Submit message to HCS topic
      const submitTx = new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(targetTopicId))
        .setMessage(JSON.stringify(auditMessage))

      const submitResponse = await submitTx.execute(this.client)
      const submitReceipt = await submitResponse.getReceipt(this.client)
      
      return submitResponse.transactionId.toString()
    } catch (error) {
      console.error('Failed to log audit entry:', error)
      throw error
    }
  }

  // Log invoice creation
  public async logInvoiceCreation(
    invoiceId: string,
    exporterCompany: string,
    importerCompany: string,
    faceValue: number,
    accountId: string
  ): Promise<string> {
    const entry: AuditEntry = {
      eventType: AuditEventType.INVOICE_CREATED,
      timestamp: Date.now(),
      invoiceId,
      accountId,
      amount: faceValue,
      metadata: {
        exporterCompany,
        importerCompany,
        faceValue
      }
    }

    return this.logAuditEntry(entry)
  }

  // Log funding event
  public async logFundingEvent(
    invoiceId: string,
    fundingAmount: number,
    collateralAmount: number,
    accountId: string
  ): Promise<string> {
    const entry: AuditEntry = {
      eventType: AuditEventType.INVOICE_FUNDED,
      timestamp: Date.now(),
      invoiceId,
      accountId,
      amount: fundingAmount,
      metadata: {
        fundingAmount,
        collateralAmount
      }
    }

    return this.logAuditEntry(entry)
  }

  // Log settlement event
  public async logSettlementEvent(
    invoiceId: string,
    settlementAmount: number,
    yieldAmount: number,
    accountId: string
  ): Promise<string> {
    const entry: AuditEntry = {
      eventType: AuditEventType.INVOICE_SETTLED,
      timestamp: Date.now(),
      invoiceId,
      accountId,
      amount: settlementAmount,
      metadata: {
        settlementAmount,
        yieldAmount
      }
    }

    return this.logAuditEntry(entry)
  }

  // Log risk assessment
  public async logRiskAssessment(
    invoiceId: string,
    riskScore: number,
    pd: number,
    accountId: string,
    assessmentData: Record<string, any>
  ): Promise<string> {
    const entry: AuditEntry = {
      eventType: AuditEventType.RISK_ASSESSMENT,
      timestamp: Date.now(),
      invoiceId,
      accountId,
      metadata: {
        riskScore,
        pd,
        ...assessmentData
      }
    }

    return this.logAuditEntry(entry)
  }
}

export const hcsService = new HCSService()
export default hcsService