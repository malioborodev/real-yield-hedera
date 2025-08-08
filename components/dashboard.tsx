'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/header'
import { useToast } from '@/components/ui/use-toast'
import { OverviewTab } from '@/components/dashboard/overview-tab'
import { CreateTab } from '@/components/dashboard/create-tab'
import { MarketplaceTab } from '@/components/dashboard/marketplace-tab'
import { PortfolioTab } from '@/components/dashboard/portfolio-tab'

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
  
  // Mock hederaWallet object for compatibility
  const hederaWallet = {
    createInvoiceTransaction: async (data: any, metadata: any, collateral: any) => {
      return { success: true, txId: 'mock-tx-id', message: 'Transaction successful' }
    },
    releaseCollateralTransaction: async (invoiceId: any, amount: any) => {
      return { success: true, txId: 'mock-tx-id', message: 'Collateral released' }
    },
    stakeHBAR: async (amount: number) => {
      await onStakeHBAR()
      return { success: true, txId: 'mock-tx-id', message: 'HBAR staked successfully' }
    }
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
            />
          </TabsContent>

          <TabsContent value="create" className="space-y-8">
            <CreateTab 
              isWalletConnected={isWalletConnected}
              walletBalance={walletBalance}
              stakedBalance={stakedBalance}
              hederaWallet={hederaWallet}
              onStakeHBAR={onStakeHBAR}
              toast={toast}
            />
          </TabsContent>

          <TabsContent value="market" className="space-y-8">
            <MarketplaceTab 
              isWalletConnected={isWalletConnected}
              walletBalance={walletBalance}
              onConnectWallet={onConnectWallet}
            />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-8">
            <PortfolioTab 
              isWalletConnected={isWalletConnected}
              walletBalance={walletBalance}
              stakedBalance={stakedBalance}
              hederaWallet={hederaWallet}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
