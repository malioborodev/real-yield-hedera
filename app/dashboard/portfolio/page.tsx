'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  MapPin, 
  Eye, 
  Download,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Wallet,
  Target,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { formatCurrency, formatHBAR, getRiskColor } from '../shared/data'

interface PortfolioTabProps {
  portfolioData: any[]
  categoryData: any[]
  onStakeHBAR: () => void
  onDownloadReport: () => void
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
  getRiskColor: (risk: string) => string
}

export default function PortfolioTab({
  portfolioData,
  categoryData,
  onStakeHBAR,
  onDownloadReport,
  formatCurrency,
  formatHBAR,
  getRiskColor
}: PortfolioTabProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  
  // Calculate portfolio metrics
  const totalInvested = portfolioData.reduce((sum, item) => sum + item.invested, 0)
  const totalCurrentValue = portfolioData.reduce((sum, item) => sum + item.currentValue, 0)
  const totalProfitEarned = portfolioData.reduce((sum, item) => sum + item.profitEarned, 0)
  const totalUnrealizedGains = totalCurrentValue - totalInvested
  const totalReturn = totalProfitEarned + totalUnrealizedGains
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0
  
  const activeInvestments = portfolioData.filter(item => item.status === 'Active')
  const settledInvestments = portfolioData.filter(item => item.status === 'Settled')
  
  // Performance data for charts
  const performanceData = [
    { name: 'Jan', value: totalInvested * 0.7, profit: totalProfitEarned * 0.3 },
    { name: 'Feb', value: totalInvested * 0.8, profit: totalProfitEarned * 0.5 },
    { name: 'Mar', value: totalInvested * 0.9, profit: totalProfitEarned * 0.7 },
    { name: 'Apr', value: totalInvested * 0.95, profit: totalProfitEarned * 0.85 },
    { name: 'May', value: totalInvested, profit: totalProfitEarned },
  ]
  
  const riskDistribution = [
    { name: 'Low Risk', value: 45, color: '#10B981' },
    { name: 'Medium Risk', value: 35, color: '#F59E0B' },
    { name: 'High Risk', value: 20, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Portfolio Dashboard</h2>
        <p className="text-muted-foreground">
          Track your investments and monitor real yield performance
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-app-blue-50 to-app-blue-100 dark:from-app-blue-900 dark:to-app-blue-800 border-app-blue-200 dark:border-app-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-blue-700 dark:text-app-blue-200">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-app-blue-600 dark:text-app-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-blue-900 dark:text-app-blue-100">{formatCurrency(totalInvested)}</div>
            <p className="text-xs text-app-blue-600 dark:text-app-blue-300">
              Across {portfolioData.length} investments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-green-50 to-app-green-100 dark:from-app-green-900 dark:to-app-green-800 border-app-green-200 dark:border-app-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-green-700 dark:text-app-green-200">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-app-green-600 dark:text-app-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-green-900 dark:text-app-green-100">{formatCurrency(totalCurrentValue)}</div>
            <p className="text-xs text-app-green-600 dark:text-app-green-300">
              <span className={`inline-flex items-center ${totalUnrealizedGains >= 0 ? 'text-app-green-600' : 'text-app-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {totalUnrealizedGains >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedGains)}
              </span>
              {' '}unrealized
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-purple-50 to-app-purple-100 dark:from-app-purple-900 dark:to-app-purple-800 border-app-purple-200 dark:border-app-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-purple-700 dark:text-app-purple-200">Profit Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-app-purple-600 dark:text-app-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-purple-900 dark:text-app-purple-100">{formatCurrency(totalProfitEarned)}</div>
            <p className="text-xs text-app-purple-600 dark:text-app-purple-300">
              From {settledInvestments.length} settled positions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-orange-50 to-app-orange-100 dark:from-app-orange-900 dark:to-app-orange-800 border-app-orange-200 dark:border-app-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-orange-700 dark:text-app-orange-200">Total Return</CardTitle>
            <Target className="h-4 w-4 text-app-orange-600 dark:text-app-orange-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-orange-900 dark:text-app-orange-100">
              {totalReturnPercentage >= 0 ? '+' : ''}{totalReturnPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-app-orange-600 dark:text-app-orange-300">
              {formatCurrency(totalReturn)} total return
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Performance
                </CardTitle>
                <CardDescription>Investment value and profit over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [formatCurrency(value as number), 'Value']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Category Allocation
                </CardTitle>
                <CardDescription>Investment distribution by commodity category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.value}%</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(item.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Portfolio risk breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {riskDistribution.map((risk, index) => (
                  <div key={index} className="text-center p-4 rounded-lg border">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: risk.color }}
                    >
                      {risk.value}%
                    </div>
                    <div className="font-medium">{risk.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(totalInvested * (risk.value / 100))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {portfolioData.map((position) => {
              const profitLoss = position.currentValue - position.invested
              const profitLossPercentage = (profitLoss / position.invested) * 100
              
              return (
                <Card key={position.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{position.commodity}</h3>
                          <Badge 
                            className={position.status === 'Active' ? 
                              'bg-app-green-200 text-app-green-700 border-app-green-300' : 
                              'bg-app-gray-200 text-app-gray-700 border-app-gray-300'
                            }
                          >
                            {position.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {position.destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {position.daysLeft > 0 ? `${position.daysLeft} days left` : 'Settled'}
                          </span>
                          <span className="font-mono text-xs">{position.htsTokenId}</span>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-sm text-muted-foreground">Current Value</div>
                        <div className="text-xl font-bold">{formatCurrency(position.currentValue)}</div>
                        <div className={`text-sm font-medium ${
                          profitLoss >= 0 ? 'text-app-green-600' : 'text-app-red-600'
                        }`}>
                          {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)} 
                          ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Invested</div>
                        <div className="font-semibold">{formatCurrency(position.invested)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Face Value</div>
                        <div className="font-semibold">{formatCurrency(position.faceValue)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Profit Earned</div>
                        <div className="font-semibold text-app-green-600">{formatCurrency(position.profitEarned)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Tenor</div>
                        <div className="font-semibold">{position.tenor} days</div>
                      </div>
                    </div>
                    
                    {position.status === 'Active' && position.daysLeft > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Time to Settlement</span>
                          <span>{position.daysLeft} days remaining</span>
                        </div>
                        <Progress 
                          value={((position.tenor - position.daysLeft) / position.tenor) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on Hedera
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Returns */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Returns</CardTitle>
                <CardDescription>Profit distribution by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [formatCurrency(value as number), 'Profit']}
                    />
                    <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Portfolio performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-app-green-600">
                      {totalReturnPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Total Return</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-app-blue-600">
                      {activeInvestments.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Positions</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-app-purple-600">
                      {(totalProfitEarned / totalInvested * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Realized Yield</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-app-orange-600">
                      {portfolioData.length > 0 ? (portfolioData.reduce((sum, p) => sum + p.tenor, 0) / portfolioData.length).toFixed(0) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Tenor (days)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All your portfolio transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioData.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        position.status === 'Active' ? 'bg-app-blue-100 text-app-blue-600' : 'bg-app-green-100 text-app-green-600'
                      }`}>
                        {position.status === 'Active' ? '🔄' : '✅'}
                      </div>
                      <div>
                        <div className="font-medium">{position.commodity}</div>
                        <div className="text-sm text-muted-foreground">
                          {position.status === 'Active' ? 'Investment' : 'Settlement'} • {position.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(position.invested)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onStakeHBAR} className="bg-app-purple-600 hover:bg-app-purple-700">
          <DollarSign className="h-4 w-4 mr-2" />
          Stake HBAR
        </Button>
        <Button onClick={onDownloadReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>
    </div>
  )
}