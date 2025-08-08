'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, ExternalLink, ArrowUpRight, ArrowDownLeft, Coins, FileText } from 'lucide-react'

interface Transaction {
  id: string
  type: 'fund' | 'settle' | 'yield' | 'fee'
  amount: number
  currency: 'HBAR' | 'USDC'
  invoice?: string
  timestamp: Date
  status: 'confirmed' | 'pending' | 'failed'
  txHash: string
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'fund',
      amount: 45000,
      currency: 'USDC',
      invoice: 'INV-2024-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      status: 'confirmed',
      txHash: '0.0.123456@1703123456.123456789'
    },
    {
      id: '2',
      type: 'yield',
      amount: 2500,
      currency: 'USDC',
      invoice: 'INV-2023-156',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'confirmed',
      txHash: '0.0.123457@1703120000.123456789'
    },
    {
      id: '3',
      type: 'fee',
      amount: 0.001,
      currency: 'HBAR',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      status: 'confirmed',
      txHash: '0.0.123458@1703100000.123456789'
    },
    {
      id: '4',
      type: 'settle',
      amount: 75000,
      currency: 'USDC',
      invoice: 'INV-2023-145',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      status: 'confirmed',
      txHash: '0.0.123459@1703000000.123456789'
    }
  ])

  // Simulate new transactions
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        const newTx: Transaction = {
          id: Date.now().toString(),
          type: ['fund', 'settle', 'yield', 'fee'][Math.floor(Math.random() * 4)] as any,
          amount: Math.random() * 50000 + 1000,
          currency: Math.random() > 0.1 ? 'USDC' : 'HBAR',
          invoice: `INV-2024-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
          timestamp: new Date(),
          status: 'confirmed',
          txHash: `0.0.${Math.floor(Math.random() * 999999)}@${Date.now()}.123456789`
        }
        
        setTransactions(prev => [newTx, ...prev.slice(0, 9)]) // Keep only 10 most recent
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'fund':
        return <ArrowDownLeft className="w-4 h-4 text-app-blue-500" />
      case 'settle':
      case 'yield':
        return <ArrowUpRight className="w-4 h-4 text-app-green-500" />
      case 'fee':
        return <Coins className="w-4 h-4 text-app-orange-500" />
      default:
        return <Activity className="w-4 h-4 text-app-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'fund':
        return 'text-app-blue-600 dark:text-app-blue-400'
      case 'settle':
      case 'yield':
        return 'text-app-green-600 dark:text-app-green-400'
      case 'fee':
        return 'text-app-orange-600 dark:text-app-orange-400'
      default:
        return 'text-app-gray-600 dark:text-app-gray-400'
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'HBAR') {
      return `${amount.toFixed(6)} ℏ`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
