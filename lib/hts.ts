'use client'

import {
  Client,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenAssociateTransaction,
  TokenDissociateTransaction,
  TransferTransaction,
  TokenInfoQuery,
  AccountBalanceQuery,
  TokenId,
  AccountId,
  PrivateKey,
  Hbar,
  TokenType,
  TokenSupplyType,
  TokenFreezeStatus,
  TokenKycStatus
} from '@hashgraph/sdk'

// Token types for different invoice representations
interface InvoiceToken {
  tokenId: string
  invoiceId: string
  symbol: string
  name: string
  totalSupply: number
  decimals: number
  faceValue: number
  maturityDate: number
  region: string
  commodity: string
  issuer: string
  status: 'ACTIVE' | 'MATURED' | 'DEFAULTED' | 'TRADED'
}

interface TokenMetadata {
  invoiceId: string
  exporter: string
  importer: string
  commodity: string
  faceValue: number
  tenor: number
  region: string
  riskScore: number
  createdAt: number
  maturityDate: number
}

interface TokenTransfer {
  tokenId: string
  from: string
  to: string
  amount: number
  timestamp: number
  transactionId: string
  type: 'MINT' | 'BURN' | 'TRANSFER' | 'TRADE'
}

interface TokenPortfolio {
  accountId: string
  tokens: {
    tokenId: string
    balance: number
    value: number
    metadata: TokenMetadata
  }[]
  totalValue: number
  totalTokens: number
}

export class HederaTokenService {
  private client: Client
  private operatorId: AccountId
  private operatorKey: PrivateKey
  private tokenRegistry: Map<string, InvoiceToken> = new Map()
  private transferHistory: TokenTransfer[] = []
  private treasuryAccount: AccountId

  constructor() {
    // Initialize Hedera client for testnet
    this.client = Client.forTestnet()
    
    // Set operator (in production, use environment variables)
    this.operatorId = AccountId.fromString(process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || '0.0.123456')
    
    // Use a valid fallback private key or generate one for demo purposes
    const fallbackPrivateKey = '302e020100300506032b6570042204201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    this.operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY || fallbackPrivateKey)
    
    this.client.setOperator(this.operatorId, this.operatorKey)
    this.treasuryAccount = this.operatorId // Use operator as treasury for simplicity
  }

  async createInvoiceToken(
    invoiceData: any,
    initialSupply: number = 1000000 // Default 1M tokens representing invoice fractions
  ): Promise<InvoiceToken> {
    try {
      const tokenSymbol = `RY${invoiceData.commodity.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-4)}`
      const tokenName = `Real Yield ${invoiceData.commodity} Invoice Token`
      
      // Create token metadata
      const metadata: TokenMetadata = {
        invoiceId: invoiceData.id,
        exporter: invoiceData.exporter,
        importer: invoiceData.importer,
        commodity: invoiceData.commodity,
        faceValue: invoiceData.faceValue,
        tenor: invoiceData.tenor,
        region: invoiceData.region || 'APAC',
        riskScore: invoiceData.estimatedPd || 0.1,
        createdAt: Date.now(),
        maturityDate: Date.now() + (invoiceData.tenor * 24 * 60 * 60 * 1000)
      }

      // Create fungible token
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(6) // 6 decimal places for fractional ownership
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(this.treasuryAccount)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(initialSupply * 10) // Allow for additional minting if needed
        .setSupplyKey(this.operatorKey)
        .setAdminKey(this.operatorKey)
        .setFreezeKey(this.operatorKey)
        .setWipeKey(this.operatorKey)
        .setKycKey(this.operatorKey)
        .setTokenMemo(`Invoice Token: ${invoiceData.id}`)
        .setMaxTransactionFee(new Hbar(30))
        .freezeWith(this.client)

      const signedTx = await tokenCreateTx.sign(this.operatorKey)
      const response = await signedTx.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      const tokenId = receipt.tokenId
      if (!tokenId) {
        throw new Error('Failed to create invoice token')
      }

      // Create invoice token record
      const invoiceToken: InvoiceToken = {
        tokenId: tokenId.toString(),
        invoiceId: invoiceData.id,
        symbol: tokenSymbol,
        name: tokenName,
        totalSupply: initialSupply,
        decimals: 6,
        faceValue: invoiceData.faceValue,
        maturityDate: metadata.maturityDate,
        region: metadata.region,
        commodity: invoiceData.commodity,
        issuer: this.operatorId.toString(),
        status: 'ACTIVE'
      }

      // Store in registry
      this.tokenRegistry.set(tokenId.toString(), invoiceToken)

      // Record mint transaction
      this.transferHistory.push({
        tokenId: tokenId.toString(),
        from: '0.0.0', // Mint from null account
        to: this.treasuryAccount.toString(),
        amount: initialSupply,
        timestamp: Date.now(),
        transactionId: response.transactionId.toString(),
        type: 'MINT'
      })

      console.log(`Created invoice token: ${tokenId.toString()} (${tokenSymbol})`)
      return invoiceToken
    } catch (error) {
      console.error('Error creating invoice token:', error)
      throw error
    }
  }

  async associateTokenWithAccount(tokenId: string, accountId: string, accountKey: PrivateKey): Promise<boolean> {
    try {
      const tokenIdObj = TokenId.fromString(tokenId)
      const accountIdObj = AccountId.fromString(accountId)

      const associateTx = new TokenAssociateTransaction()
        .setAccountId(accountIdObj)
        .setTokenIds([tokenIdObj])
        .setMaxTransactionFee(new Hbar(5))
        .freezeWith(this.client)

      const signedTx = await associateTx.sign(accountKey)
      const response = await signedTx.execute(this.client)
      const receipt = await response.getReceipt(this.client)

      console.log(`Token ${tokenId} associated with account ${accountId}`)
      return true
    } catch (error) {
      console.error('Error associating token with account:', error)
      return false
    }
  }

  async transferTokens(
    tokenId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    fromAccountKey: PrivateKey
  ): Promise<string | null> {
    try {
      const tokenIdObj = TokenId.fromString(tokenId)
      const fromAccountIdObj = AccountId.fromString(fromAccountId)
      const toAccountIdObj = AccountId.fromString(toAccountId)

      const transferTx = new TransferTransaction()
        .addTokenTransfer(tokenIdObj, fromAccountIdObj, -amount)
        .addTokenTransfer(tokenIdObj, toAccountIdObj, amount)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client)

      const signedTx = await transferTx.sign(fromAccountKey)
      const response = await signedTx.execute(this.client)
      const receipt = await response.getReceipt(this.client)

      // Record transfer
      this.transferHistory.push({
        tokenId,
        from: fromAccountId,
        to: toAccountId,
        amount,
        timestamp: Date.now(),
        transactionId: response.transactionId.toString(),
        type: 'TRANSFER'
      })

      console.log(`Transferred ${amount} tokens from ${fromAccountId} to ${toAccountId}`)
      return response.transactionId.toString()
    } catch (error) {
      console.error('Error transferring tokens:', error)
      return null
    }
  }

  async tradeInvoiceTokens(
    tokenId: string,
    sellerAccountId: string,
    buyerAccountId: string,
    tokenAmount: number,
    priceInHbar: number,
    sellerKey: PrivateKey,
    buyerKey: PrivateKey
  ): Promise<string | null> {
    try {
      const tokenIdObj = TokenId.fromString(tokenId)
      const sellerAccountIdObj = AccountId.fromString(sellerAccountId)
      const buyerAccountIdObj = AccountId.fromString(buyerAccountId)
      const priceInTinybars = Hbar.fromString(priceInHbar.toString()).toTinybars()

      // Atomic swap: tokens for HBAR
      const tradeTx = new TransferTransaction()
        // Transfer tokens from seller to buyer
        .addTokenTransfer(tokenIdObj, sellerAccountIdObj, -tokenAmount)
        .addTokenTransfer(tokenIdObj, buyerAccountIdObj, tokenAmount)
        // Transfer HBAR from buyer to seller
        .addHbarTransfer(buyerAccountIdObj, priceInTinybars.negated())
        .addHbarTransfer(sellerAccountIdObj, priceInTinybars)
        .setMaxTransactionFee(new Hbar(20))
        .freezeWith(this.client)

      // Both parties must sign
      const signedByBuyer = await tradeTx.sign(buyerKey)
      const signedByBoth = await signedByBuyer.sign(sellerKey)
      
      const response = await signedByBoth.execute(this.client)
      const receipt = await response.getReceipt(this.client)

      // Record trade
      this.transferHistory.push({
        tokenId,
        from: sellerAccountId,
        to: buyerAccountId,
        amount: tokenAmount,
        timestamp: Date.now(),
        transactionId: response.transactionId.toString(),
        type: 'TRADE'
      })

      console.log(`Traded ${tokenAmount} tokens for ${priceInHbar} HBAR`)
      return response.transactionId.toString()
    } catch (error) {
      console.error('Error trading invoice tokens:', error)
      return null
    }
  }

  async mintAdditionalTokens(tokenId: string, amount: number): Promise<boolean> {
    try {
      const tokenIdObj = TokenId.fromString(tokenId)

      const mintTx = new TokenMintTransaction()
        .setTokenId(tokenIdObj)
        .setAmount(amount)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client)

      const signedTx = await mintTx.sign(this.operatorKey)
      const response = await signedTx.execute(this.client)
      const receipt = await response.getReceipt(this.client)

      // Update token registry
      const token = this.tokenRegistry.get(tokenId)
      if (token) {
        token.totalSupply += amount
        this.tokenRegistry.set(tokenId, token)
      }

      // Record mint
      this.transferHistory.push({
        tokenId,
        from: '0.0.0',
        to: this.treasuryAccount.toString(),
        amount,
        timestamp: Date.now(),
        transactionId: response.transactionId.toString(),
        type: 'MINT'
      })

      console.log(`Minted ${amount} additional tokens for ${tokenId}`)
      return true
    } catch (error) {
      console.error('Error minting additional tokens:', error)
      return false
    }
  }

  async burnTokens(tokenId: string, amount: number): Promise<boolean> {
    try {
      const tokenIdObj = TokenId.fromString(tokenId)

      const burnTx = new TokenBurnTransaction()
        .setTokenId(tokenIdObj)
        .setAmount(amount)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client)

      const signedTx = await burnTx.sign(this.operatorKey)
      const response = await signedTx.execute(this.client)
      const receipt = await response.getReceipt(this.client)

      // Update token registry
      const token = this.tokenRegistry.get(tokenId)
      if (token) {
        token.totalSupply -= amount
        this.tokenRegistry.set(tokenId, token)
      }

      // Record burn
      this.transferHistory.push({
        tokenId,
        from: this.treasuryAccount.toString(),
        to: '0.0.0',
        amount,
        timestamp: Date.now(),
        transactionId: response.transactionId.toString(),
        type: 'BURN'
      })

      console.log(`Burned ${amount} tokens for ${tokenId}`)
      return true
    } catch (error) {
      console.error('Error burning tokens:', error)
      return false
    }
  }

  async getTokenInfo(tokenId: string): Promise<InvoiceToken | null> {
    try {
      // First check registry
      const registryToken = this.tokenRegistry.get(tokenId)
      if (registryToken) {
        return registryToken
      }

      // Query Hedera for token info
      const tokenIdObj = TokenId.fromString(tokenId)
      const tokenInfoQuery = new TokenInfoQuery()
        .setTokenId(tokenIdObj)

      const tokenInfo = await tokenInfoQuery.execute(this.client)
      
      // Create basic token info from Hedera data
      const invoiceToken: InvoiceToken = {
        tokenId,
        invoiceId: tokenInfo.tokenMemo || 'unknown',
        symbol: tokenInfo.tokenSymbol,
        name: tokenInfo.tokenName,
        totalSupply: tokenInfo.totalSupply.toNumber(),
        decimals: tokenInfo.decimals,
        faceValue: 0, // Unknown from Hedera data
        maturityDate: Date.now() + 86400000, // Default 1 day
        region: 'UNKNOWN',
        commodity: 'UNKNOWN',
        issuer: tokenInfo.treasuryAccountId.toString(),
        status: 'ACTIVE'
      }

      return invoiceToken
    } catch (error) {
      console.error('Error getting token info:', error)
      return null
    }
  }

  async getAccountTokenBalance(accountId: string, tokenId: string): Promise<number> {
    try {
      const accountIdObj = AccountId.fromString(accountId)
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(accountIdObj)

      const balance = await balanceQuery.execute(this.client)
      const tokenBalance = balance.tokens?.get(TokenId.fromString(tokenId))
      
      return tokenBalance?.toNumber() || 0
    } catch (error) {
      console.error('Error getting account token balance:', error)
      return 0
    }
  }

  async getAccountPortfolio(accountId: string): Promise<TokenPortfolio> {
    try {
      const accountIdObj = AccountId.fromString(accountId)
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(accountIdObj)

      const balance = await balanceQuery.execute(this.client)
      const tokens: TokenPortfolio['tokens'] = []
      let totalValue = 0

      if (balance.tokens) {
        for (const [tokenId, tokenBalance] of balance.tokens.entries()) {
          const tokenInfo = await this.getTokenInfo(tokenId.toString())
          if (tokenInfo) {
            const tokenValue = (tokenBalance.toNumber() / Math.pow(10, tokenInfo.decimals)) * 
                              (tokenInfo.faceValue / tokenInfo.totalSupply)
            
            tokens.push({
              tokenId: tokenId.toString(),
              balance: tokenBalance.toNumber(),
              value: tokenValue,
              metadata: {
                invoiceId: tokenInfo.invoiceId,
                exporter: 'Unknown', // Would need to be stored separately
                importer: 'Unknown',
                commodity: tokenInfo.commodity,
                faceValue: tokenInfo.faceValue,
                tenor: 30, // Default
                region: tokenInfo.region,
                riskScore: 0.1, // Default
                createdAt: Date.now(),
                maturityDate: tokenInfo.maturityDate
              }
            })
            
            totalValue += tokenValue
          }
        }
      }

      return {
        accountId,
        tokens,
        totalValue,
        totalTokens: tokens.length
      }
    } catch (error) {
      console.error('Error getting account portfolio:', error)
      return {
        accountId,
        tokens: [],
        totalValue: 0,
        totalTokens: 0
      }
    }
  }

  async getTokenTransferHistory(tokenId: string): Promise<TokenTransfer[]> {
    return this.transferHistory.filter(transfer => transfer.tokenId === tokenId)
  }

  async getAccountTransferHistory(accountId: string): Promise<TokenTransfer[]> {
    return this.transferHistory.filter(transfer => 
      transfer.from === accountId || transfer.to === accountId
    )
  }

  // Settlement functions
  async settleMaturedToken(tokenId: string): Promise<boolean> {
    try {
      const token = this.tokenRegistry.get(tokenId)
      if (!token) {
        throw new Error('Token not found')
      }

      if (Date.now() < token.maturityDate) {
        throw new Error('Token has not matured yet')
      }

      // Mark token as matured
      token.status = 'MATURED'
      this.tokenRegistry.set(tokenId, token)

      // In a real implementation, this would trigger settlement payments
      console.log(`Token ${tokenId} marked as matured and ready for settlement`)
      return true
    } catch (error) {
      console.error('Error settling matured token:', error)
      return false
    }
  }

  // Utility methods
  getAllTokens(): InvoiceToken[] {
    return Array.from(this.tokenRegistry.values())
  }

  getTokensByRegion(region: string): InvoiceToken[] {
    return Array.from(this.tokenRegistry.values())
      .filter(token => token.region === region)
  }

  getTokensByCommodity(commodity: string): InvoiceToken[] {
    return Array.from(this.tokenRegistry.values())
      .filter(token => token.commodity.toLowerCase().includes(commodity.toLowerCase()))
  }

  getActiveTokens(): InvoiceToken[] {
    return Array.from(this.tokenRegistry.values())
      .filter(token => token.status === 'ACTIVE')
  }

  getMaturedTokens(): InvoiceToken[] {
    return Array.from(this.tokenRegistry.values())
      .filter(token => Date.now() >= token.maturityDate)
  }

  getTotalTokenValue(): number {
    return Array.from(this.tokenRegistry.values())
      .reduce((total, token) => total + token.faceValue, 0)
  }
}

// Export singleton instance
export const htsService = new HederaTokenService()

// Export types for use in other files
export type { InvoiceToken, TokenMetadata, TokenTransfer, TokenPortfolio }