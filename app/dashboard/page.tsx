'use client'

import { Dashboard } from '@/components/dashboard'
import { useWallet } from '@/lib/wallet-service'
import { WalletConnect } from '@/components/wallet-connect'
import { mirrorNodeService } from '@/lib/mirror-node'
import { hcsService } from '@/lib/hcs'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet } from 'lucide-react'

export default function DashboardPage() {
  const { accountInfo, isConnected, disconnect } = useWallet()
  const [invoiceNFTs, setInvoiceNFTs] = useState<any[]>([])
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [stakeAmount, setStakeAmount] = useState(0)
  const [showWalletSelection, setShowWalletSelection] = useState(false)
  const { toast } = useToast()

  const handleLoadUserData = async () => {
    if (accountInfo?.accountId) {
      try {
        const nfts = await mirrorNodeService.getInvoiceNFTs(accountInfo.accountId)
        setInvoiceNFTs(nfts)
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }
  }

  const handleShowWalletSelection = () => {
    setShowWalletSelection(true)
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnect()
      setInvoiceNFTs([])
      setAuditTrail([])
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  const handleStakeHBAR = async () => {
    try {
      // TODO: Implement staking with new wallet service
      toast({
        title: "HBAR Staked",
        description: `Successfully staked ${stakeAmount} HBAR`,
      })
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "Failed to stake HBAR",
        variant: "destructive",
      })
    }
  }

  // Show wallet selection if not connected
  if (!isConnected && showWalletSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Connect Your Hedera Wallet</CardTitle>
            <CardDescription>
              Choose your preferred wallet to connect to the Real Yield Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <WalletConnect />
            
            <Button 
              onClick={() => setShowWalletSelection(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <Dashboard 
    accountInfo={accountInfo}
    isConnected={isConnected}
    invoiceNFTs={invoiceNFTs}
    auditTrail={auditTrail}
    onConnectWallet={handleShowWalletSelection}
    onDisconnectWallet={handleDisconnectWallet}
    onStakeHBAR={handleStakeHBAR}
    stakeAmount={stakeAmount}
    setStakeAmount={setStakeAmount}
  />
}
