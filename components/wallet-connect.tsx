'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  RefreshCw, 
  Loader2,
  ChevronDown
} from 'lucide-react'
import { useWallet } from '@/lib/wallet-service'
import { toast } from 'sonner'

type WalletType = 'HashPack' | 'Blade' | 'Kabila' | 'MetaMask'

const walletIcons: Record<WalletType, string> = {
  HashPack: '🔷',
  Blade: '⚔️',
  Kabila: '🌟',
  MetaMask: '🦊'
}

const walletDescriptions: Record<WalletType, string> = {
  HashPack: 'Native Hedera wallet with full HCS and HTS support',
  Blade: 'Multi-chain wallet with Hedera integration',
  Kabila: 'Enterprise-grade Hedera wallet solution',
  MetaMask: 'Popular Ethereum wallet with Hedera EVM support'
}

export function WalletConnect() {
  const { 
    accountInfo, 
    isConnected, 
    isLoading, 
    connect, 
    disconnect, 
    availableWallets 
  } = useWallet()
  
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)

  const handleWalletSelect = async (walletType: WalletType) => {
    setSelectedWallet(walletType)
    try {
      await connect(walletType)
      setIsWalletDialogOpen(false)
      toast.success(`Connected to ${walletType} successfully!`)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error(`Failed to connect to ${walletType}. Please try again.`)
    } finally {
      setSelectedWallet(null)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast.success('Wallet disconnected successfully')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      toast.error('Failed to disconnect wallet')
    }
  }

  const copyAccountId = async () => {
    if (accountInfo?.accountId) {
      await navigator.clipboard.writeText(accountInfo.accountId)
      toast.success('Account ID copied to clipboard')
    }
  }

  const openHashScan = () => {
    if (accountInfo?.accountId) {
      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'
      const baseUrl = network === 'mainnet' 
        ? 'https://hashscan.io/mainnet' 
        : 'https://hashscan.io/testnet'
      window.open(`${baseUrl}/account/${accountInfo.accountId}`, '_blank')
    }
  }

  const formatHBAR = (value: number) => {
    return `${value.toFixed(2)} ℏ`
  }

  const getNetworkStatus = () => {
    return process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'
  }

  return (
    <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-app-gray-900 dark:text-app-gray-50">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-app-green-600" />
            <span>Hedera Wallet</span>
          </div>
          <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${
            isConnected 
              ? 'bg-app-green-100 text-app-green-700 border border-app-green-200 dark:bg-app-green-900 dark:text-app-green-200' 
              : 'bg-app-red-100 text-app-red-700 border border-app-red-200 dark:bg-app-red-900 dark:text-app-red-200'
          }`}>
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected via {accountInfo?.walletType}
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {isConnected && accountInfo ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">
                  Wallet Type
                </label>
                <p className="text-base font-mono text-app-gray-900 dark:text-app-gray-50">
                  {walletIcons[accountInfo.walletType as WalletType]} {accountInfo.walletType}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">
                  Network
                </label>
                <p className="text-base font-mono text-app-gray-900 dark:text-app-gray-50 capitalize">
                  {getNetworkStatus()}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">
                  Account ID
                </label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyAccountId} 
                  className="h-6 w-6 p-0 text-app-gray-500 hover:bg-app-gray-100 dark:hover:bg-app-gray-700"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm font-mono text-app-gray-900 dark:text-app-gray-50 bg-app-gray-50 dark:bg-app-gray-900 p-2 rounded-md break-all">
                {accountInfo.accountId}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">
                Balance
              </label>
              <p className="text-3xl font-bold text-app-green-600 dark:text-app-green-400">
                {formatHBAR(accountInfo.balance)}
              </p>
            </div>

            {accountInfo.evmAddress && (
              <div>
                <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">
                  EVM Address
                </label>
                <p className="text-xs font-mono text-app-gray-500 dark:text-app-gray-400 bg-app-gray-50 dark:bg-app-gray-900 p-2 rounded-md break-all">
                  {accountInfo.evmAddress}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-3 border-t border-app-gray-200 dark:border-app-gray-700">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openHashScan}
                className="flex-1 border-app-gray-300 dark:border-app-gray-700 text-app-gray-800 dark:text-app-gray-200 hover:bg-app-gray-100 dark:hover:bg-app-gray-700"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View on HashScan
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                className="flex-1 text-app-red-600 border-app-red-300 hover:bg-app-red-50 dark:border-app-red-700 dark:hover:bg-app-red-900/20" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Wallet className="w-12 h-12 text-app-gray-400 dark:text-app-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-app-gray-900 dark:text-app-gray-50 mb-2">
              Connect Your Hedera Wallet
            </h3>
            <p className="text-sm text-app-gray-600 dark:text-app-gray-400 mb-4">
              Connect your Hedera wallet to start trading invoice NFTs and earning real yield.
            </p>
            
            <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-app-green-600 hover:bg-app-green-700 text-white py-2 rounded-md shadow-sm" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-app-green-600" />
                    <span>Choose Your Wallet</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-3 mt-4">
                  {availableWallets.map((walletType) => (
                    <Button
                      key={walletType}
                      variant="outline"
                      className="w-full justify-start h-auto p-4 border-2 hover:border-app-green-500 hover:bg-app-green-50 dark:hover:bg-app-green-900/20"
                      onClick={() => handleWalletSelect(walletType)}
                      disabled={isLoading && selectedWallet === walletType}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <span className="text-2xl">{walletIcons[walletType]}</span>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-app-gray-900 dark:text-app-gray-50">
                            {walletType}
                          </div>
                          <div className="text-xs text-app-gray-500 dark:text-app-gray-400">
                            {walletDescriptions[walletType]}
                          </div>
                        </div>
                        {isLoading && selectedWallet === walletType && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-app-blue-50 dark:bg-app-blue-900/20 rounded-lg">
                  <p className="text-xs text-app-blue-700 dark:text-app-blue-300">
                    💡 <strong>Tip:</strong> HashPack and Blade offer the best experience for Hedera native features like HCS and HTS.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            
            <p className="text-xs text-app-gray-500 dark:text-app-gray-400 mt-2">
              Supports HashPack, Blade, Kabila, and MetaMask wallets
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}