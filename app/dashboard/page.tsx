'use client'

import { Dashboard } from '@/components/dashboard'
import { useHederaWallet } from '@/lib/hedera-wallet'
import { mirrorNodeService } from '@/lib/mirror-node'
import { hcsService } from '@/lib/hcs'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export default function DashboardPage() {
  const { accountInfo, isConnected, connect, disconnect } = useHederaWallet()
  const [invoiceNFTs, setInvoiceNFTs] = useState<any[]>([])
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [stakeAmount, setStakeAmount] = useState(0)
  const { toast } = useToast()

  const handleConnectWallet = async () => {
    try {
      await connect()
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Hedera wallet",
      })
      // Load user's invoice NFTs
      if (accountInfo?.accountId) {
        const nfts = await mirrorNodeService.getInvoiceNFTs(accountInfo.accountId)
        setInvoiceNFTs(nfts)
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Hedera wallet",
        variant: "destructive",
      })
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnect()
      setInvoiceNFTs([])
      setAuditTrail([])
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from Hedera wallet",
      })
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect from Hedera wallet",
        variant: "destructive",
      })
    }
  }

  const handleStakeHBAR = async () => {
    if (!accountInfo || stakeAmount <= 0 || stakeAmount > accountInfo.balance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real implementation, this would interact with staking contracts
      setStakeAmount(0)
      toast({
        title: "HBAR Staked",
        description: "Successfully staked HBAR",
      })
      
      // Log staking event to HCS
      await hcsService.logAuditEntry({
        eventType: 'COLLATERAL_LOCKED' as any,
        timestamp: Date.now(),
        accountId: accountInfo.accountId,
        amount: stakeAmount,
        metadata: { action: 'stake' }
      })
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "Failed to stake HBAR",
        variant: "destructive",
      })
    }
  }

  return <Dashboard 
    accountInfo={accountInfo}
    isConnected={isConnected}
    invoiceNFTs={invoiceNFTs}
    auditTrail={auditTrail}
    onConnectWallet={handleConnectWallet}
    onDisconnectWallet={handleDisconnectWallet}
    onStakeHBAR={handleStakeHBAR}
    stakeAmount={stakeAmount}
    setStakeAmount={setStakeAmount}
  />
}
