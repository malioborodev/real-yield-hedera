'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { hederaWalletService, WalletConnection, WalletBalance, WalletType } from '@/lib/hedera-wallet'
import { Wallet, Copy, ExternalLink, AlertCircle, CheckCircle, Loader2, Zap, Shield, Coins, Globe, Download } from 'lucide-react'
import { toast } from 'sonner'

interface WalletConnectProps {
  onConnectionChange?: (connection: WalletConnection | null) => void
}

const WALLET_INFO = {
  hashpack: {
    name: 'HashPack',
    description: 'Native Hedera wallet with full ecosystem support',
    icon: '🔷',
    features: ['Native Hedera', 'HTS Support', 'HCS Support', 'Staking'],
    downloadUrl: 'https://www.hashpack.app/'
  },
  blade: {
    name: 'Blade Wallet',
    description: 'Multi-chain wallet with Hedera integration',
    icon: '⚔️',
    features: ['Multi-chain', 'DeFi Ready', 'NFT Support', 'Mobile App'],
    downloadUrl: 'https://bladewallet.io/'
  },
  kabila: {
    name: 'Kabila Wallet',
    description: 'Enterprise-grade Hedera wallet solution',
    icon: '🏛️',
    features: ['Enterprise', 'Security Focus', 'API Access', 'Compliance'],
    downloadUrl: 'https://kabila.app/'
  },
  metamask: {
    name: 'MetaMask',
    description: 'Popular Ethereum wallet with Hedera EVM support',
    icon: '🦊',
    features: ['EVM Compatible', 'Browser Extension', 'Mobile App', 'DApp Browser'],
    downloadUrl: 'https://metamask.io/'
  }
}

export function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableWallets, setAvailableWallets] = useState<Record<WalletType, boolean>>({} as Record<WalletType, boolean>)
  const [showWalletDialog, setShowWalletDialog] = useState(false)

  useEffect(() => {
    checkWalletAvailability()
    
    // Check if already connected
    const existingConnection = hederaWalletService.getConnection()
    if (existingConnection) {
      setConnection(existingConnection)
      loadBalance()
    }

    // Subscribe to wallet events
    const unsubscribe = hederaWalletService.subscribe((event: any) => {
      if (event.type === 'connected') {
        setConnection(event.connection)
        onConnectionChange?.(event.connection)
        loadBalance()
        const walletInfo = WALLET_INFO[event.connection.walletType as keyof typeof WALLET_INFO]
        toast.success(`${walletInfo.name} connected successfully!`)
        setShowWalletDialog(false)
      } else if (event.type === 'disconnected') {
        setConnection(null)
        setBalance(null)
        onConnectionChange?.(null)
        toast.info('Wallet disconnected')
      }
    })

    return () => unsubscribe()
  }, [])

  const checkWalletAvailability = async () => {
    try {
      const availability = await hederaWalletService.checkWalletAvailability()
      setAvailableWallets(availability)
    } catch (error) {
      console.error('Failed to check wallet availability:', error)
    }
  }

  const loadBalance = async () => {
    if (!connection) return
    
    setIsLoading(true)
    try {
      const walletBalance = await hederaWalletService.getAccountBalance()
      setBalance(walletBalance)
    } catch (error) {
      console.error('Failed to load balance:', error)
      toast.error('Failed to load wallet balance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (walletType: WalletType) => {
    if (!availableWallets[walletType]) {
      toast.error(`${WALLET_INFO[walletType].name} is not installed. Please install it first.`)
      window.open(WALLET_INFO[walletType].downloadUrl, '_blank')
      return
    }

    setIsConnecting(true)
    setError(null)
    
    try {
      await hederaWalletService.connectWallet(walletType)
    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error)
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
      toast.error(`Failed to connect ${WALLET_INFO[walletType].name}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await hederaWalletService.disconnectWallet()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      toast.error('Failed to disconnect wallet')
    }
  }

  const copyAccountId = () => {
    if (connection?.accountId) {
      navigator.clipboard.writeText(connection.accountId)
      toast.success('Account ID copied to clipboard')
    }
  }

  const openInExplorer = () => {
    if (connection?.accountId) {
      const baseUrl = connection.network === 'mainnet' 
        ? 'https://hashscan.io/mainnet' 
        : 'https://hashscan.io/testnet'
      window.open(`${baseUrl}/account/${connection.accountId}`, '_blank')
    }
  }

  if (connection) {
    const walletInfo = WALLET_INFO[connection.walletType]
    
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{walletInfo.icon}</span>
              <div>
                <CardTitle className="text-lg">{walletInfo.name}</CardTitle>
                <CardDescription>Connected to {connection.network}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Account Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Account ID</span>
              <div className="flex items-center space-x-1">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {connection.accountId.slice(0, 8)}...{connection.accountId.slice(-6)}
                </code>
                <Button variant="ghost" size="sm" onClick={copyAccountId}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={openInExplorer}>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Balance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Balance</span>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
            
            {balance && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">HBAR</span>
                  </div>
                  <span className="font-mono text-lg">
                    {balance.hbar.toFixed(4)}
                  </span>
                </div>
                
                {balance.tokens.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Tokens</span>
                    {balance.tokens.slice(0, 3).map((token: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                        <span>{token.symbol}</span>
                        <span className="font-mono">{token.balance}</span>
                      </div>
                    ))}
                    {balance.tokens.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{balance.tokens.length - 3} more tokens
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={loadBalance} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-md">
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogTrigger asChild>
          <Button className="w-full" size="lg">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Hedera Wallet</DialogTitle>
            <DialogDescription>
              Choose your preferred wallet to connect to the Real Yield platform
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="all">All Wallets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommended" className="space-y-3">
              {/* HashPack - Primary recommendation */}
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => handleConnect('hashpack')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{WALLET_INFO.hashpack.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{WALLET_INFO.hashpack.name}</span>
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {WALLET_INFO.hashpack.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {WALLET_INFO.hashpack.features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {availableWallets.hashpack ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Installed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          Install
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="all" className="space-y-3">
              {Object.entries(WALLET_INFO).map(([walletType, info]) => (
                <Card key={walletType} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors" 
                      onClick={() => handleConnect(walletType as WalletType)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{info.icon}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{info.name}</span>
                            {walletType === 'hashpack' && (
                              <Badge variant="secondary" className="text-xs">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {info.features.slice(0, 3).map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {availableWallets[walletType as WalletType] ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Installed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            Install
                          </Badge>
                        )}
                        {isConnecting && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              New to Hedera? We recommend starting with{' '}
              <a href="https://www.hashpack.app/" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                HashPack
              </a>{' '}
              for the best experience.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WalletConnect