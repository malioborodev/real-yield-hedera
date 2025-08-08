import { useState, useEffect } from 'react'
import { 
  Client, 
  AccountId, 
  PrivateKey, 
  TokenCreateTransaction, 
  TokenType, 
  TokenSupplyType, 
  TokenMintTransaction, 
  TransferTransaction, 
  Hbar,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  AccountBalanceQuery
} from '@hashgraph/sdk'

interface AccountInfo {
  accountId: string
  balance: number
  stakedBalance: number
  walletType: string
}

interface TransactionResult {
  success: boolean
  message: string
  txId?: string
}

class HederaWalletService {
  private accountInfo: AccountInfo | null = null
  private isConnectedState: boolean = false
  private listeners: Set<() => void> = new Set()
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
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  public isConnected(): boolean {
    return this.isConnectedState
  }

  public getAccountInfo(): AccountInfo | null {
    return this.accountInfo
  }

  // Connect using HashPack or other Hedera wallet
  public async connect(): Promise<AccountInfo> {
    try {
      // Check if HashPack is available
      if (typeof window !== 'undefined' && (window as any).hashpack) {
        const hashpack = (window as any).hashpack
        
        // Initialize HashPack connection
        const initData = await hashpack.init({
          name: 'Real Yield Platform',
          description: 'Hedera Invoice Factoring Platform',
          icon: '/real-yield-logo.svg'
        })

        if (initData.success) {
          // Get account info from HashPack
          const accountIds = initData.accountIds
          if (accountIds && accountIds.length > 0) {
            const accountId = accountIds[0]
            
            // Get account balance
            const balance = await this.getAccountBalance(accountId)
            
            this.accountInfo = {
              accountId: accountId,
              balance: balance,
              stakedBalance: 0, // Will be updated separately
              walletType: 'HashPack'
            }
            
            this.isConnectedState = true
            this.notifyListeners()
            return this.accountInfo
          }
        }
      }
      
      // Fallback: simulate connection for development
      this.accountInfo = {
        accountId: '0.0.123456',
        balance: 5000,
        stakedBalance: 0,
        walletType: 'Development'
      }
      
      this.isConnectedState = true
      this.notifyListeners()
      return this.accountInfo
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw new Error('Failed to connect to Hedera wallet')
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).hashpack) {
        await (window as any).hashpack.disconnect()
      }
      
      this.accountInfo = null
      this.isConnectedState = false
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  private async getAccountBalance(accountId: string): Promise<number> {
    try {
      if (!this.client) return 0
      
      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client)
      
      return balance.hbars.toTinybars().toNumber() / 100000000 // Convert to HBAR
    } catch (error) {
      console.error('Failed to get account balance:', error)
      return 0
    }
  }

  public async stakeHBAR(amount: number): Promise<TransactionResult> {
    try {
      if (!this.isConnectedState || !this.accountInfo) {
        throw new Error('Wallet not connected')
      }

      if (this.accountInfo.balance < amount) {
        throw new Error('Insufficient HBAR balance')
      }

      // In a real implementation, this would interact with staking contracts
      // For now, we'll simulate the staking
      this.accountInfo.balance -= amount
      this.accountInfo.stakedBalance += amount
      this.notifyListeners()

      return {
        success: true,
        message: `Successfully staked ${amount} HBAR`,
        txId: `0.0.123456@${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to stake HBAR'
      }
    }
  }

  public async unstakeHBAR(amount: number): Promise<TransactionResult> {
    try {
      if (!this.isConnectedState || !this.accountInfo) {
        throw new Error('Wallet not connected')
      }

      if (this.accountInfo.stakedBalance < amount) {
        throw new Error('Insufficient staked HBAR balance')
      }

      this.accountInfo.stakedBalance -= amount
      this.accountInfo.balance += amount
      this.notifyListeners()

      return {
        success: true,
        message: `Successfully unstaked ${amount} HBAR`,
        txId: `0.0.123456@${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unstake HBAR'
      }
    }
  }

  public async createInvoiceTransaction(
    invoiceDetails: {
      exporterCompany: string
      importerCompany: string
      commodity: string
      faceValue: number
      tenor: number
      pd: number
      htsTokenId: string
      hcsTopicId: string
    },
    collateralAmount: number,
    invoiceId: string
  ): Promise<TransactionResult> {
    try {
      if (!this.isConnectedState || !this.accountInfo) {
        throw new Error('Wallet not connected')
      }

      if (this.accountInfo.stakedBalance < collateralAmount) {
        throw new Error('Insufficient staked HBAR for collateral')
      }

      // Lock collateral
      this.accountInfo.stakedBalance -= collateralAmount
      this.notifyListeners()

      // In a real implementation, this would:
      // 1. Mint HTS NFT for the invoice
      // 2. Submit audit log to HCS
      // 3. Lock collateral in smart contract

      return {
        success: true,
        message: `Invoice NFT created and ${collateralAmount} HBAR locked as collateral for ${invoiceId}`,
        txId: `0.0.123456@${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create invoice transaction'
      }
    }
  }

  public async releaseCollateralTransaction(
    invoiceId: string,
    amount: number
  ): Promise<TransactionResult> {
    try {
      if (!this.isConnectedState || !this.accountInfo) {
        throw new Error('Wallet not connected')
      }

      // Release collateral back to staked balance
      this.accountInfo.stakedBalance += amount
      this.notifyListeners()

      return {
        success: true,
        message: `Collateral for invoice ${invoiceId} released successfully`,
        txId: `0.0.123456@${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to release collateral'
      }
    }
  }
}

export const hederaWallet = new HederaWalletService()

// Custom hook to use wallet status in components
export function useHederaWallet() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(hederaWallet.getAccountInfo())
  const [isConnected, setIsConnected] = useState(hederaWallet.isConnected())

  useEffect(() => {
    const updateStatus = () => {
      setAccountInfo(hederaWallet.getAccountInfo())
      setIsConnected(hederaWallet.isConnected())
    }

    const unsubscribe = hederaWallet.subscribe(updateStatus)
    updateStatus() // Initial update

    return () => unsubscribe()
  }, [])

  return { 
    accountInfo, 
    isConnected, 
    connect: () => hederaWallet.connect(), 
    disconnect: () => hederaWallet.disconnect() 
  }
}