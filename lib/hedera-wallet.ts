'use client'

import { AccountId, Client, PrivateKey, PublicKey, AccountBalanceQuery, TransferTransaction, Hbar } from '@hashgraph/sdk'
import { HashConnect, HashConnectConnectionState, SessionData } from 'hashconnect'
import { LedgerId } from '@hashgraph/sdk'

// Network configuration
export const HEDERA_NETWORK = {
  testnet: {
    name: 'Hedera Testnet',
    chainId: '0x128',
    rpcUrls: ['https://testnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/testnet']
  },
  mainnet: {
    name: 'Hedera Mainnet', 
    chainId: '0x127',
    rpcUrls: ['https://mainnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/mainnet']
  }
}

// Wallet types
export type WalletType = 'hashpack' | 'blade' | 'kabila' | 'metamask'

export interface WalletConnection {
  accountId: string
  publicKey: string
  network: 'mainnet' | 'testnet'
  isConnected: boolean
  walletType: WalletType
  hbarBalance?: number
}

export interface WalletBalance {
  hbar: number
  tokens: {
    tokenId: string
    symbol: string
    balance: number
    decimals: number
  }[]
}

export interface TransactionResult {
  success: boolean
  transactionId?: string
  receipt?: any
  error?: string
}

export interface HashConnectMetadata {
  name: string
  description: string
  icons: string[]
  url: string
}

// Extend window for wallet providers
declare global {
  interface Window {
    hashconnect?: any
    bladeWallet?: any
    kabilaWallet?: any
    ethereum?: any
  }
}

export class HederaWalletService {
  private client: Client | null = null
  private connection: WalletConnection | null = null
  private network: 'mainnet' | 'testnet'
  private hashConnect: HashConnect | null = null
  private hashConnectState: HashConnectConnectionState = HashConnectConnectionState.Disconnected
  private pairingData: SessionData | null = null

  private subscribers: Function[] = []

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network
    this.initializeClient()
    this.initializeHashConnect()
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

  private async initializeHashConnect(): Promise<void> {
    try {
      const metadata: HashConnectMetadata = {
        name: 'Real Yield Hedera',
        description: 'A decentralized application for real yield farming on Hedera',
        icons: ['https://real-yield-hedera.vercel.app/favicon.ico'],
        url: 'https://real-yield-hedera.vercel.app'
      }

      this.hashConnect = new HashConnect(
        LedgerId.TESTNET,
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
        metadata,
        true // debug mode
      )

      // Setup event listeners
      this.hashConnect.connectionStatusChangeEvent.on((state) => {
        this.hashConnectState = state
        this.notifySubscribers({ type: 'connectionStatusChange', state })
      })

      this.hashConnect.pairingEvent.on((data) => {
         this.pairingData = data
         this.connection = {
           accountId: data.accountIds[0],
           publicKey: '',
           network: this.network,
           isConnected: true,
           walletType: 'hashpack'
         }
         this.notifySubscribers({ type: 'paired', connection: this.connection })
       })

      await this.hashConnect.init()
    } catch (error) {
      console.error('Failed to initialize HashConnect:', error)
    }
  }



  // Check wallet availability
  async checkWalletAvailability(): Promise<Record<WalletType, boolean>> {
    const availability: Record<WalletType, boolean> = {
      hashpack: false,
      blade: false,
      kabila: false,
      metamask: false
    }

    // Check HashPack using HashConnect v3
    if (this.hashConnect) {
      try {
        // Use event-based detection for HashPack
        availability.hashpack = this.hashConnectState === HashConnectConnectionState.Connected || 
                               this.pairingData !== null ||
                               typeof window !== 'undefined' && !!(window as any).hashpack
      } catch (error) {
        console.error('Error checking HashPack availability:', error)
        availability.hashpack = false
      }
    }

    // Check other wallets
    if (typeof window !== 'undefined') {
      availability.blade = !!(window as any).bladeWallet
      availability.kabila = !!(window as any).kabilaWallet
      availability.metamask = !!(window as any).ethereum
    }

    return availability
  }

  // Connect to wallet
  async connectWallet(walletType: WalletType): Promise<WalletConnection> {
    try {
      switch (walletType) {
        case 'hashpack':
          return await this.connectHashPack()
        case 'blade':
          return await this.connectBlade()
        case 'kabila':
          return await this.connectKabila()
        case 'metamask':
          return await this.connectMetaMask()
        
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`)
      }
    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error)
      throw error
    }
  }

  private async connectHashPack(): Promise<WalletConnection> {
    try {
      if (!this.hashConnect) {
        throw new Error('HashConnect not initialized')
      }

      // Check if already connected
      if (this.hashConnectState === HashConnectConnectionState.Connected && this.pairingData) {
        return this.connection!
      }

      // Initiate pairing with HashPack
       this.hashConnect.openPairingModal()
      
      // Wait for pairing to complete
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('HashPack connection timeout'))
        }, 30000) // 30 second timeout

        const checkConnection = () => {
          if (this.connection && this.connection.isConnected) {
            clearTimeout(timeout)
            resolve(this.connection)
          } else {
            setTimeout(checkConnection, 100)
          }
        }

        checkConnection()
      })
    } catch (error) {
      console.error('HashPack connection failed:', error)
      throw new Error('Failed to connect to HashPack. Please make sure HashPack extension is installed and try again.')
    }
  }

  private async connectBlade(): Promise<WalletConnection> {
    if (!window.bladeWallet) {
      throw new Error('Blade wallet not found')
    }

    try {
      const bladeWallet = window.bladeWallet
      const accountInfo = await bladeWallet.getAccountInfo()
      
      const connection: WalletConnection = {
        accountId: accountInfo.accountId,
        publicKey: accountInfo.publicKey || '',
        network: this.network,
        isConnected: true,
        walletType: 'blade'
      }

      this.connection = connection
      this.notifySubscribers({ type: 'connected', connection })
      return connection
    } catch (error) {
      throw new Error(`Blade connection failed: ${error}`)
    }
  }

  private async connectKabila(): Promise<WalletConnection> {
    if (!window.kabilaWallet) {
      throw new Error('Kabila wallet not found')
    }

    try {
      const kabilaWallet = window.kabilaWallet
      const result = await kabilaWallet.connect()
      
      const connection: WalletConnection = {
        accountId: result.accountId,
        publicKey: result.publicKey || '',
        network: this.network,
        isConnected: true,
        walletType: 'kabila'
      }

      this.connection = connection
      this.notifySubscribers({ type: 'connected', connection })
      return connection
    } catch (error) {
      throw new Error(`Kabila connection failed: ${error}`)
    }
  }

  private async connectMetaMask(): Promise<WalletConnection> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found')
    }

    try {
      const ethereum = window.ethereum
      
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Switch to Hedera network
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: HEDERA_NETWORK[this.network].chainId }]
        })
      } catch (switchError: any) {
        // Network doesn't exist, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [HEDERA_NETWORK[this.network]]
          })
        } else {
          throw switchError
        }
      }

      const connection: WalletConnection = {
        accountId: accounts[0],
        publicKey: '',
        network: this.network,
        isConnected: true,
        walletType: 'metamask'
      }

      this.connection = connection
      this.notifySubscribers({ type: 'connected', connection })
      return connection
    } catch (error) {
      throw new Error(`MetaMask connection failed: ${error}`)
    }
  }



  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    try {


      this.connection = null
      this.notifySubscribers({ type: 'disconnected' })
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      throw error
    }
  }

  // Get account balance
  async getAccountBalance(accountId?: string): Promise<WalletBalance> {
    if (!this.client) {
      throw new Error('Hedera client not initialized')
    }

    const targetAccountId = accountId || this.connection?.accountId
    if (!targetAccountId) {
      throw new Error('No account ID provided')
    }

    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(targetAccountId))
        .execute(this.client)

      const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000

      // Get token balances (simplified)
      const tokens: any[] = []
      if (balance.tokens && balance.tokens.size > 0) {
        for (const [tokenId, tokenBalance] of balance.tokens) {
          tokens.push({
            tokenId: tokenId.toString(),
            symbol: 'TOKEN',
            balance: tokenBalance.toNumber(),
            decimals: 8
          })
        }
      }

      return {
        hbar: hbarBalance,
        tokens
      }
    } catch (error) {
      console.error('Failed to get account balance:', error)
      throw error
    }
  }

  // Transfer HBAR
  async transferHBAR(toAccountId: string, amount: number, memo?: string): Promise<TransactionResult> {
    if (!this.client || !this.connection) {
      throw new Error('Wallet not connected')
    }

    try {
      const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(this.connection.accountId), Hbar.fromTinybars(-amount * 100000000))
        .addHbarTransfer(AccountId.fromString(toAccountId), Hbar.fromTinybars(amount * 100000000))

      if (memo) {
        transaction.setTransactionMemo(memo)
      }

      // Sign and execute transaction based on wallet type
      const result = await this.executeTransaction(transaction)
      return result
    } catch (error) {
      console.error('Failed to transfer HBAR:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async executeTransaction(transaction: any): Promise<TransactionResult> {
    if (!this.connection) {
      throw new Error('Wallet not connected')
    }

    try {
      switch (this.connection.walletType) {
        case 'hashpack':
          return await this.executeHashPackTransaction(transaction)
        case 'blade':
          return await this.executeBladeTransaction(transaction)
        case 'kabila':
          return await this.executeKabilaTransaction(transaction)
        case 'metamask':
          return await this.executeMetaMaskTransaction(transaction)
        
        default:
          throw new Error(`Unsupported wallet type: ${this.connection.walletType}`)
      }
    } catch (error) {
      console.error('Failed to execute transaction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async executeHashPackTransaction(transaction: any): Promise<TransactionResult> {
    try {
      if (!this.hashConnect || !this.connection) {
        throw new Error('HashConnect not initialized or not connected')
      }

      if (this.hashConnectState !== HashConnectConnectionState.Connected) {
        throw new Error('HashConnect not connected')
      }

      const response = await (this.hashConnect as any).sendTransaction(this.connection.accountId, transaction)
         
         return {
           success: true,
           transactionId: (response as any).transactionId || '',
           receipt: response
         }
    } catch (error) {
      console.error('HashPack transaction failed:', error)
      return {
        success: false,
        error: `Transaction failed: ${error}`
      }
    }
  }

  private async executeBladeTransaction(transaction: any): Promise<TransactionResult> {
    try {
      const bladeWallet = window.bladeWallet
      const result = await bladeWallet.sendTransaction(transaction)
      
      return {
        success: true,
        transactionId: result.transactionId,
        receipt: result.receipt
      }
    } catch (error) {
      throw error
    }
  }

  private async executeKabilaTransaction(transaction: any): Promise<TransactionResult> {
    try {
      const kabilaWallet = window.kabilaWallet
      const result = await kabilaWallet.sendTransaction(transaction)
      
      return {
        success: true,
        transactionId: result.transactionId,
        receipt: result.receipt
      }
    } catch (error) {
      throw error
    }
  }

  private async executeMetaMaskTransaction(transaction: any): Promise<TransactionResult> {
    try {
      const ethereum = window.ethereum
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      })
      
      return {
        success: true,
        transactionId: txHash
      }
    } catch (error) {
      throw error
    }
  }



  // Utility methods
  getConnection(): WalletConnection | null {
    return this.connection
  }

  isConnected(): boolean {
    return this.connection?.isConnected || false
  }

  getNetworkType(): 'mainnet' | 'testnet' {
    return this.network
  }

  getSupportedWallets(): WalletType[] {
    return ['hashpack', 'blade', 'kabila', 'metamask']
  }

  // Event subscription
  subscribe(callback: Function): () => void {
    this.subscribers.push(callback)
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in wallet subscriber:', error)
      }
    })
  }
}

// Export singleton instance
// Get network from environment variable
const getNetworkFromEnv = (): 'mainnet' | 'testnet' => {
  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK
  return network === 'mainnet' ? 'mainnet' : 'testnet'
}

export const hederaWalletService = new HederaWalletService(getNetworkFromEnv())
export default hederaWalletService