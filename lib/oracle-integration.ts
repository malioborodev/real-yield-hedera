'use client'

import { Client, AccountId, PrivateKey } from '@hashgraph/sdk'

// Oracle data interfaces
interface ChainlinkPrice {
  symbol: string
  price: number
  timestamp: number
  confidence: number
}

interface SupraOracleData {
  commodity: string
  price: number
  volatility: number
  region: string
  timestamp: number
}

interface ProofOfReserveData {
  tokenId: string
  reserveAmount: number
  collateralRatio: number
  lastAudit: number
}

interface AggregatedRiskData {
  baseRate: number
  volatilityAdjustment: number
  regionalRisk: number
  commodityRisk: number
  finalAPR: number
  confidence: number
}

export class OracleAggregator {
  private client: Client
  private chainlinkFeeds: Map<string, string> = new Map()
  private supraEndpoints: Map<string, string> = new Map()

  constructor() {
    // Initialize Hedera client for testnet
    this.client = Client.forTestnet()
    
    // Initialize Chainlink price feed addresses on Hedera
    this.initializeChainlinkFeeds()
    
    // Initialize Supra Oracle endpoints
    this.initializeSupraEndpoints()
  }

  private initializeChainlinkFeeds() {
    // Chainlink price feeds on Hedera Testnet
    this.chainlinkFeeds.set('HBAR/USD', '0x0000000000000000000000000000000000000001')
    this.chainlinkFeeds.set('BTC/USD', '0x0000000000000000000000000000000000000002')
    this.chainlinkFeeds.set('ETH/USD', '0x0000000000000000000000000000000000000003')
    this.chainlinkFeeds.set('PALM_OIL/USD', '0x0000000000000000000000000000000000000004')
    this.chainlinkFeeds.set('COFFEE/USD', '0x0000000000000000000000000000000000000005')
  }

  private initializeSupraEndpoints() {
    // Supra Oracle API endpoints for different regions
    this.supraEndpoints.set('APAC', 'https://api.supra.com/apac/v1')
    this.supraEndpoints.set('EMEA', 'https://api.supra.com/emea/v1')
    this.supraEndpoints.set('AMERICAS', 'https://api.supra.com/americas/v1')
  }

  async getChainlinkPrices(symbols: string[]): Promise<ChainlinkPrice[]> {
    try {
      const prices: ChainlinkPrice[] = []
      
      for (const symbol of symbols) {
        const feedAddress = this.chainlinkFeeds.get(symbol)
        if (!feedAddress) continue

        // Simulate Chainlink price feed call
        // In production, this would call the actual Chainlink contract
        const mockPrice = this.generateMockPrice(symbol)
        
        prices.push({
          symbol,
          price: mockPrice,
          timestamp: Date.now(),
          confidence: 0.95 + Math.random() * 0.05
        })
      }
      
      return prices
    } catch (error) {
      console.error('Error fetching Chainlink prices:', error)
      return []
    }
  }

  async getSupraOracleData(commodity: string, region: string): Promise<SupraOracleData | null> {
    try {
      const endpoint = this.supraEndpoints.get(region) || this.supraEndpoints.get('APAC')
      
      // Simulate Supra Oracle API call
      // In production, this would make actual HTTP requests
      const mockData: SupraOracleData = {
        commodity,
        price: this.generateCommodityPrice(commodity),
        volatility: this.generateVolatility(commodity),
        region,
        timestamp: Date.now()
      }
      
      return mockData
    } catch (error) {
      console.error('Error fetching Supra Oracle data:', error)
      return null
    }
  }

  async getProofOfReserveHTS(tokenIds: string[]): Promise<ProofOfReserveData[]> {
    try {
      const reserves: ProofOfReserveData[] = []
      
      for (const tokenId of tokenIds) {
        // Query HTS token supply and metadata
        // In production, this would query actual HTS tokens
        const mockReserve: ProofOfReserveData = {
          tokenId,
          reserveAmount: 1000000 + Math.random() * 5000000,
          collateralRatio: 1.2 + Math.random() * 0.3,
          lastAudit: Date.now() - Math.random() * 86400000 // Last 24 hours
        }
        
        reserves.push(mockReserve)
      }
      
      return reserves
    } catch (error) {
      console.error('Error fetching HTS proof of reserve:', error)
      return []
    }
  }

  async getAggregatedRiskData(commodity: string, region: string, faceValue: number): Promise<AggregatedRiskData> {
    try {
      // Get data from all oracle sources
      const chainlinkPrices = await this.getChainlinkPrices(['HBAR/USD', `${commodity}/USD`])
      const supraData = await this.getSupraOracleData(commodity, region)
      const reserves = await this.getProofOfReserveHTS(['0.0.123456'])
      
      // Calculate base rate from multiple sources
      const baseRate = this.calculateBaseRate(chainlinkPrices, supraData)
      
      // Calculate volatility adjustment
      const volatilityAdjustment = supraData ? supraData.volatility * 0.1 : 0.5
      
      // Calculate regional risk premium
      const regionalRisk = this.getRegionalRiskPremium(region)
      
      // Calculate commodity-specific risk
      const commodityRisk = this.getCommodityRisk(commodity)
      
      // Calculate final APR
      const finalAPR = baseRate + volatilityAdjustment + regionalRisk + commodityRisk
      
      // Calculate confidence based on data quality
      const confidence = this.calculateConfidence(chainlinkPrices, supraData, reserves)
      
      return {
        baseRate,
        volatilityAdjustment,
        regionalRisk,
        commodityRisk,
        finalAPR: Math.max(8, Math.min(15, finalAPR)), // Clamp between 8-15%
        confidence
      }
    } catch (error) {
      console.error('Error aggregating risk data:', error)
      
      // Return fallback data
      return {
        baseRate: 10,
        volatilityAdjustment: 1,
        regionalRisk: 0.5,
        commodityRisk: 0.5,
        finalAPR: 12,
        confidence: 0.8
      }
    }
  }

  private generateMockPrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'HBAR/USD': 0.12,
      'BTC/USD': 45000,
      'ETH/USD': 3000,
      'PALM_OIL/USD': 850,
      'COFFEE/USD': 1.8
    }
    
    const basePrice = basePrices[symbol] || 100
    const volatility = 0.02 // 2% volatility
    const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2
    
    return basePrice * randomFactor
  }

  private generateCommodityPrice(commodity: string): number {
    const basePrices: { [key: string]: number } = {
      'Crude Palm Oil': 850,
      'Arabica Coffee Beans': 1.8,
      'Natural Rubber RSS3': 1.4,
      'Cocoa Beans': 2.5,
      'Jasmine Rice': 0.6,
      'Black Pepper': 4.2,
      'Coconut Oil': 1200,
      'Vanilla Beans': 500,
      'Cloves': 8.5,
      'Nutmeg': 12.0
    }
    
    const basePrice = basePrices[commodity] || 100
    const volatility = 0.05 // 5% volatility for commodities
    const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2
    
    return basePrice * randomFactor
  }

  private generateVolatility(commodity: string): number {
    const baseVolatilities: { [key: string]: number } = {
      'Crude Palm Oil': 0.15,
      'Arabica Coffee Beans': 0.25,
      'Natural Rubber RSS3': 0.20,
      'Cocoa Beans': 0.18,
      'Jasmine Rice': 0.12,
      'Black Pepper': 0.30,
      'Coconut Oil': 0.16,
      'Vanilla Beans': 0.35,
      'Cloves': 0.28,
      'Nutmeg': 0.32
    }
    
    return baseVolatilities[commodity] || 0.20
  }

  private calculateBaseRate(chainlinkPrices: ChainlinkPrice[], supraData: SupraOracleData | null): number {
    // Base rate calculation using multiple oracle sources
    let baseRate = 8.0 // Minimum base rate
    
    // Adjust based on HBAR price stability
    const hbarPrice = chainlinkPrices.find(p => p.symbol === 'HBAR/USD')
    if (hbarPrice && hbarPrice.confidence > 0.9) {
      baseRate += (1 - hbarPrice.confidence) * 2
    }
    
    // Adjust based on commodity price volatility
    if (supraData && supraData.volatility > 0.2) {
      baseRate += supraData.volatility * 5
    }
    
    return baseRate
  }

  private getRegionalRiskPremium(region: string): number {
    const regionalPremiums: { [key: string]: number } = {
      'APAC': 0.5,
      'EMEA': 0.8,
      'AMERICAS': 0.3,
      'AFRICA': 1.2,
      'MIDDLE_EAST': 1.0
    }
    
    return regionalPremiums[region] || 0.5
  }

  private getCommodityRisk(commodity: string): number {
    const commodityRisks: { [key: string]: number } = {
      'Crude Palm Oil': 0.3,
      'Arabica Coffee Beans': 0.8,
      'Natural Rubber RSS3': 0.6,
      'Cocoa Beans': 0.5,
      'Jasmine Rice': 0.2,
      'Black Pepper': 1.0,
      'Coconut Oil': 0.4,
      'Vanilla Beans': 1.2,
      'Cloves': 0.9,
      'Nutmeg': 1.1
    }
    
    return commodityRisks[commodity] || 0.5
  }

  private calculateConfidence(
    chainlinkPrices: ChainlinkPrice[],
    supraData: SupraOracleData | null,
    reserves: ProofOfReserveData[]
  ): number {
    let confidence = 0
    let sources = 0
    
    // Chainlink confidence
    if (chainlinkPrices.length > 0) {
      const avgConfidence = chainlinkPrices.reduce((sum, p) => sum + p.confidence, 0) / chainlinkPrices.length
      confidence += avgConfidence * 0.4
      sources++
    }
    
    // Supra Oracle confidence
    if (supraData) {
      confidence += 0.9 * 0.4 // Assume high confidence for Supra
      sources++
    }
    
    // HTS reserves confidence
    if (reserves.length > 0) {
      const recentAudits = reserves.filter(r => Date.now() - r.lastAudit < 86400000).length
      const auditConfidence = recentAudits / reserves.length
      confidence += auditConfidence * 0.2
      sources++
    }
    
    return sources > 0 ? confidence : 0.8
  }

  // Utility method to get real-time exchange rates
  async getHBARExchangeRate(): Promise<number> {
    const hbarPrices = await this.getChainlinkPrices(['HBAR/USD'])
    return hbarPrices.length > 0 ? hbarPrices[0].price : 0.12
  }

  // Method to convert USD amounts to HBAR
  async convertUSDToHBAR(usdAmount: number): Promise<number> {
    const exchangeRate = await this.getHBARExchangeRate()
    return usdAmount / exchangeRate
  }

  // Method to convert HBAR amounts to USD
  async convertHBARToUSD(hbarAmount: number): Promise<number> {
    const exchangeRate = await this.getHBARExchangeRate()
    return hbarAmount * exchangeRate
  }
}

// Export singleton instance
export const oracleAggregator = new OracleAggregator()