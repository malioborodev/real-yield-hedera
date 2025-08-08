'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, BarChart3, Shield, Clock, MapPin, ExternalLink, Download } from 'lucide-react'
import { formatCurrency, formatHBAR, getRiskColor } from '../shared/data'

interface OverviewTabProps {
  kpiData: any[]
  riskDistribution: any[]
  topInvoices: any[]
  liveTrades: any[]
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
  getRiskColor: (risk: string) => string
  onDownloadReport?: () => void
}

export default function OverviewTab({
  kpiData,
  riskDistribution,
  topInvoices,
  liveTrades,
  formatCurrency,
  formatHBAR,
  getRiskColor,
  onDownloadReport
}: OverviewTabProps) {
  const latestData = kpiData[kpiData.length - 1]
  const previousData = kpiData[kpiData.length - 2]
  
  const tvlChange = ((latestData.tvl - previousData.tvl) / previousData.tvl) * 100
  const yieldChange = latestData.yield - previousData.yield
  const volumeChange = ((latestData.volume - previousData.volume) / previousData.volume) * 100
  const contractsChange = latestData.contracts - previousData.contracts

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-app-blue-50 to-app-blue-100 dark:from-app-blue-900 dark:to-app-blue-800 border-app-blue-200 dark:border-app-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-blue-700 dark:text-app-blue-200">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-app-blue-600 dark:text-app-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-blue-900 dark:text-app-blue-100">{formatCurrency(latestData.tvl)}</div>
            <p className="text-xs text-app-blue-600 dark:text-app-blue-300">
              <span className={`inline-flex items-center ${tvlChange >= 0 ? 'text-app-green-600' : 'text-app-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {tvlChange >= 0 ? '+' : ''}{tvlChange.toFixed(1)}%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-green-50 to-app-green-100 dark:from-app-green-900 dark:to-app-green-800 border-app-green-200 dark:border-app-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-green-700 dark:text-app-green-200">Average Real Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-app-green-600 dark:text-app-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-green-900 dark:text-app-green-100">{latestData.yield.toFixed(1)}%</div>
            <p className="text-xs text-app-green-600 dark:text-app-green-300">
              <span className={`inline-flex items-center ${yieldChange >= 0 ? 'text-app-green-600' : 'text-app-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {yieldChange >= 0 ? '+' : ''}{yieldChange.toFixed(1)}%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-purple-50 to-app-purple-100 dark:from-app-purple-900 dark:to-app-purple-800 border-app-purple-200 dark:border-app-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-purple-700 dark:text-app-purple-200">Monthly Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-app-purple-600 dark:text-app-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-purple-900 dark:text-app-purple-100">{formatCurrency(latestData.volume)}</div>
            <p className="text-xs text-app-purple-600 dark:text-app-purple-300">
              <span className={`inline-flex items-center ${volumeChange >= 0 ? 'text-app-green-600' : 'text-app-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {volumeChange >= 0 ? '+' : ''}{volumeChange.toFixed(1)}%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-orange-50 to-app-orange-100 dark:from-app-orange-900 dark:to-app-orange-800 border-app-orange-200 dark:border-app-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-orange-700 dark:text-app-orange-200">Active Contracts</CardTitle>
            <Shield className="h-4 w-4 text-app-orange-600 dark:text-app-orange-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-orange-900 dark:text-app-orange-100">{latestData.contracts}</div>
            <p className="text-xs text-app-orange-600 dark:text-app-orange-300">
              <span className={`inline-flex items-center ${contractsChange >= 0 ? 'text-app-green-600' : 'text-app-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {contractsChange >= 0 ? '+' : ''}{contractsChange}
              </span>
              {' '}new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TVL & Yield Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              TVL & Real Yield Trends
            </CardTitle>
            <CardDescription>Monthly performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'tvl' ? formatCurrency(value as number) : `${value}%`,
                    name === 'tvl' ? 'TVL' : 'Real Yield'
                  ]}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="tvl" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
            <CardDescription>Portfolio risk breakdown by credit rating</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {riskDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name.split(' ')[0]}</span>
                  </div>
                  <span className="text-muted-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Invoices & Live Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Performing Invoices
            </CardTitle>
            <CardDescription>Highest yield opportunities available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInvoices.slice(0, 5).map((invoice) => {
                const yieldCalc = formatCurrency(invoice.faceValue * (invoice.pd * 0.5))
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{invoice.commodity}</span>
                        <Badge className={getRiskColor(invoice.risk)}>
                          {invoice.risk}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {invoice.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {invoice.tenor}d
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{formatCurrency(invoice.faceValue)}</div>
                      <div className="text-xs text-app-green-600 font-medium">
                        ~{((invoice.faceValue * invoice.pd * 365) / (invoice.tenor * invoice.faceValue * 0.9) * 100).toFixed(1)}% IRR
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Trades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Live Trade Activity
            </CardTitle>
            <CardDescription>Real-time platform transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveTrades.map((trade, index) => {
                const getTradeIcon = (type: string) => {
                  switch (type) {
                    case 'funded': return '💰'
                    case 'settled': return '✅'
                    case 'yield_paid': return '📈'
                    default: return '🔄'
                  }
                }
                
                const getTradeColor = (type: string) => {
                  switch (type) {
                    case 'funded': return 'text-app-blue-600'
                    case 'settled': return 'text-app-green-600'
                    case 'yield_paid': return 'text-app-purple-600'
                    default: return 'text-muted-foreground'
                  }
                }

                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/30">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getTradeIcon(trade.type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm capitalize ${getTradeColor(trade.type)}`}>
                            {trade.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {trade.user.slice(0, 6)}...{trade.user.slice(-4)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trade.invoice} • {trade.destination} • {trade.time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{formatCurrency(trade.amount)}</div>
                      <div className="text-xs text-app-green-600">
                        {trade.irr.toFixed(1)}% IRR • {formatHBAR(trade.hbarFee)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Report Button */}
      <div className="flex justify-center">
        <Button 
          onClick={onDownloadReport}
          className="bg-app-blue-600 hover:bg-app-blue-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Portfolio Report
        </Button>
      </div>
    </div>
  )
}