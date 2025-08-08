'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  PieChart, 
  FileText, 
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle,
  Eye,
  Download
} from 'lucide-react'

interface PortfolioInvoice {
  id: string
  exporter: string
  importer: string
  commodity: string
  country: string
  faceValue: number
  buyPrice: number
  currentValue: number
  projectedReturn: number
  actualReturn?: number
  daysRemaining: number
  totalDays: number
  status: 'active' | 'matured' | 'defaulted' | 'early_settlement'
  purchaseDate: string
  maturityDate: string
  riskLevel: 'low' | 'medium' | 'high'
  estimatedPd: number
  projectedIrr: number
  actualIrr?: number
}

interface PortfolioStats {
  totalInvested: number
  currentValue: number
  totalReturns: number
  unrealizedGains: number
  realizedGains: number
  averageIrr: number
  activeInvestments: number
  maturedInvestments: number
  defaultedInvestments: number
}

interface PortfolioTabProps {
  isWalletConnected: boolean
  walletBalance: number
  stakedBalance: number
  portfolioInvoices: PortfolioInvoice[]
  portfolioStats: PortfolioStats
  handleViewInvoiceDetails: (invoiceId: string) => void
  handleDownloadReport: () => void
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
}

export function PortfolioTab({
  isWalletConnected,
  walletBalance,
  stakedBalance,
  portfolioInvoices,
  portfolioStats,
  handleViewInvoiceDetails,
  handleDownloadReport,
  formatCurrency,
  formatHBAR
}: PortfolioTabProps) {
  const [selectedTab, setSelectedTab] = useState('overview')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-app-blue-100 text-app-blue-800 dark:bg-app-blue-900 dark:text-app-blue-200'
      case 'matured': return 'bg-app-green-100 text-app-green-800 dark:bg-app-green-900 dark:text-app-green-200'
      case 'defaulted': return 'bg-app-red-100 text-app-red-800 dark:bg-app-red-900 dark:text-app-red-200'
      case 'early_settlement': return 'bg-app-yellow-100 text-app-yellow-800 dark:bg-app-yellow-900 dark:text-app-yellow-200'
      default: return 'bg-app-gray-100 text-app-gray-800 dark:bg-app-gray-700 dark:text-app-gray-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-app-green-600 dark:text-app-green-400'
      case 'medium': return 'text-app-yellow-600 dark:text-app-yellow-400'
      case 'high': return 'text-app-red-600 dark:text-app-red-400'
      default: return 'text-app-gray-600 dark:text-app-gray-400'
    }
  }

  const getProgressColor = (daysRemaining: number, totalDays: number) => {
    const progress = ((totalDays - daysRemaining) / totalDays) * 100
    if (progress < 30) return 'bg-app-red-500'
    if (progress < 70) return 'bg-app-yellow-500'
    return 'bg-app-green-500'
  }

  const activeInvoices = portfolioInvoices.filter(inv => inv.status === 'active')
  const completedInvoices = portfolioInvoices.filter(inv => inv.status !== 'active')

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-app-gray-900 dark:text-app-gray-50 mb-2">Portfolio Dashboard</h2>
        <p className="text-app-gray-600 dark:text-app-gray-400">Track your trade finance investments and returns</p>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-app-blue-50 to-app-blue-100 dark:from-app-blue-900 dark:to-app-blue-800 border-app-blue-200 dark:border-app-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-blue-600 dark:text-app-blue-300">Total Invested</p>
                <p className="text-2xl font-bold text-app-blue-700 dark:text-app-blue-200">{formatCurrency(portfolioStats.totalInvested)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-app-blue-600 dark:text-app-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-green-50 to-app-green-100 dark:from-app-green-900 dark:to-app-green-800 border-app-green-200 dark:border-app-green-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-green-600 dark:text-app-green-300">Current Value</p>
                <p className="text-2xl font-bold text-app-green-700 dark:text-app-green-200">{formatCurrency(portfolioStats.currentValue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {portfolioStats.unrealizedGains >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-app-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-app-red-600" />
                  )}
                  <span className={`text-xs ${
                    portfolioStats.unrealizedGains >= 0 ? 'text-app-green-600' : 'text-app-red-600'
                  }`}>
                    {formatCurrency(Math.abs(portfolioStats.unrealizedGains))}
                  </span>
                </div>
              </div>
              <Wallet className="h-8 w-8 text-app-green-600 dark:text-app-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-purple-50 to-app-purple-100 dark:from-app-purple-900 dark:to-app-purple-800 border-app-purple-200 dark:border-app-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-purple-600 dark:text-app-purple-300">Total Returns</p>
                <p className="text-2xl font-bold text-app-purple-700 dark:text-app-purple-200">{formatCurrency(portfolioStats.totalReturns)}</p>
                <p className="text-xs text-app-purple-600 dark:text-app-purple-400 mt-1">
                  Avg IRR: {portfolioStats.averageIrr.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-app-purple-600 dark:text-app-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-orange-50 to-app-orange-100 dark:from-app-orange-900 dark:to-app-orange-800 border-app-orange-200 dark:border-app-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-orange-600 dark:text-app-orange-300">Active Investments</p>
                <p className="text-2xl font-bold text-app-orange-700 dark:text-app-orange-200">{portfolioStats.activeInvestments}</p>
                <p className="text-xs text-app-orange-600 dark:text-app-orange-400 mt-1">
                  {portfolioStats.maturedInvestments} completed
                </p>
              </div>
              <PieChart className="h-8 w-8 text-app-orange-600 dark:text-app-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-app-gray-100/80 dark:bg-app-gray-800/80">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active ({activeInvoices.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedInvoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Portfolio Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
              <CardHeader>
                <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Portfolio Allocation</CardTitle>
                <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                  Distribution by commodity and risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Commodity Distribution */}
                <div className="space-y-4">
                  <h4 className="font-medium text-app-gray-900 dark:text-app-gray-50">By Commodity</h4>
                  {Object.entries(
                    portfolioInvoices.reduce((acc, inv) => {
                      acc[inv.commodity] = (acc[inv.commodity] || 0) + inv.buyPrice
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([commodity, value]) => {
                    const percentage = (value / portfolioStats.totalInvested) * 100
                    return (
                      <div key={commodity} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-app-gray-700 dark:text-app-gray-300">{commodity}</span>
                          <span className="text-app-gray-600 dark:text-app-gray-400">{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
              <CardHeader>
                <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Performance Metrics</CardTitle>
                <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-app-gray-50 dark:bg-app-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Success Rate</p>
                    <p className="text-lg font-semibold text-app-gray-900 dark:text-app-gray-100">
                      {portfolioStats.maturedInvestments > 0 
                        ? ((portfolioStats.maturedInvestments / (portfolioStats.maturedInvestments + portfolioStats.defaultedInvestments)) * 100).toFixed(1)
                        : '0'
                      }%
                    </p>
                  </div>
                  <div className="bg-app-gray-50 dark:bg-app-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Default Rate</p>
                    <p className="text-lg font-semibold text-app-gray-900 dark:text-app-gray-100">
                      {portfolioStats.defaultedInvestments > 0 
                        ? ((portfolioStats.defaultedInvestments / portfolioInvoices.length) * 100).toFixed(1)
                        : '0'
                      }%
                    </p>
                  </div>
                  <div className="bg-app-green-50 dark:bg-app-green-900 p-3 rounded-lg">
                    <p className="text-xs text-app-green-600 dark:text-app-green-400">Realized Gains</p>
                    <p className="text-lg font-semibold text-app-green-700 dark:text-app-green-300">
                      {formatCurrency(portfolioStats.realizedGains)}
                    </p>
                  </div>
                  <div className="bg-app-blue-50 dark:bg-app-blue-900 p-3 rounded-lg">
                    <p className="text-xs text-app-blue-600 dark:text-app-blue-400">Unrealized Gains</p>
                    <p className="text-lg font-semibold text-app-blue-700 dark:text-app-blue-300">
                      {formatCurrency(portfolioStats.unrealizedGains)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Recent Activity</CardTitle>
                  <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                    Latest portfolio updates and transactions
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReport}
                  className="border-app-gray-300 dark:border-app-gray-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolioInvoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-app-gray-50 dark:bg-app-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        invoice.status === 'active' ? 'bg-app-blue-500' :
                        invoice.status === 'matured' ? 'bg-app-green-500' :
                        invoice.status === 'defaulted' ? 'bg-app-red-500' :
                        'bg-app-yellow-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-app-gray-900 dark:text-app-gray-100">{invoice.id}</p>
                        <p className="text-xs text-app-gray-600 dark:text-app-gray-400">{invoice.commodity} • {invoice.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-app-gray-900 dark:text-app-gray-100">{formatCurrency(invoice.buyPrice)}</p>
                      <p className="text-xs text-app-gray-600 dark:text-app-gray-400">
                        {new Date(invoice.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeInvoices.map((invoice) => {
              const progress = ((invoice.totalDays - invoice.daysRemaining) / invoice.totalDays) * 100
              return (
                <Card key={invoice.id} className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-app-gray-900 dark:text-app-gray-50">{invoice.id}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-app-gray-600 dark:text-app-gray-400">
                          <MapPin className="h-3 w-3" />
                          {invoice.country}
                        </div>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-app-gray-600 dark:text-app-gray-400">Progress</span>
                        <span className="text-app-gray-900 dark:text-app-gray-100">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center gap-1 text-xs text-app-gray-600 dark:text-app-gray-400">
                        <Clock className="h-3 w-3" />
                        {invoice.daysRemaining} days remaining
                      </div>
                    </div>

                    {/* Investment Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-app-gray-50 dark:bg-app-gray-700 p-2 rounded">
                        <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Invested</p>
                        <p className="text-sm font-semibold text-app-gray-900 dark:text-app-gray-100">{formatCurrency(invoice.buyPrice)}</p>
                      </div>
                      <div className="bg-app-green-50 dark:bg-app-green-900 p-2 rounded">
                        <p className="text-xs text-app-green-600 dark:text-app-green-400">Expected Return</p>
                        <p className="text-sm font-semibold text-app-green-700 dark:text-app-green-300">{formatCurrency(invoice.projectedReturn)}</p>
                      </div>
                    </div>

                    {/* Risk and IRR */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Risk Level</p>
                        <p className={`text-sm font-medium ${getRiskColor(invoice.riskLevel)}`}>
                          {invoice.riskLevel.toUpperCase()} ({invoice.estimatedPd.toFixed(1)}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Projected IRR</p>
                        <p className="text-sm font-semibold text-app-blue-600 dark:text-app-blue-400">{invoice.projectedIrr.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoiceDetails(invoice.id)}
                      className="w-full border-app-gray-300 dark:border-app-gray-600"
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedInvoices.map((invoice) => (
              <Card key={invoice.id} className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-app-gray-900 dark:text-app-gray-50">{invoice.id}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-app-gray-600 dark:text-app-gray-400">
                        <Package className="h-3 w-3" />
                        {invoice.commodity}
                      </div>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status === 'matured' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Matured</>
                      ) : invoice.status === 'defaulted' ? (
                        <><AlertCircle className="h-3 w-3 mr-1" /> Defaulted</>
                      ) : (
                        <><Calendar className="h-3 w-3 mr-1" /> Early Settlement</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Investment Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-app-gray-50 dark:bg-app-gray-700 p-2 rounded">
                      <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Invested</p>
                      <p className="text-sm font-semibold text-app-gray-900 dark:text-app-gray-100">{formatCurrency(invoice.buyPrice)}</p>
                    </div>
                    <div className={`p-2 rounded ${
                      invoice.status === 'matured' ? 'bg-app-green-50 dark:bg-app-green-900' :
                      invoice.status === 'defaulted' ? 'bg-app-red-50 dark:bg-app-red-900' :
                      'bg-app-yellow-50 dark:bg-app-yellow-900'
                    }`}>
                      <p className={`text-xs ${
                        invoice.status === 'matured' ? 'text-app-green-600 dark:text-app-green-400' :
                        invoice.status === 'defaulted' ? 'text-app-red-600 dark:text-app-red-400' :
                        'text-app-yellow-600 dark:text-app-yellow-400'
                      }`}>
                        {invoice.status === 'matured' ? 'Received' :
                         invoice.status === 'defaulted' ? 'Loss' : 'Received'}
                      </p>
                      <p className={`text-sm font-semibold ${
                        invoice.status === 'matured' ? 'text-app-green-700 dark:text-app-green-300' :
                        invoice.status === 'defaulted' ? 'text-app-red-700 dark:text-app-red-300' :
                        'text-app-yellow-700 dark:text-app-yellow-300'
                      }`}>
                        {formatCurrency(invoice.actualReturn || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Actual IRR</p>
                      <p className={`text-sm font-semibold ${
                        (invoice.actualIrr || 0) >= invoice.projectedIrr ? 'text-app-green-600 dark:text-app-green-400' : 'text-app-red-600 dark:text-app-red-400'
                      }`}>
                        {invoice.actualIrr?.toFixed(1) || '0.0'}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Completion Date</p>
                      <p className="text-sm text-app-gray-900 dark:text-app-gray-100">
                        {new Date(invoice.maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInvoiceDetails(invoice.id)}
                    className="w-full border-app-gray-300 dark:border-app-gray-600"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty States */}
      {portfolioInvoices.length === 0 && (
        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
          <CardContent className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-app-gray-400" />
            <h3 className="text-lg font-semibold text-app-gray-900 dark:text-app-gray-50 mb-2">No investments yet</h3>
            <p className="text-app-gray-600 dark:text-app-gray-400 mb-4">
              Start investing in trade finance invoices to build your portfolio
            </p>
            <Button className="bg-app-blue-600 hover:bg-app-blue-700 text-white">
              Explore Marketplace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}