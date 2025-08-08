'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { walletService, WalletConnection, WalletBalance, WalletType } from '@/lib/wallet-integration'
import { Wallet, Copy, ExternalLink, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface WalletConnectProps {
  onConnectionChange?: (connection: WalletConnection | null) => void
}

export function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [availableWallets, setAvailableWallets] = useState<Record<WalletType, boolean>>({})

  useEffect(() => {
    checkWalletAvailability()
    
    // Check if already connected
    const existingConnection = walletService.getConnection()
    if (existingConnection) {
      setConnection(existingConnection)
      loadBalance()
    }

    // Subscribe to wallet events
    const handleConnection = (conn: WalletConnection) => {
      setConnection(conn)
      onConnectionChange?.(conn)
      loadBalance()
      toast.success('Wallet connected successfully!')
    }

    const handleDisconnection = () => {
      setConnection(null)
      setBalance(null)
      onConnectionChange?.(null)
      toast.info('Wallet disconnected')
    }

    walletService.subscribe('connection', handleConnection)
    walletService.subscribe('disconnection', handleDisconnection)

    return () => {
      walletService.unsubscribe('connection', handleConnection)
      walletService.unsubscribe('disconnection', handleDisconnection)
    }
  }, [])

  const checkWalletAvailability = async () => {
    const wallets = walletService.getSupportedWallets()
    const availability: Record<WalletType, boolean> = {} as any
    
    for (const wallet of wallets) {
      availability[wallet] = await walletService.checkWalletAvailability(wallet)
    }
    
    setAvailableWallets(availability)
  }

  const loadBalance = async () => {
    try {
      setIsLoading(true)
      const walletBalance = await walletService.getAccountBalance()
      setBalance(walletBalance)
    } catch (error) {
      console.error('Failed to load balance:', error)
      toast.error('Failed to load wallet balance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (walletType: WalletType, options?: any) => {
    try {
      setIsConnecting(true)
      setError(null)
      
      const conn = await walletService.connectWallet(walletType, options)
      setConnection(conn)
      onConnectionChange?.(conn)
      
      // Load balance after connection
      await loadBalance()
    } catch (error: any) {
      setError(error.message)
      toast.error(`Failed to connect: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await walletService.disconnectWallet()
      setConnection(null)
      setBalance(null)
      onConnectionChange?.(null)
    } catch (error: any) {
      toast.error(`Failed to disconnect: ${error.message}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const formatAccountId = (accountId: string) => {
    return `${accountId.slice(0, 8)}...${accountId.slice(-6)}`
  }

  const formatBalance = (amount: number, decimals: number = 8) => {
    return (amount / Math.pow(10, decimals)).toFixed(4)
  }

  const getWalletIcon = (walletType: WalletType) => {
    const icons = {
      hashpack: '🔗',
      blade: '⚔️',
      kabila: '🏛️',
      'metamask-hedera': '🦊',
      'private-key': '🔑'
    }
    return icons[walletType] || '💼'
  }

  const getWalletName = (walletType: WalletType) => {
    const names = {
      hashpack: 'HashPack',
      blade: 'Blade Wallet',
      kabila: 'Kabila Wallet',
      'metamask-hedera': 'MetaMask (Hedera)',
      'private-key': 'Private Key'
    }
    return names[walletType] || walletType
  }

  if (connection) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <CardTitle className="text-lg">Wallet Connected</CardTitle>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
          <CardDescription>
            Network: {connection.network.toUpperCase()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Account Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Account ID</Label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm">
                {formatAccountId(connection.accountId)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(connection.accountId)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Balance */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Loading balance...</span>
            </div>
          ) : balance ? (
            <div className="space-y-3">
              <Separator />
              
              {/* HBAR Balance */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">HBAR Balance</span>
                <span className="text-sm font-mono">{balance.hbar.toFixed(4)} ℏ</span>
              </div>

              {/* Token Balances */}
              {balance.tokens.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Token Balances</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {balance.tokens.map((token, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="font-mono">{token.symbol}</span>
                        <span className="font-mono">
                          {formatBalance(token.balance, token.decimals)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <Separator />

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadBalance}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="flex-1"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Connect Your Wallet</span>
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the Real-Yield Hedera platform.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="wallets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallets">Wallet Apps</TabsTrigger>
            <TabsTrigger value="private-key">Private Key</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallets" className="space-y-3">
            <div className="space-y-2">
              {(['hashpack', 'blade', 'kabila', 'metamask-hedera'] as WalletType[]).map((walletType) => (
                <Button
                  key={walletType}
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => handleConnect(walletType)}
                  disabled={isConnecting || !availableWallets[walletType]}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getWalletIcon(walletType)}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{getWalletName(walletType)}</div>
                      {!availableWallets[walletType] && (
                        <div className="text-xs text-gray-500">Not installed</div>
                      )}
                    </div>
                    {!availableWallets[walletType] && (
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            {isConnecting && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Connecting...</span>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="private-key" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Only use this for testing. Never enter your mainnet private key.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="private-key">Private Key</Label>
              <div className="relative">
                <Input
                  id="private-key"
                  type={showPrivateKey ? 'text' : 'password'}
                  placeholder="Enter your private key..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                >
                  {showPrivateKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={() => handleConnect('private-key', { privateKey })}
              disabled={isConnecting || !privateKey.trim()}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Connect with Private Key
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default WalletConnect