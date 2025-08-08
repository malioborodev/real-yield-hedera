import { AccountId, Client, PrivateKey, AccountBalanceQuery } from '@hashgraph/sdk'
import { DAppConnector } from '@hashgraph/hedera-wallet-connect'
import { LedgerId } from '@hashgraph/sdk'
import { useState, useEffect } from 'react'

export interface WalletAccountInfo {
  accountId: string
  balance: number
  evmAddress?: string
  walletType: string
}

export interface TransactionResult {
  success: boolean
  message: string
  txId?: string
}

type WalletType = 'HashPack' | 'Blade' | 'Kabila' | 'MetaMask'

class WalletService {
  private dAppConnector: DAppConnector | null = null
  private accountInfo: WalletAccountInfo | null = null
  private isConnectedState: boolean = false
  private listeners: Set<() => void> = new Set()
  private client: Client | null = null
  private currentWalletType: WalletType | null = null

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

  private async initializeWalletConnect() {
    try {
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      
      if (!projectId || projectId === 'your-project-id') {
        console.warn('WalletConnect not configured - using mock wallet')
        return
      }

      // Dynamic import to prevent chunk loading issues
      const { DAppConnector } = await import('@hashgraph/hedera-wallet-connect')
      
      const metadata = {
        name: 'Real Yield Hedera',
        description: 'Real Yield Trade Finance Platform on Hedera',
        url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        icons: ['https://avatars.githubusercontent.com/u/31002956']
      }

      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET

      this.dAppConnector = new DAppConnector(
        metadata,
        network,
        projectId,
        undefined,
        undefined,
        undefined,
        'error'
      )

      await this.dAppConnector.init({ logger: 'error' })
      console.log('WalletConnect initialized successfully')

    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error)
      console.warn('Continuing with mock wallet functionality')
    }
  }

  private handleConnect(accountId: string) {
    console.log('Wallet connected:', accountId)
    this.accountInfo = {
      accountId,
      balance: 0,
      walletType: this.currentWalletType || 'Unknown'
    }
    this.isConnectedState = true
    this.notifyListeners()
  }

  private handleDisconnect() {
    console.log('Wallet disconnected')
    this.isConnectedState = false
    this.accountInfo = null
    this.currentWalletType = null
    this.notifyListeners()
  }

  private handleSessionEvent(event: any) {
    console.log('Session event:', event)
    this.updateAccountInfo()
  }

  private async updateAccountInfo() {
    if (!this.dAppConnector || !this.isConnectedState || this.dAppConnector.signers.length === 0) return

    try {
      const signer = this.dAppConnector.signers[0]
      const accountId = signer.getAccountId().toString()
      const balance = await this.getAccountBalance(accountId)
      
      if (this.accountInfo) {
        this.accountInfo.balance = balance
        this.notifyListeners()
      }
    } catch (error) {
      console.error('Failed to update account info:', error)
    }
  }

  private async getAccountBalance(accountId: string): Promise<number> {
    if (!this.client) return 0

    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client)
      
      return balance.hbars.toTinybars().toNumber() / 100000000
    } catch (error) {
      console.error('Failed to get account balance:', error)
      return 0
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public isConnected(): boolean {
    return this.isConnectedState
  }

  public getAccountInfo(): WalletAccountInfo | null {
    return this.accountInfo
  }

  public getAvailableWallets(): WalletType[] {
    return ['HashPack', 'Blade', 'Kabila', 'MetaMask']
  }

  public async connectWallet(walletType: WalletType): Promise<WalletAccountInfo> {
    try {
      this.currentWalletType = walletType
      
      if (!this.dAppConnector) {
        await this.initializeWalletConnect()
      }

      // If WalletConnect is not available, use mock wallet for development
      if (!this.dAppConnector) {
        console.log('Using mock wallet for development')
        const mockAccountInfo: WalletAccountInfo = {
          accountId: '0.0.6435668',
          balance: 100.0,
          walletType: walletType
        }
        
        this.accountInfo = mockAccountInfo
        this.isConnectedState = true
        this.notifyListeners()
        
        return mockAccountInfo
      }

      // Connect to wallet using modal
      const session = await this.dAppConnector.openModal()
      
      if (session && this.dAppConnector.signers.length > 0) {
        const signer = this.dAppConnector.signers[0]
        const accountId = signer.getAccountId().toString()
        const balance = await this.getAccountBalance(accountId)
        
        this.accountInfo = {
          accountId,
          balance,
          walletType
        }
        
        this.isConnectedState = true
        this.notifyListeners()
        
        return this.accountInfo
      } else {
        throw new Error('No signers available after connection')
      }
    } catch (error) {
      console.error(`Failed to connect to ${walletType}:`, error)
      
      // In development, fallback to mock wallet
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to mock wallet')
        const mockAccountInfo: WalletAccountInfo = {
          accountId: '0.0.6435668',
          balance: 100.0,
          walletType: walletType
        }
        
        this.accountInfo = mockAccountInfo
        this.isConnectedState = true
        this.notifyListeners()
        
        return mockAccountInfo
      }
      
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.dAppConnector) {
        await this.dAppConnector.disconnectAll()
        console.log('Wallet disconnected successfully')
      }
      
      this.accountInfo = null
      this.isConnectedState = false
      this.currentWalletType = null
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      // Reset state even if disconnection fails
      this.accountInfo = null
      this.isConnectedState = false
      this.currentWalletType = null
      this.notifyListeners()
    }
  }

  public async executeTransaction(transaction: any): Promise<TransactionResult> {
    if (!this.dAppConnector || !this.isConnectedState || this.dAppConnector.signers.length === 0) {
      return { success: false, message: 'No wallet connected' }
    }

    try {
      const signer = this.dAppConnector.signers[0]
      const result = await transaction.executeWithSigner(signer)
      
      return {
        success: true,
        message: 'Transaction executed successfully',
        txId: result.transactionId.toString()
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Transaction failed'
      }
    }
  }

  public async signMessage(message: string): Promise<string> {
    if (!this.dAppConnector || !this.isConnectedState || this.dAppConnector.signers.length === 0) {
      throw new Error('No wallet connected')
    }

    try {
      const signer = this.dAppConnector.signers[0]
      const signature = await signer.sign([new TextEncoder().encode(message)])
      return signature[0].toString()
    } catch (error) {
      console.error('Failed to sign message:', error)
      throw error
    }
  }
}

export const walletService = new WalletService()

export function useWallet() {
  const [isConnected, setIsConnected] = useState(walletService.isConnected())
  const [accountInfo, setAccountInfo] = useState(walletService.getAccountInfo())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = walletService.subscribe(() => {
      setIsConnected(walletService.isConnected())
      setAccountInfo(walletService.getAccountInfo())
    })

    return unsubscribe
  }, [])

  const connectWallet = async (walletType: WalletType) => {
    setIsLoading(true)
    try {
      const info = await walletService.connectWallet(walletType)
      return info
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    setIsLoading(true)
    try {
      await walletService.disconnect()
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isConnected,
    accountInfo,
    isLoading,
    availableWallets: walletService.getAvailableWallets(),
    connect: connectWallet,
    disconnect,
    getAvailableWallets: walletService.getAvailableWallets.bind(walletService),
    executeTransaction: walletService.executeTransaction.bind(walletService),
    signMessage: walletService.signMessage.bind(walletService)
  }
}