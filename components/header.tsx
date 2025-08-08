'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Search, Bell, Wallet, Settings, Plus, CheckCircle, Circle, ArrowRight, Copy, ExternalLink } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WalletService, WalletConnection } from '@/lib/wallet-integration'

export function Header({ showNav = true, showCreateInvoice = true }: { showNav?: boolean; showCreateInvoice?: boolean }) {
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const walletService = new WalletService()

  useEffect(() => {
    const checkWalletStatus = async () => {
      const connection = walletService.getConnection();
      setWalletConnection(connection);
    };
    checkWalletStatus();
    
    // Subscribe to wallet events
    const unsubscribe = walletService.subscribe((connection) => {
      setWalletConnection(connection);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    if (!walletConnection?.isConnected) {
      try {
        await walletService.connectWallet('hashpack'); // Default to HashPack
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      try {
        await walletService.disconnectWallet();
      } catch (error) {
        console.error('Failed to disconnect wallet:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  }

  const copyAccountId = () => {
    if (walletConnection?.accountId) {
      navigator.clipboard.writeText(walletConnection.accountId)
      // In a real app, you'd show a toast notification here
    }
  }

  const formatHBAR = (value: number) => {
    return `${value.toFixed(2)} ℏ`
  }

  return (
    <header className="border-b border-app-gray-200 bg-white/80 dark:bg-app-gray-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-app-green-500 to-app-green-700 rounded-lg flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">RealYield</h1>
                <p className="text-sm text-app-gray-600 dark:text-app-gray-400">
                  Hedera-native invoice factoring • Account: <span className="font-mono font-semibold">{!walletConnection?.isConnected ? 'Not Connected' : walletConnection.accountId}</span>
                </p>
              </div>
            </div>
            
            {showNav && (
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/#problem" className="text-app-gray-600 hover:text-app-green-600 transition-colors font-medium dark:text-app-gray-400 dark:hover:text-app-green-400">
                  Problem
                </Link>
                <Link href="/#solution" className="text-app-gray-600 hover:text-app-green-600 transition-colors font-medium dark:text-app-gray-400 dark:hover:text-app-green-400">
                  Solution
                </Link>
                <Link href="/#how-it-works" className="text-app-gray-600 hover:text-app-green-600 transition-colors font-medium dark:text-app-gray-400 dark:hover:text-app-green-400">
                  How it Works
                </Link>
                <Link href="/#technology" className="text-app-gray-600 hover:text-app-green-600 transition-colors font-medium dark:text-app-gray-400 dark:hover:text-app-green-400">
                  Technology
                </Link>
                <Link href="/#cta" className="text-app-gray-600 hover:text-app-green-600 transition-colors font-medium dark:text-app-gray-400 dark:hover:text-app-green-400">
                  Join Us
                </Link>
              </nav>
            )}

            <div className="flex items-center space-x-3">
              <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${walletConnection?.isConnected ? 'bg-app-green-100 text-app-green-700 border border-app-green-200 dark:bg-app-green-900 dark:text-app-green-200' : 'bg-app-red-100 text-app-red-700 border border-app-red-200 dark:bg-app-red-900 dark:text-app-red-200'}`}>
                {walletConnection?.isConnected ? <CheckCircle className="w-3 h-3 mr-1" /> : <Circle className="w-3 h-3 mr-1 fill-app-red-500 text-app-red-500" />}
                {walletConnection?.isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {walletConnection?.isConnected && (
                <Badge variant="outline" className="text-xs font-medium px-2 py-1 rounded-full border-app-blue-200 text-app-blue-600 dark:border-app-blue-700 dark:text-app-blue-400">
                  <Circle className="w-2 h-2 mr-1 fill-app-blue-500 text-app-blue-500" />
                  {walletConnection.walletType}
                </Badge>
              )}
              <span className="text-xs text-app-green-600 flex items-center dark:text-app-green-400">
                <Circle className="w-2 h-2 mr-1 fill-app-green-500 text-app-green-500" />
                Live data connected
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hover:bg-app-gray-100 dark:hover:bg-app-gray-800">
              <Search className="w-5 h-5 text-app-gray-600 dark:text-app-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-app-gray-100 dark:hover:bg-app-gray-800">
              <Bell className="w-5 h-5 text-app-gray-600 dark:text-app-gray-400" />
            </Button>
            
            {/* Wallet Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`relative hover:bg-app-gray-100 dark:hover:bg-app-gray-800 ${walletConnection?.isConnected ? 'text-app-green-600 dark:text-app-green-400' : 'text-app-gray-600 dark:text-app-gray-400'}`}>
                  <Wallet className="w-5 h-5" />
                  {walletConnection?.isConnected && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-app-green-500 ring-2 ring-white dark:ring-app-gray-900" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2 shadow-lg rounded-lg bg-white dark:bg-app-gray-800 border border-app-gray-200 dark:border-app-gray-700">
                <DropdownMenuLabel className="font-semibold text-app-gray-900 dark:text-app-gray-50">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base leading-none">Hedera Wallet</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {walletConnection?.isConnected ? `Connected via ${walletConnection.walletType}` : 'Not connected'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2 bg-app-gray-200 dark:bg-app-gray-700" />
                
                {walletConnection?.isConnected ? (
                  <>
                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-default hover:bg-transparent focus:bg-transparent">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-sm font-medium text-app-gray-700 dark:text-app-gray-300">Account ID</span>
                        <Button variant="ghost" size="sm" onClick={copyAccountId} className="h-6 w-6 p-0 text-app-gray-500 hover:bg-app-gray-100 dark:hover:bg-app-gray-700">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="font-mono text-xs text-app-gray-600 dark:text-app-gray-400 bg-app-gray-50 dark:bg-app-gray-900 p-1 rounded w-full break-all">{walletConnection.accountId}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-default hover:bg-transparent focus:bg-transparent">
                      <span className="text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Balance</span>
                      <span className="text-xl font-bold text-app-green-600 dark:text-app-green-400">{formatHBAR(walletConnection.hbarBalance)}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="my-2 bg-app-gray-200 dark:bg-app-gray-700" />
                    
                    <DropdownMenuItem className="flex items-center text-app-gray-700 hover:bg-app-gray-100 cursor-pointer rounded-md p-2 dark:text-app-gray-300 dark:hover:bg-app-gray-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on HashScan
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleConnectWallet} className="flex items-center text-app-red-600 hover:bg-app-red-50 cursor-pointer rounded-md p-2 dark:text-app-red-400 dark:hover:bg-app-red-900/20">
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <Wallet className="w-10 h-10 text-app-gray-400 dark:text-app-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-app-gray-900 dark:text-app-gray-50 mb-2">Connect Your Wallet</h3>
                    <p className="text-sm text-app-gray-600 dark:text-app-gray-400 mb-4">
                      Connect your Hedera wallet to start trading invoice NFTs
                    </p>
                    <Button onClick={handleConnectWallet} className="w-full bg-app-green-600 hover:bg-app-green-700 text-white py-2 rounded-md shadow-sm" disabled={isConnecting}>
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
                    <p className="text-xs text-app-gray-500 dark:text-app-gray-500 mt-2">
                      Supports HashPack, Blade, Kabila
                    </p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" className="hover:bg-app-gray-100 dark:hover:bg-app-gray-800">
              <Settings className="w-5 h-5 text-app-gray-600 dark:text-app-gray-400" />
            </Button>
            {showCreateInvoice && (
              <Button className="bg-app-green-600 hover:bg-app-green-700 text-white px-4 py-2 rounded-md shadow-sm" disabled={!walletConnection?.isConnected}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            )}
            {!showCreateInvoice && (
              <Button asChild className="bg-app-green-600 hover:bg-app-green-700 text-white px-4 py-2 rounded-md shadow-sm">
                <Link href="/dashboard">Launch App <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
