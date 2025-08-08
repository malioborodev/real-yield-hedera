'use client'

import { Dashboard } from '@/components/dashboard'
import { WalletService, WalletConnection } from '@/lib/wallet-integration'
import { mirrorNodeService } from '@/lib/mirror-node'
import { hcsService } from '@/lib/hcs'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

export default function DashboardPage() {
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null)
  const [invoiceNFTs, setInvoiceNFTs] = useState<any[]>([])
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [stakeAmount, setStakeAmount] = useState(0)
  const { toast } = useToast()
  const walletService = new WalletService()
  
  // Initialize wallet connection
  useEffect(() => {
    const checkWalletStatus = async () => {
      const connection = walletService.getConnection();
      setWalletConnection(connection);
    };
    checkWalletStatus();
    
    // Subscribe to wallet events
    const unsubscribe = walletService.subscribe((connection) => {
      setWalletConnection(connection);
      
      // Load user's invoice NFTs when wallet connects
      if (connection?.isConnected && connection.accountId) {
        loadInvoiceNFTs(connection.accountId);
      } else {
        setInvoiceNFTs([]);
        setAuditTrail([]);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const loadInvoiceNFTs = async (accountId: string) => {
    try {
      const nfts = await mirrorNodeService.getInvoiceNFTs(accountId);
      setInvoiceNFTs(nfts);
    } catch (error) {
      console.error('Failed to load invoice NFTs:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await walletService.connectWallet('hashpack')
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Hedera wallet",
      })
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
      await walletService.disconnectWallet()
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
    if (!walletConnection?.isConnected || stakeAmount <= 0 || stakeAmount > walletConnection.hbarBalance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      })
      return
    }

    try {
      await walletService.stakeHBAR(stakeAmount)
      setStakeAmount(0)
      toast({
        title: "HBAR Staked",
        description: "Successfully staked HBAR",
      })
      
      // Log staking event to HCS
      await hcsService.logAuditEntry({
        eventType: 'COLLATERAL_LOCKED' as any,
        timestamp: Date.now(),
        accountId: walletConnection.accountId,
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
    accountInfo={walletConnection ? {
      accountId: walletConnection.accountId,
      balance: walletConnection.hbarBalance,
      stakedBalance: walletConnection.stakedBalance
    } : undefined}
    isConnected={walletConnection?.isConnected || false}
    invoiceNFTs={invoiceNFTs}
    auditTrail={auditTrail}
    onConnectWallet={handleConnectWallet}
    onDisconnectWallet={handleDisconnectWallet}
    onStakeHBAR={handleStakeHBAR}
    stakeAmount={stakeAmount}
    setStakeAmount={setStakeAmount}
  />
}
