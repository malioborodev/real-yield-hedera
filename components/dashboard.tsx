'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/header'
import { useToast } from '@/components/ui/use-toast'
import { OverviewTab } from '@/components/dashboard/overview-tab'
import { CreateTab } from '@/components/dashboard/create-tab'
import { MarketplaceTab } from '@/components/dashboard/marketplace-tab'
import { PortfolioTab } from '@/components/dashboard/portfolio-tab'
import {
  kpiData,
  riskDistribution,
  topInvoices,
  liveTrades,
  portfolioData,
  categoryData,
  calculateRealYield,
  formatCurrency,
  formatHBAR,
  getRiskColor,
  simulateAiRisk
} from '@/components/dashboard/shared/data'

// Interface definitions
interface DashboardProps {
  accountInfo: any
  isConnected: boolean
  invoiceNFTs: any[]
  auditTrail: any[]
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
  onStakeHBAR: () => Promise<void>
  stakeAmount: number
  setStakeAmount: (amount: number) => void
}

export function Dashboard({
  accountInfo,
  isConnected,
  invoiceNFTs,
  auditTrail,
  onConnectWallet,
  onDisconnectWallet,
  onStakeHBAR,
  stakeAmount,
  setStakeAmount
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()
  
  // Map props to local variables for compatibility
  const isWalletConnected = isConnected
  const walletBalance = accountInfo?.balance || 0
  const stakedBalance = accountInfo?.stakedBalance || 0
  
  // Create Tab State
  const [exporter, setExporter] = useState('')
  const [importer, setImporter] = useState('')
  const [commodity, setCommodity] = useState('')
  const [faceValue, setFaceValue] = useState<number | ''>('')
  const [tenor, setTenor] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('')
  const [estimatedPd, setEstimatedPd] = useState<number | null>(null)
  const [discountRatePreview, setDiscountRatePreview] = useState<number | null>(null)
  const [projectedIrrPreview, setProjectedIrrPreview] = useState<number | null>(null)
  const [requiredHbarCollateral, setRequiredHbarCollateral] = useState<number | null>(null)
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'calculating' | 'minting' | 'success' | 'error' | 'calculated'>('idle')
  const [mintingMessage, setMintingMessage] = useState('')
  const [releaseInvoiceId, setReleaseInvoiceId] = useState('')
  const [releaseCollateralAmount, setReleaseCollateralAmount] = useState<number | ''>('')
  const [releaseStatus, setReleaseStatus] = useState<'idle' | 'releasing' | 'success' | 'error'>('idle')
  const [releaseMessage, setReleaseMessage] = useState('')
  const [stakingStatus, setStakingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [stakingMessage, setStakingMessage] = useState('')
  const [totalInvoiceValueForStake, setTotalInvoiceValueForStake] = useState<number | ''>('')
  const [calculatedRequiredStake, setCalculatedRequiredStake] = useState<number | null>(null)
  
  // Marketplace Tab State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [minIrr, setMinIrr] = useState<number | ''>('')
  const [maxTenor, setMaxTenor] = useState<number | ''>('')
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'purchasing' | 'success' | 'error'>('idle')
  const [purchaseMessage, setPurchaseMessage] = useState('')
  
  // Calculate derived values
  const currentTVL = kpiData[kpiData.length - 1]?.tvl || 0
  const currentYield = kpiData[kpiData.length - 1]?.yield || 0
  const insurancePool = kpiData[kpiData.length - 1]?.insurancePool || 0
  const missingHbarForCollateral = Math.max(0, (requiredHbarCollateral || 0) - walletBalance)
  const missingHbarForCalculatedStake = Math.max(0, (calculatedRequiredStake || 0) - walletBalance)
  
  // Mock portfolio data
  const portfolioInvoices = portfolioData.map(item => ({
    id: item.id,
    exporter: topInvoices.find(inv => inv.id === item.id)?.exporter || 'Unknown Exporter',
    importer: topInvoices.find(inv => inv.id === item.id)?.importer || 'Unknown Importer',
    commodity: item.commodity,
    country: topInvoices.find(inv => inv.id === item.id)?.origin?.split(',').pop()?.trim() || 'Unknown',
    faceValue: item.faceValue,
    buyPrice: item.invested,
    currentValue: item.currentValue,
    projectedReturn: item.faceValue,
    actualReturn: item.status === 'Settled' ? item.faceValue : undefined,
    daysRemaining: item.daysLeft,
    totalDays: item.tenor,
    status: item.status.toLowerCase() as 'active' | 'matured' | 'defaulted' | 'early_settlement',
    purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    maturityDate: new Date(Date.now() + item.daysLeft * 24 * 60 * 60 * 1000).toISOString(),
    riskLevel: item.pd <= 0.2 ? 'low' : item.pd <= 0.4 ? 'medium' : 'high' as 'low' | 'medium' | 'high',
    estimatedPd: item.pd * 100,
    projectedIrr: calculateRealYield(item.faceValue, item.pd, item.tenor).irr,
    actualIrr: item.status === 'Settled' ? calculateRealYield(item.faceValue, item.pd, item.tenor).irr : undefined
  }))
  
  const portfolioStats = {
    totalInvested: portfolioInvoices.reduce((sum, inv) => sum + inv.buyPrice, 0),
    currentValue: portfolioInvoices.reduce((sum, inv) => sum + inv.currentValue, 0),
    totalReturns: portfolioInvoices.filter(inv => inv.actualReturn).reduce((sum, inv) => sum + (inv.actualReturn! - inv.buyPrice), 0),
    unrealizedGains: portfolioInvoices.filter(inv => inv.status === 'active').reduce((sum, inv) => sum + (inv.currentValue - inv.buyPrice), 0),
    realizedGains: portfolioInvoices.filter(inv => inv.actualReturn).reduce((sum, inv) => sum + (inv.actualReturn! - inv.buyPrice), 0),
    averageIrr: portfolioInvoices.reduce((sum, inv) => sum + (inv.actualIrr || inv.projectedIrr), 0) / portfolioInvoices.length || 0,
    activeInvestments: portfolioInvoices.filter(inv => inv.status === 'active').length,
    maturedInvestments: portfolioInvoices.filter(inv => inv.status === 'matured').length,
    defaultedInvestments: portfolioInvoices.filter(inv => inv.status === 'defaulted').length
  }
  
  // Convert topInvoices to marketplace format
  const marketplaceInvoices = topInvoices.map(invoice => {
    const calc = calculateRealYield(invoice.faceValue, invoice.pd, invoice.tenor)
    return {
      id: invoice.id,
      exporter: invoice.exporter,
      importer: invoice.importer,
      commodity: invoice.commodity,
      faceValue: invoice.faceValue,
      buyPrice: calc.buyPrice,
      tenor: invoice.tenor,
      daysRemaining: invoice.tenor,
      estimatedPd: invoice.pd * 100,
      projectedIrr: calc.irr,
      country: invoice.origin.split(',').pop()?.trim() || 'Unknown',
      status: 'available' as const,
      createdAt: new Date().toISOString()
    }
  })
   
   // Handler functions
   const handleCalculateYield = () => {
     if (typeof faceValue === 'number' && typeof tenor === 'number') {
       setMintingStatus('calculating')
       const pd = simulateAiRisk(faceValue, tenor)
       const calc = calculateRealYield(faceValue, pd, tenor)
       
       setEstimatedPd(pd)
       setDiscountRatePreview(calc.discountRate)
       setProjectedIrrPreview(calc.irr)
       setRequiredHbarCollateral(calc.requiredCollateral)
       setMintingStatus('calculated')
       setMintingMessage('Yield calculation completed successfully')
     }
   }
   
   const handleMintNFT = async () => {
     setMintingStatus('minting')
     try {
       // Simulate minting process
       await new Promise(resolve => setTimeout(resolve, 2000))
       setMintingStatus('success')
       setMintingMessage('Invoice NFT minted successfully!')
       toast({ title: 'Success', description: 'Invoice NFT minted successfully!' })
     } catch (error) {
       setMintingStatus('error')
       setMintingMessage('Failed to mint NFT')
       toast({ title: 'Error', description: 'Failed to mint NFT', variant: 'destructive' })
     }
   }
   
   const handleReleaseCollateral = async () => {
     setReleaseStatus('releasing')
     try {
       await new Promise(resolve => setTimeout(resolve, 1500))
       setReleaseStatus('success')
       setReleaseMessage('Collateral released successfully!')
       toast({ title: 'Success', description: 'Collateral released successfully!' })
     } catch (error) {
       setReleaseStatus('error')
       setReleaseMessage('Failed to release collateral')
       toast({ title: 'Error', description: 'Failed to release collateral', variant: 'destructive' })
     }
   }
   
   const handleStake = async (amount: number) => {
     setStakingStatus('processing')
     try {
       await onStakeHBAR()
       setStakingStatus('success')
       setStakingMessage(`Successfully staked ${formatHBAR(amount)}`)
       toast({ title: 'Success', description: `Successfully staked ${formatHBAR(amount)}` })
     } catch (error) {
       setStakingStatus('error')
       setStakingMessage('Failed to stake HBAR')
       toast({ title: 'Error', description: 'Failed to stake HBAR', variant: 'destructive' })
     }
   }
   
   const handlePurchaseInvoice = async (invoiceId: string) => {
     setPurchaseStatus('purchasing')
     try {
       await new Promise(resolve => setTimeout(resolve, 2000))
       setPurchaseStatus('success')
       setPurchaseMessage(`Successfully purchased invoice ${invoiceId}`)
       toast({ title: 'Success', description: `Successfully purchased invoice ${invoiceId}` })
     } catch (error) {
       setPurchaseStatus('error')
       setPurchaseMessage('Failed to purchase invoice')
       toast({ title: 'Error', description: 'Failed to purchase invoice', variant: 'destructive' })
     }
   }
   
   const handleViewDetails = (invoiceId: string) => {
     toast({ title: 'Info', description: `Viewing details for invoice ${invoiceId}` })
   }
   
   const handleViewInvoiceDetails = (invoiceId: string) => {
     toast({ title: 'Info', description: `Viewing portfolio details for invoice ${invoiceId}` })
   }
   
   const handleDownloadReport = () => {
     toast({ title: 'Info', description: 'Downloading portfolio report...' })
   }

  return (
    <div className="min-h-screen bg-app-gray-50 text-app-gray-900 dark:bg-app-gray-950 dark:text-app-50">
      <Header showNav={false} showCreateInvoice={true} />

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-app-gray-100/80 dark:bg-app-gray-800/80 border border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Overview</TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Create</TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Market</TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <OverviewTab 
              isWalletConnected={isWalletConnected}
              walletBalance={walletBalance}
              stakedBalance={stakedBalance}
              onConnectWallet={onConnectWallet}
              onDisconnectWallet={onDisconnectWallet}
              kpiData={kpiData}
              riskDistribution={riskDistribution}
              topInvoices={topInvoices}
              liveTrades={liveTrades}
              formatCurrency={formatCurrency}
              formatHBAR={formatHBAR}
              getRiskColor={getRiskColor}
            />
          </TabsContent>

          <TabsContent value="create" className="space-y-8">
            <CreateTab 
              isWalletConnected={isWalletConnected}
              walletBalance={walletBalance}
              stakedBalance={stakedBalance}
              exporter={exporter}
              setExporter={setExporter}
              importer={importer}
              setImporter={setImporter}
              commodity={commodity}
              setCommodity={setCommodity}
              faceValue={faceValue}
              setFaceValue={setFaceValue}
              tenor={tenor}
              setTenor={setTenor}
              quantity={quantity}
              setQuantity={setQuantity}
              estimatedPd={estimatedPd}
              discountRatePreview={discountRatePreview}
              projectedIrrPreview={projectedIrrPreview}
              requiredHbarCollateral={requiredHbarCollateral}
              mintingStatus={mintingStatus}
              mintingMessage={mintingMessage}
              releaseInvoiceId={releaseInvoiceId}
              setReleaseInvoiceId={setReleaseInvoiceId}
              releaseCollateralAmount={releaseCollateralAmount}
              setReleaseCollateralAmount={setReleaseCollateralAmount}
              releaseStatus={releaseStatus}
              releaseMessage={releaseMessage}
              stakingStatus={stakingStatus}
              stakingMessage={stakingMessage}
              stakeAmount={stakeAmount}
              setStakeAmount={setStakeAmount}
              totalInvoiceValueForStake={totalInvoiceValueForStake}
              setTotalInvoiceValueForStake={setTotalInvoiceValueForStake}
              calculatedRequiredStake={calculatedRequiredStake}
              missingHbarForCollateral={missingHbarForCollateral}
              missingHbarForCalculatedStake={missingHbarForCalculatedStake}
              onCalculateYield={handleCalculateYield}
              onMintNFT={handleMintNFT}
              onReleaseCollateral={handleReleaseCollateral}
              onStake={handleStake}
              formatCurrency={formatCurrency}
              formatHBAR={formatHBAR}
            />
          </TabsContent>

          <TabsContent value="market" className="space-y-8">
            <MarketplaceTab 
              isWalletConnected={isWalletConnected}
              walletBalance={walletBalance}
              onConnectWallet={onConnectWallet}
              invoices={marketplaceInvoices}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedCommodity={selectedCommodity}
              setSelectedCommodity={setSelectedCommodity}
              minIrr={minIrr}
              setMinIrr={setMinIrr}
              maxTenor={maxTenor}
              setMaxTenor={setMaxTenor}
              purchaseStatus={purchaseStatus}
              purchaseMessage={purchaseMessage}
              onPurchaseInvoice={handlePurchaseInvoice}
              onViewDetails={handleViewDetails}
              formatCurrency={formatCurrency}
              formatHBAR={formatHBAR}
              getRiskColor={getRiskColor}
            />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-8">
            <PortfolioTab 
              isWalletConnected={isWalletConnected}
              walletBalance={walletBalance}
              stakedBalance={stakedBalance}
              portfolioInvoices={portfolioInvoices}
              portfolioStats={portfolioStats}
              portfolioData={portfolioData}
              categoryData={categoryData}
              onViewInvoiceDetails={handleViewInvoiceDetails}
              onDownloadReport={handleDownloadReport}
              formatCurrency={formatCurrency}
              formatHBAR={formatHBAR}
              getRiskColor={getRiskColor}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
