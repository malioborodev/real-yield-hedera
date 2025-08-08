'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wallet, CheckCircle, AlertCircle, ExternalLink, Copy, RefreshCw, Loader2 } from 'lucide-react'
import { hederaWallet } from '@/lib/hedera-wallet-mock' // Import the mock wallet service

export function WalletStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [accountId, setAccountId] = useState('0.0.000000')
  const [balance, setBalance] = useState(0)
  const [walletType, setWalletType] = useState('N/A')
  const [networkStatus, setNetworkStatus] = useState('mainnet') // This can remain static for mock
  const [lastTransaction, setLastTransaction] = useState('N/A') // Update this if you want to mock transactions
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const updateWalletStatus = async () => {
      const connected = hederaWallet.isConnected();
      setIsConnected(connected);
      if (connected) {
        const info = hederaWallet.getAccountInfo();
        if (info) {
          setAccountId(info.accountId);
          setBalance(info.balance);
          setWalletType(info.walletType);
        }
      } else {
        setAccountId('0.0.000000');
        setBalance(0);
        setWalletType('N/A');
      }
    };
    updateWalletStatus();
    const interval = setInterval(updateWalletStatus, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const info = await hederaWallet.connect();
      setIsConnected(true);
      setAccountId(info.accountId);
      setBalance(info.balance);
      setWalletType(info.walletType);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await hederaWallet.disconnect();
      setIsConnected(false);
      setAccountId('0.0.000000');
      setBalance(0);
      setWalletType('N/A');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  const copyAccountId = () => {
    navigator.clipboard.writeText(accountId)
  }

  const formatHBAR = (value: number) => {
    return `${value.toFixed(2)} ℏ`
  }

  return (
    <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-app-gray-900 dark:text-app-gray-50">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-app-green-600" />
            <span>Wallet Status</span>
          </div>
          <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${isConnected ? 'bg-app-green-100 text-app-green-700 border border-app-green-200 dark:bg-app-green-900 dark:text-app-green-200' : 'bg-app-red-100 text-app-red-700 border border-app-red-200 dark:bg-app-red-900 dark:text-app-red-200'}`}>
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
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
        {isConnected ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Wallet Type</label>
                <p className="text-base font-mono text-app-gray-900 dark:text-app-gray-50">{walletType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Network</label>
                <p className="text-base font-mono text-app-gray-900 dark:text-app-gray-50 capitalize">{networkStatus}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Account ID</label>
                <Button variant="ghost" size="sm" onClick={copyAccountId} className="h-6 w-6 p-0 text-app-gray-500 hover:bg-app-gray-100 dark:hover:bg-app-gray-700">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm font-mono text-app-gray-900 dark:text-app-gray-50 bg-app-gray-50 dark:bg-app-gray-900 p-2 rounded-md break-all">{accountId}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Balance</label>
              <p className="text-3xl font-bold text-app-green-600 dark:text-app-green-400">{formatHBAR(balance)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Last Transaction</label>
              <p className="text-xs font-mono text-app-gray-500 dark:text-app-gray-400">{lastTransaction}</p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-3 border-t border-app-gray-200 dark:border-app-gray-700">
              <Button variant="outline" size="sm" className="flex-1 border-app-gray-300 dark:border-app-gray-700 text-app-gray-800 dark:text-app-gray-200 hover:bg-app-gray-100 dark:hover:bg-app-gray-700">
                <ExternalLink className="w-3 h-3 mr-1" />
                HashScan
              </Button>
              <Button variant="outline" size="sm" className="flex-1 border-app-300 dark:border-app-gray-700 text-app-gray-800 dark:text-app-gray-200 hover:bg-app-gray-100 dark:hover:bg-app-gray-700">
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect} className="flex-1 text-app-red-600 border-app-red-300 hover:bg-app-red-50 dark:border-app-red-700 dark:hover:bg-app-red-900/20" disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : 'Disconnect'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Wallet className="w-12 h-12 text-app-gray-400 dark:text-app-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-app-gray-900 dark:text-app-50 mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-app-gray-600 dark:text-app-gray-400 mb-4">
              Connect your Hedera wallet to start trading invoice NFTs and earning real yield.
            </p>
            <Button onClick={handleConnect} className="bg-app-green-600 hover:bg-app-green-700 text-white py-2 rounded-md shadow-sm" disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
            <p className="text-xs text-app-gray-500 dark:text-app-gray-400 mt-2">
              Supports HashPack, Blade, Kabila, and other Hedera wallets
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
