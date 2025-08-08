'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Building,
  Package,
  MapPin,
  Loader2
} from 'lucide-react'

interface SettleTabProps {
  isWalletConnected: boolean
  walletBalance: number
  stakedBalance: number
  maturedInvoices: any[]
  pendingSettlements: any[]
  settledInvoices: any[]
  onSettleInvoice: (invoiceId: string) => Promise<void>
  onClaimReturns: (invoiceId: string) => Promise<void>
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
  getRiskColor: (risk: number) => string
}

export function SettleTab({
  isWalletConnected,
  walletBalance,
  stakedBalance,
  maturedInvoices = [],
  pendingSettlements = [],
  settledInvoices = [],
  onSettleInvoice,
  onClaimReturns,
  formatCurrency,
  formatHBAR,
  getRiskColor
}: SettleTabProps) {
  const [activeSettleTab, setActiveSettleTab] = useState('matured')
  const [settlingInvoices, setSettlingInvoices] = useState<Set<string>>(new Set())
  const [claimingInvoices, setClaimingInvoices] = useState<Set<string>>(new Set())
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null)

  // Mock data for demonstration
  const mockMaturedInvoices = [
    {
      id: 'INV-001',
      exporter: 'Global Commodities Ltd',
      importer: 'European Trading Co',
      commodity: 'Coffee Beans',
      country: 'Brazil',
      faceValue: 125000,
      buyPrice: 118750,
      maturityDate: '2024-01-15',
      daysOverdue: 5,
      status: 'matured',
      riskLevel: 'low',
      estimatedPd: 2.5,
      projectedReturn: 6250,
      canSettle: true
    },
    {
      id: 'INV-002',
      exporter: 'Asian Exports Inc',
      importer: 'US Import Corp',
      commodity: 'Electronics',
      country: 'Singapore',
      faceValue: 89000,
      buyPrice: 84550,
      maturityDate: '2024-01-10',
      daysOverdue: 10,
      status: 'matured',
      riskLevel: 'medium',
      estimatedPd: 5.0,
      projectedReturn: 4450,
      canSettle: true
    }
  ]

  const mockPendingSettlements = [
    {
      id: 'INV-003',
      exporter: 'African Minerals Co',
      importer: 'Global Steel Ltd',
      commodity: 'Iron Ore',
      country: 'South Africa',
      faceValue: 250000,
      buyPrice: 237500,
      settlementInitiated: '2024-01-20',
      expectedCompletion: '2024-01-25',
      status: 'settling',
      progress: 65,
      projectedReturn: 12500
    }
  ]

  const mockSettledInvoices = [
    {
      id: 'INV-004',
      exporter: 'European Agri Ltd',
      importer: 'Asian Food Corp',
      commodity: 'Wheat',
      country: 'France',
      faceValue: 180000,
      buyPrice: 171000,
      settlementDate: '2024-01-18',
      actualReturn: 9000,
      status: 'settled',
      riskLevel: 'low',
      claimable: true
    }
  ]

  const handleSettleInvoice = async (invoiceId: string) => {
    setSettlingInvoices(prev => new Set(prev).add(invoiceId))
    try {
      await onSettleInvoice(invoiceId)
    } finally {
      setSettlingInvoices(prev => {
        const newSet = new Set(prev)
        newSet.delete(invoiceId)
        return newSet
      })
    }
  }

  const handleClaimReturns = async (invoiceId: string) => {
    setClaimingInvoices(prev => new Set(prev).add(invoiceId))
    try {
      await onClaimReturns(invoiceId)
    } finally {
      setClaimingInvoices(prev => {
        const newSet = new Set(prev)
        newSet.delete(invoiceId)
        return newSet
      })
    }
  }

  const totalClaimableReturns = mockSettledInvoices
    .filter(inv => inv.claimable)
    .reduce((sum, inv) => sum + inv.actualReturn, 0)

  const totalPendingValue = mockPendingSettlements
    .reduce((sum, inv) => sum + inv.projectedReturn, 0)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-app-green-50 to-app-green-100 dark:from-app-green-900/20 dark:to-app-green-800/20 border-app-green-200 dark:border-app-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-app-green-700 dark:text-app-green-300">Matured Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-green-800 dark:text-app-green-200">{mockMaturedInvoices.length}</div>
            <p className="text-xs text-app-green-600 dark:text-app-green-400">Ready for settlement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-app-blue-50 to-app-blue-100 dark:from-app-blue-900/20 dark:to-app-blue-800/20 border-app-blue-200 dark:border-app-blue-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-app-blue-700 dark:text-app-blue-300">Pending Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-blue-800 dark:text-app-blue-200">{mockPendingSettlements.length}</div>
            <p className="text-xs text-app-blue-600 dark:text-app-blue-400">{formatCurrency(totalPendingValue)} expected</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-app-purple-50 to-app-purple-100 dark:from-app-purple-900/20 dark:to-app-purple-800/20 border-app-purple-200 dark:border-app-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-app-purple-700 dark:text-app-purple-300">Claimable Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-purple-800 dark:text-app-purple-200">{formatCurrency(totalClaimableReturns)}</div>
            <p className="text-xs text-app-purple-600 dark:text-app-purple-400">Ready to claim</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-app-orange-50 to-app-orange-100 dark:from-app-orange-900/20 dark:to-app-orange-800/20 border-app-orange-200 dark:border-app-orange-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-app-orange-700 dark:text-app-orange-300">Total Settled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-orange-800 dark:text-app-orange-200">{mockSettledInvoices.length}</div>
            <p className="text-xs text-app-orange-600 dark:text-app-orange-400">Completed settlements</p>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-app-green-600" />
            Settlement Management
          </CardTitle>
          <CardDescription>
            Manage invoice settlements, track progress, and claim returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSettleTab} onValueChange={setActiveSettleTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matured">Matured ({mockMaturedInvoices.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({mockPendingSettlements.length})</TabsTrigger>
              <TabsTrigger value="settled">Settled ({mockSettledInvoices.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="matured" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These invoices have reached maturity and are ready for settlement. Initiate settlement to claim your returns.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {mockMaturedInvoices.map((invoice) => (
                  <Card key={invoice.id} className="border-l-4 border-l-app-orange-500">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{invoice.id}</h3>
                            <Badge variant="outline" className="bg-app-orange-100 text-app-orange-700 border-app-orange-200">
                              {invoice.daysOverdue} days overdue
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-app-gray-500" />
                              <span>{invoice.exporter} → {invoice.importer}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-app-gray-500" />
                              <span>{invoice.commodity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-app-gray-500" />
                              <span>{invoice.country}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-app-gray-500">Face Value</p>
                              <p className="font-semibold">{formatCurrency(invoice.faceValue)}</p>
                            </div>
                            <div>
                              <p className="text-app-gray-500">Buy Price</p>
                              <p className="font-semibold">{formatCurrency(invoice.buyPrice)}</p>
                            </div>
                            <div>
                              <p className="text-app-gray-500">Expected Return</p>
                              <p className="font-semibold text-app-green-600">{formatCurrency(invoice.projectedReturn)}</p>
                            </div>
                            <div>
                              <p className="text-app-gray-500">Risk Level</p>
                              <Badge className={getRiskColor(invoice.estimatedPd)}>
                                {invoice.riskLevel.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-3">
                          <Button 
                            onClick={() => handleSettleInvoice(invoice.id)}
                            disabled={!isWalletConnected || settlingInvoices.has(invoice.id)}
                            className="w-full"
                          >
                            {settlingInvoices.has(invoice.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Settling...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Initiate Settlement
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-app-gray-500 text-center">
                            Matured on {invoice.maturityDate}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  These settlements are currently in progress. Track their status and estimated completion times.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {mockPendingSettlements.map((settlement) => (
                  <Card key={settlement.id} className="border-l-4 border-l-app-blue-500">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{settlement.id}</h3>
                          <Badge className="bg-app-blue-100 text-app-blue-700 border-app-blue-200">
                            In Progress
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-app-gray-500" />
                              <span>{settlement.exporter} → {settlement.importer}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-app-gray-500" />
                              <span>{settlement.commodity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-app-gray-500" />
                              <span>Expected: {settlement.expectedCompletion}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Settlement Progress</span>
                              <span>{settlement.progress}%</span>
                            </div>
                            <Progress value={settlement.progress} className="h-2" />
                            <div className="text-sm text-app-gray-500">
                              Expected return: <span className="font-semibold text-app-green-600">{formatCurrency(settlement.projectedReturn)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settled" className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  These invoices have been successfully settled. Claim your returns when ready.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {mockSettledInvoices.map((invoice) => (
                  <Card key={invoice.id} className="border-l-4 border-l-app-green-500">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{invoice.id}</h3>
                            <Badge className="bg-app-green-100 text-app-green-700 border-app-green-200">
                              Settled
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-app-gray-500" />
                              <span>{invoice.exporter} → {invoice.importer}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-app-gray-500" />
                              <span>{invoice.commodity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-app-gray-500" />
                              <span>Settled: {invoice.settlementDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-app-gray-500">Face Value</p>
                              <p className="font-semibold">{formatCurrency(invoice.faceValue)}</p>
                            </div>
                            <div>
                              <p className="text-app-gray-500">Buy Price</p>
                              <p className="font-semibold">{formatCurrency(invoice.buyPrice)}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-app-gray-500">Actual Return</p>
                              <p className="font-semibold text-app-green-600 text-lg">{formatCurrency(invoice.actualReturn)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-3">
                          {invoice.claimable ? (
                            <Button 
                              onClick={() => handleClaimReturns(invoice.id)}
                              disabled={!isWalletConnected || claimingInvoices.has(invoice.id)}
                              className="w-full bg-app-green-600 hover:bg-app-green-700"
                            >
                              {claimingInvoices.has(invoice.id) ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Claiming...
                                </>
                              ) : (
                                <>
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Claim Returns
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button disabled className="w-full">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Already Claimed
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {!isWalletConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to manage settlements and claim returns.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

<div className="text-center py-6">
  <h2 className="text-3xl font-bold text-app-gray-900 dark:text-app-gray-50 mb-2">Settlement &amp; Claims</h2>
  <p className="text-app-gray-600 dark:text-app-gray-400">Manage matured invoices, initiate settlements, and claim returns</p>
  <p className="text-sm text-app-blue-700 dark:text-app-blue-300 mt-1">Powered by Hedera Consensus Service (HCS) for settlement events and Mirror Node for real-time status updates.</p>
</div>