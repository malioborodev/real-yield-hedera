'use client'

import { Client, AccountId, PrivateKey, PublicKey, AccountBalanceQuery, TransferTransaction, Hbar, TokenAssociateTransaction, TokenId, AccountInfoQuery } from '@hashgraph/sdk'
import { mirrorNodeService } from './mirror-node'
import { htsService } from './hts'
import { hcsService } from './hcs'

// Wallet connection types
interface WalletConnection {
  accountId: string
  publicKey: string
  network: 'mainnet' | 'testnet'
  isConnected: boolean
}

interface WalletBalance {
  hbar: number
  tokens: {
    tokenId: string
    symbol: string
    balance: number
    decimals: number
  }[]
}

interface TransactionResult {
  success: boolean
  transactionId?: string
  receipt?: any
  error?: string
}

// Supported wallet types
type WalletType = 'hashpack' | 'blade' | 'kabila' | 'metamask-hedera' | 'private-key'

// Wallet provider interfaces
interface HashPackWallet {
  connectToLocalWallet(): Promise<any>
  sendTransaction(transaction: any): Promise<any>
  getAccountInfo(): Promise<any>
}

interface BladeWallet {
  createAccount(): Promise<any>
  getAccountInfo(): Promise<any>
  transferHBAR(accountId: string, amount: number): Promise<any>
  associateToken(tokenId: string): Promise<any>
}

declare global {
  interface Window {
    hashconnect?: any
    bladeWallet?: BladeWallet
    kabilaWallet?: any
  }
}

export class WalletService {
  private client: Client | null = null
  private connection: WalletConnection | null = null
  private walletType: WalletType | null = null
  private network: 'mainnet' | 'testnet'
  private subscribers: Map<string, Function[]> = new Map()

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network
    this.initializeClient()
  }

  private initializeClient(): void {
    try {
      if (this.network === 'mainnet') {
        this.client = Client.forMainnet()
      } else {
        this.client = Client.forTestnet()
      }
    } catch (error) {
      console.error('Failed to initialize Hedera client:', error)
    }
  }

  // Wallet connection methods
  async connectWallet(walletType: WalletType, options?: any): Promise<WalletConnection> {
    try {
      this.walletType = walletType
      
      switch (walletType) {
        case 'hashpack':
          return await this.connectHashPack()
        case 'blade':
          return await this.connectBlade()
        case 'kabila':
          return await this.connectKabila()
        case 'metamask-hedera':
          return await this.connectMetaMaskHedera()
        case 'private-key':
          return await this.connectPrivateKey(options?.privateKey)
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`)
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    }
  }

  private async connectHashPack(): Promise<WalletConnection> {
    try {
      // Check if HashPack is available
      if (!window.hashconnect) {
        throw new Error('HashPack wallet not found. Please install HashPack extension.')
      }

      // Initialize HashConnect
      const hashconnect = window.hashconnect
      const appMetadata = {
        name: 'Real-Yield Hedera',
        description: 'Global Trade-Finance Tokenization Platform',
        icon: '/logo.svg',
        url: window.location.origin
      }

      await hashconnect.init(appMetadata, this.network, false)
      const state = await hashconnect.connect()
      
      if (!state.pairingData) {
        throw new Error('Failed to connect to HashPack')
      }

      const accountId = state.pairingData.accountIds[0]
      const publicKey = state.pairingData.publicKey

      this.connection = {
        accountId,
        publicKey,
        network: this.network,
        isConnected: true
      }

      this.notifySubscribers('connection', this.connection)
      return this.connection
    } catch (error) {
      console.error('HashPack connection failed:', error)
      throw error
    }
  }

  private async connectBlade(): Promise<WalletConnection> {
    try {
      if (!window.bladeWallet) {
        throw new Error('Blade wallet not found. Please install Blade wallet.')
      }

      const accountInfo = await window.bladeWallet.getAccountInfo()
      
      this.connection = {
        accountId: accountInfo.accountId,
        publicKey: accountInfo.publicKey,
        network: this.network,
        isConnected: true
      }

      this.notifySubscribers('connection', this.connection)
      return this.connection
    } catch (error) {
      console.error('Blade wallet connection failed:', error)
      throw error
    }
  }

  private async connectKabila(): Promise<WalletConnection> {
    try {
      if (!window.kabilaWallet) {
        throw new Error('Kabila wallet not found. Please install Kabila wallet.')
      }

      const result = await window.kabilaWallet.connect()
      
      this.connection = {
        accountId: result.accountId,
        publicKey: result.publicKey,
        network: this.network,
        isConnected: true
      }

      this.notifySubscribers('connection', this.connection)
      return this.connection
    } catch (error) {
      console.error('Kabila wallet connection failed:', error)
      throw error
    }
  }

  private async connectMetaMaskHedera(): Promise<WalletConnection> {
    try {
      // MetaMask Hedera integration (if available)
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.')
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in MetaMask')
      }

      // For demo purposes - in production, you'd need proper Hedera-MetaMask integration
      const mockAccountId = '0.0.123456' // This would come from actual integration
      const mockPublicKey = 'mock_public_key'

      this.connection = {
        accountId: mockAccountId,
        publicKey: mockPublicKey,
        network: this.network,
        isConnected: true
      }

      this.notifySubscribers('connection', this.connection)
      return this.connection
    } catch (error) {
      console.error('MetaMask Hedera connection failed:', error)
      throw error
    }
  }

  private async connectPrivateKey(privateKeyString: string): Promise<WalletConnection> {
    try {
      if (!privateKeyString) {
        throw new Error('Private key is required')
      }

      // Validate private key format and length
      if (privateKeyString.length < 64) {
        throw new Error('Invalid private key: must be at least 64 characters (32 bytes in hex)')
      }

      const privateKey = PrivateKey.fromString(privateKeyString)
      const publicKey = privateKey.publicKey
      
      // For testnet, we can derive account ID from public key
      // In production, you'd need to query the network or have the account ID provided
      const mockAccountId = '0.0.123456' // This should be provided or queried

      if (this.client) {
        this.client.setOperator(AccountId.fromString(mockAccountId), privateKey)
      }

      this.connection = {
        accountId: mockAccountId,
        publicKey: publicKey.toString(),
        network: this.network,
        isConnected: true
      }

      this.notifySubscribers('connection', this.connection)
      return this.connection
    } catch (error) {
      console.error('Private key connection failed:', error)
      throw error
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    try {
      if (this.walletType === 'hashpack' && window.hashconnect) {
        await window.hashconnect.disconnect()
      }

      this.connection = null
      this.walletType = null
      
      if (this.client) {
        this.client.close()
        this.initializeClient()
      }

      this.notifySubscribers('disconnection', null)
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
      throw error
    }
  }

  // Get wallet connection status
  getConnection(): WalletConnection | null {
    return this.connection
  }

  isConnected(): boolean {
    return this.connection?.isConnected || false
  }

  // Account operations
  async getAccountBalance(): Promise<WalletBalance> {
    try {
      if (!this.connection || !this.client) {
        throw new Error('Wallet not connected')
      }

      const accountId = AccountId.fromString(this.connection.accountId)
      
      // Get HBAR balance
      const balanceQuery = new AccountBalanceQuery().setAccountId(accountId)
      const balance = await balanceQuery.execute(this.client)
      
      // Get token balances from Mirror Node
      const tokenBalances = await mirrorNodeService.getAccountTokenBalances(this.connection.accountId)
      
      const tokens = await Promise.all(
        tokenBalances.map(async (tokenBalance) => {
          const tokenInfo = await mirrorNodeService.getTokenInfo(tokenBalance.token_id)
          return {
            tokenId: tokenBalance.token_id,
            symbol: tokenInfo?.symbol || 'UNKNOWN',
            balance: tokenBalance.balance,
            decimals: tokenInfo?.decimals || 0
          }
        })
      )

      return {
        hbar: balance.hbars.toTinybars().toNumber() / 100000000, // Convert to HBAR
        tokens
      }
    } catch (error) {
      console.error('Failed to get account balance:', error)
      throw error
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      if (!this.connection || !this.client) {
        throw new Error('Wallet not connected')
      }

      const accountId = AccountId.fromString(this.connection.accountId)
      const query = new AccountInfoQuery().setAccountId(accountId)
      const info = await query.execute(this.client)
      
      return {
        accountId: info.accountId.toString(),
        balance: info.balance.toTinybars().toNumber() / 100000000,
        key: info.key?.toString(),
        autoRenewPeriod: info.autoRenewPeriod?.seconds,
        expirationTime: info.expirationTime,
        memo: info.accountMemo
      }
    } catch (error) {
      console.error('Failed to get account info:', error)
      throw error
    }
  }

  // Transaction operations
  async transferHBAR(toAccountId: string, amount: number, memo?: string): Promise<TransactionResult> {
    try {
      if (!this.connection || !this.client) {
        throw new Error('Wallet not connected')
      }

      const transaction = new TransferTransaction()
        .addHbarTransfer(this.connection.accountId, Hbar.fromTinybars(-amount * 100000000))
        .addHbarTransfer(toAccountId, Hbar.fromTinybars(amount * 100000000))
      
      if (memo) {
        transaction.setTransactionMemo(memo)
      }

      const result = await this.executeTransaction(transaction)
      return result
    } catch (error) {
      console.error('HBAR transfer failed:', error)
      return { success: false, error: error.message }
    }
  }

  async associateToken(tokenId: string): Promise<TransactionResult> {
    try {
      if (!this.connection || !this.client) {
        throw new Error('Wallet not connected')
      }

      const transaction = new TokenAssociateTransaction()
        .setAccountId(this.connection.accountId)
        .setTokenIds([TokenId.fromString(tokenId)])

      const result = await this.executeTransaction(transaction)
      return result
    } catch (error) {
      console.error('Token association failed:', error)
      return { success: false, error: error.message }
    }
  }

  async transferToken(
    tokenId: string, 
    toAccountId: string, 
    amount: number, 
    memo?: string
  ): Promise<TransactionResult> {
    try {
      if (!this.connection || !this.client) {
        throw new Error('Wallet not connected')
      }

      // Use HTS service for token transfers
      const transactionId = await htsService.transferToken(
        TokenId.fromString(tokenId),
        AccountId.fromString(this.connection.accountId),
        AccountId.fromString(toAccountId),
        amount,
        memo
      )

      return {
        success: true,
        transactionId
      }
    } catch (error) {
      console.error('Token transfer failed:', error)
      return { success: false, error: error.message }
    }
  }

  private async executeTransaction(transaction: any): Promise<TransactionResult> {
    try {
      if (!this.client) {
        throw new Error('Client not initialized')
      }

      // Handle different wallet types
      if (this.walletType === 'hashpack' && window.hashconnect) {
        // Use HashPack for signing
        const response = await window.hashconnect.sendTransaction(transaction)
        return {
          success: true,
          transactionId: response.transactionId,
          receipt: response.receipt
        }
      } else if (this.walletType === 'private-key') {
        // Execute directly with client (private key already set)
        const txResponse = await transaction.execute(this.client)
        const receipt = await txResponse.getReceipt(this.client)
        
        return {
          success: true,
          transactionId: txResponse.transactionId.toString(),
          receipt
        }
      } else {
        throw new Error(`Transaction execution not implemented for wallet type: ${this.walletType}`)
      }
    } catch (error) {
      console.error('Transaction execution failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Invoice-specific operations
  async createInvoiceToken(
    invoiceData: any,
    initialSupply: number = 1000000
  ): Promise<TransactionResult> {
    try {
      if (!this.connection) {
        throw new Error('Wallet not connected')
      }

      const result = await htsService.createInvoiceToken(
        this.connection.accountId,
        invoiceData,
        initialSupply
      )

      // Log to HCS for audit trail
      if (result.success && result.tokenId) {
        await hcsService.submitInvoiceEvent({
          invoiceId: invoiceData.id,
          eventType: 'TOKEN_CREATED',
          tokenId: result.tokenId,
          accountId: this.connection.accountId,
          timestamp: Date.now(),
          metadata: {
            commodity: invoiceData.commodity,
            amount: invoiceData.amount,
            region: invoiceData.region
          }
        })
      }

      return result
    } catch (error) {
      console.error('Invoice token creation failed:', error)
      return { success: false, error: error.message }
    }
  }

  async purchaseInvoiceToken(
    tokenId: string,
    sellerAccountId: string,
    amount: number,
    pricePerToken: number
  ): Promise<TransactionResult> {
    try {
      if (!this.connection) {
        throw new Error('Wallet not connected')
      }

      // First associate the token if not already associated
      const associateResult = await this.associateToken(tokenId)
      if (!associateResult.success) {
        return associateResult
      }

      // Calculate total price in HBAR
      const totalPrice = amount * pricePerToken

      // Transfer HBAR to seller
      const hbarResult = await this.transferHBAR(
        sellerAccountId,
        totalPrice,
        `Purchase of ${amount} tokens of ${tokenId}`
      )

      if (!hbarResult.success) {
        return hbarResult
      }

      // Transfer tokens from seller to buyer
      // Note: This requires the seller to initiate the token transfer
      // In a real implementation, you'd use atomic swaps or escrow
      
      // Log the purchase event
      await hcsService.submitInvoiceEvent({
        invoiceId: tokenId,
        eventType: 'TOKEN_PURCHASED',
        tokenId,
        accountId: this.connection.accountId,
        timestamp: Date.now(),
        metadata: {
          amount,
          pricePerToken,
          totalPrice,
          seller: sellerAccountId
        }
      })

      return {
        success: true,
        transactionId: hbarResult.transactionId
      }
    } catch (error) {
      console.error('Invoice token purchase failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Event subscription
  subscribe(event: string, callback: Function): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [])
    }
    this.subscribers.get(event)!.push(callback)
  }

  unsubscribe(event: string, callback: Function): void {
    const callbacks = this.subscribers.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event callback:', error)
        }
      })
    }
  }

  // Utility methods
  getNetworkType(): 'mainnet' | 'testnet' {
    return this.network
  }

  getSupportedWallets(): WalletType[] {
    return ['hashpack', 'blade', 'kabila', 'metamask-hedera', 'private-key']
  }

  async checkWalletAvailability(walletType: WalletType): Promise<boolean> {
    switch (walletType) {
      case 'hashpack':
        return typeof window !== 'undefined' && !!window.hashconnect
      case 'blade':
        return typeof window !== 'undefined' && !!window.bladeWallet
      case 'kabila':
        return typeof window !== 'undefined' && !!window.kabilaWallet
      case 'metamask-hedera':
        return typeof window !== 'undefined' && !!window.ethereum
      case 'private-key':
        return true // Always available
      default:
        return false
    }
  }

  // Portfolio management
  async getPortfolio(): Promise<{
    totalValue: number
    hbarBalance: number
    invoiceTokens: any[]
    transactions: any[]
  }> {
    try {
      if (!this.connection) {
        throw new Error('Wallet not connected')
      }

      const balance = await this.getAccountBalance()
      const transactions = await mirrorNodeService.getAccountTransactions(
        this.connection.accountId,
        50
      )

      // Filter invoice tokens (tokens with specific metadata)
      const invoiceTokens = balance.tokens.filter(token => 
        token.symbol.startsWith('INV-') || token.symbol.includes('INVOICE')
      )

      // Calculate total portfolio value (mock calculation)
      const totalValue = balance.hbar + invoiceTokens.reduce((sum, token) => {
        // Mock token value calculation
        return sum + (token.balance * 0.1) // Assume each token worth 0.1 HBAR
      }, 0)

      return {
        totalValue,
        hbarBalance: balance.hbar,
        invoiceTokens,
        transactions
      }
    } catch (error) {
      console.error('Failed to get portfolio:', error)
      throw error
    }
  }
}

// Export singleton instance
export const walletService = new WalletService()

// Export types
export type {
  WalletConnection,
  WalletBalance,
  TransactionResult,
  WalletType
}

export default walletService