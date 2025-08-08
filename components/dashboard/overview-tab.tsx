'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, DollarSign, Package, Users, Activity, ArrowUpRight, ArrowDownRight, Globe, Truck, Ship, CheckCircle } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import Image from 'next/image'

interface OverviewTabProps {
  currentTVL: number
  currentYield: number
  insurancePool: number
  kpiData: any[]
  riskDistribution: any[]
  topInvoices: any[]
  liveTrades: any[]
  categoryData: any[]
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
  getRiskColor: (risk: string) => string
}

export function OverviewTab({
  currentTVL,
  currentYield,
  insurancePool,
  kpiData,
  riskDistribution,
  topInvoices,
  liveTrades,
  categoryData,
  formatCurrency,
  formatHBAR,
  getRiskColor
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8 bg-gradient-to-br from-app-green-50 to-app-blue-50 dark:from-app-gray-800 dark:to-app-gray-900 rounded-xl shadow-md">
        <h2 className="text-4xl font-bold text-app-gray-900 dark:text-app-gray-50 mb-4">Welcome to Real-Yield</h2>
        <p className="text-lg text-app-gray-600 dark:text-app-gray-300 max-w-3xl mx-auto">
          A decentralized invoice factoring platform powered by Hedera Hashgraph. 
          Fixed-price sales, transparent fees, and real yield from actual settlements.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg card-hover-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-app-green-600 dark:text-app-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">{formatCurrency(currentTVL)}</div>
            <p className="text-xs text-app-green-600 dark:text-app-green-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg card-hover-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Average Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-app-blue-600 dark:text-app-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">{currentYield.toFixed(1)}%</div>
            <p className="text-xs text-app-green-600 dark:text-app-green-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg card-hover-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Active Invoices</CardTitle>
            <Package className="h-4 w-4 text-app-orange-600 dark:text-app-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">312</div>
            <p className="text-xs text-app-green-600 dark:text-app-green-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +23 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg card-hover-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Insurance Pool</CardTitle>
            <Users className="h-4 w-4 text-app-purple-600 dark:text-app-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">{formatHBAR(insurancePool)}</div>
            <p className="text-xs text-app-green-600 dark:text-app-green-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.3% coverage ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TVL and Yield Chart */}
        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-app-gray-900 dark:text-app-gray-50">TVL & Yield Performance</CardTitle>
            <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Monthly growth in total value locked and average yield</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-app-gray-200 dark:stroke-app-gray-700" />
                <XAxis dataKey="name" className="text-app-gray-600 dark:text-app-gray-400" />
                <YAxis yAxisId="left" className="text-app-gray-600 dark:text-app-gray-400" />
                <YAxis yAxisId="right" orientation="right" className="text-app-gray-600 dark:text-app-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--app-gray-800)', 
                    border: '1px solid var(--app-gray-700)',
                    borderRadius: '8px'
                  }} 
                />
                <Line yAxisId="left" type="monotone" dataKey="tvl" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="yield" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Risk Distribution</CardTitle>
            <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Portfolio allocation by risk grade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name.split(' ')[0]}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--app-gray-800)', 
                    border: '1px solid var(--app-gray-700)',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Invoices and Live Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Invoices */}
        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Top Performing Invoices</CardTitle>
            <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Highest yield opportunities available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInvoices.slice(0, 4).map((invoice) => {
                const calc = {
                  discountRate: 0.006 + (0.08 - 0.006) * invoice.pd,
                  irr: ((invoice.faceValue - (invoice.faceValue * (1 - (0.006 + (0.08 - 0.006) * invoice.pd) - 0.002 - 0.002))) / (invoice.faceValue * (1 - (0.006 + (0.08 - 0.006) * invoice.pd) - 0.002 - 0.002))) * (365 / invoice.tenor) * 100
                }
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-app-gray-50 dark:bg-app-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-app-green-100 dark:bg-app-green-900 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-app-green-600 dark:text-app-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-app-gray-900 dark:text-app-gray-50">{invoice.commodity}</p>
                        <p className="text-sm text-app-gray-600 dark:text-app-gray-400">{invoice.exporter}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-app-gray-900 dark:text-app-gray-50">{calc.irr.toFixed(1)}% IRR</p>
                      <Badge className={getRiskColor(invoice.risk)}>{invoice.risk}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Trading Activity */}
        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Live Trading Activity</CardTitle>
            <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Real-time transactions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {liveTrades.map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-app-gray-50 dark:bg-app-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      trade.type === 'funded' ? 'bg-app-green-100 dark:bg-app-green-900' :
                      trade.type === 'settled' ? 'bg-app-blue-100 dark:bg-app-blue-900' :
                      'bg-app-orange-100 dark:bg-app-orange-900'
                    }`}>
                      {trade.type === 'funded' ? <ArrowUpRight className="h-4 w-4 text-app-green-600 dark:text-app-green-400" /> :
                       trade.type === 'settled' ? <CheckCircle className="h-4 w-4 text-app-blue-600 dark:text-app-blue-400" /> :
                       <DollarSign className="h-4 w-4 text-app-orange-600 dark:text-app-orange-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-app-gray-900 dark:text-app-gray-50">
                        {trade.type === 'funded' ? 'Funded' : trade.type === 'settled' ? 'Settled' : 'Yield Paid'}
                      </p>
                      <p className="text-xs text-app-gray-600 dark:text-app-gray-400">{trade.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-app-gray-900 dark:text-app-gray-50">{formatCurrency(trade.amount)}</p>
                    <p className="text-xs text-app-gray-600 dark:text-app-gray-400">{trade.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Commodity Categories</CardTitle>
          <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Distribution of invoices by commodity type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-app-gray-200 dark:stroke-app-gray-700" />
              <XAxis dataKey="name" className="text-app-gray-600 dark:text-app-gray-400" />
              <YAxis className="text-app-gray-600 dark:text-app-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--app-gray-800)', 
                  border: '1px solid var(--app-gray-700)',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}