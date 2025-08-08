'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Globe
} from 'lucide-react'
import { formatCurrency, formatHBAR, getRiskColor, calculateRealYield } from '../shared/data'

interface MarketplaceTabProps {
  topInvoices: any[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedRisk: string
  setSelectedRisk: (risk: string) => void
  purchaseAmount: number
  setPurchaseAmount: (amount: number) => void
  isPurchasing: boolean
  purchaseStatus: string
  onPurchaseInvoice: (invoiceId: string) => void
  onViewDetails: (invoiceId: string) => void
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
  getRiskColor: (risk: string) => string
}

export default function MarketplaceTab({
  topInvoices,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedRisk,
  setSelectedRisk,
  purchaseAmount,
  setPurchaseAmount,
  isPurchasing,
  purchaseStatus,
  onPurchaseInvoice,
  onViewDetails,
  formatCurrency,
  formatHBAR,
  getRiskColor
}: MarketplaceTabProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('yield')
  
  // Filter invoices based on search and filters
  const filteredInvoices = topInvoices.filter(invoice => {
    const matchesSearch = invoice.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.exporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || invoice.category === selectedCategory
    const matchesRisk = !selectedRisk || invoice.risk === selectedRisk
    
    return matchesSearch && matchesCategory && matchesRisk
  })
  
  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'yield':
        const yieldA = calculateRealYield(a.faceValue, a.pd, a.tenor).irr
        const yieldB = calculateRealYield(b.faceValue, b.pd, b.tenor).irr
        return yieldB - yieldA
      case 'value':
        return b.faceValue - a.faceValue
      case 'tenor':
        return a.tenor - b.tenor
      case 'funded':
        return b.funded - a.funded
      default:
        return 0
    }
  })
  
  const categories = ['Oils & Fats', 'Beverages', 'Industrial', 'Food', 'Grains', 'Spices']
  const riskGrades = ['AAA', 'AA', 'A', 'BBB', 'BB']
  
  const getYieldCalculation = (invoice: any) => {
    return calculateRealYield(invoice.faceValue, invoice.pd, invoice.tenor)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Invoice Marketplace</h2>
        <p className="text-muted-foreground">
          Discover and invest in tokenized trade invoices with real yield opportunities
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search commodities, exporters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Risk Filter */}
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger>
                <SelectValue placeholder="All Risk Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Risk Grades</SelectItem>
                {riskGrades.map(risk => (
                  <SelectItem key={risk} value={risk}>{risk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yield">Highest Yield</SelectItem>
                <SelectItem value="value">Highest Value</SelectItem>
                <SelectItem value="tenor">Shortest Tenor</SelectItem>
                <SelectItem value="funded">Most Funded</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Purchase Amount */}
            <div className="space-y-1">
              <Input
                type="number"
                placeholder="Investment amount"
                value={purchaseAmount || ''}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-app-blue-600" />
              <span className="text-sm font-medium">Total Invoices</span>
            </div>
            <div className="text-2xl font-bold mt-1">{topInvoices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-app-green-600" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(topInvoices.reduce((sum, inv) => sum + inv.faceValue, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-app-purple-600" />
              <span className="text-sm font-medium">Avg. Yield</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {(topInvoices.reduce((sum, inv) => {
                const calc = getYieldCalculation(inv)
                return sum + calc.irr
              }, 0) / topInvoices.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-app-orange-600" />
              <span className="text-sm font-medium">Countries</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {new Set(topInvoices.map(inv => inv.destination.split(',').pop()?.trim())).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedInvoices.map((invoice) => {
          const yieldCalc = getYieldCalculation(invoice)
          const isSelected = selectedInvoice === invoice.id
          
          return (
            <Card 
              key={invoice.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-app-blue-500 shadow-lg' : ''
              }`}
              onClick={() => setSelectedInvoice(isSelected ? null : invoice.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{invoice.commodity}</CardTitle>
                    <CardDescription className="text-sm">
                      {invoice.exporter}
                    </CardDescription>
                  </div>
                  <Badge className={getRiskColor(invoice.risk)}>
                    {invoice.risk}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Face Value</div>
                    <div className="font-semibold">{formatCurrency(invoice.faceValue)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Expected IRR</div>
                    <div className="font-semibold text-app-green-600">
                      {yieldCalc.irr.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Location & Timing */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{invoice.origin} → {invoice.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{invoice.tenor} days • {invoice.quantity}</span>
                  </div>
                </div>
                
                {/* Funding Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-medium">{invoice.funded}%</span>
                  </div>
                  <Progress value={invoice.funded} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(invoice.faceValue * (invoice.funded / 100))} of {formatCurrency(invoice.faceValue)}
                  </div>
                </div>
                
                {/* Yield Breakdown */}
                {isSelected && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="text-sm font-medium mb-2">Yield Breakdown</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Buy Price:</span>
                        <span>{formatCurrency(yieldCalc.buyPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin:</span>
                        <span className="text-app-green-600">{formatCurrency(yieldCalc.margin)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount Rate:</span>
                        <span>{yieldCalc.discountRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost to SME:</span>
                        <span>{yieldCalc.costSME.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-medium">
                        <span>HTS Token ID:</span>
                        <span className="font-mono text-xs">{invoice.htsTokenId}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(invoice.id)
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPurchaseInvoice(invoice.id)
                    }}
                    disabled={isPurchasing || !purchaseAmount || invoice.funded >= 100}
                    className="flex-1 bg-app-blue-600 hover:bg-app-blue-700"
                  >
                    {isPurchasing ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-3 w-3 mr-1" />
                    )}
                    {invoice.funded >= 100 ? 'Fully Funded' : 'Invest'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* No Results */}
      {sortedInvoices.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Purchase Status */}
      {purchaseStatus && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{purchaseStatus}</AlertDescription>
        </Alert>
      )}
      
      {/* Investment Summary */}
      {purchaseAmount > 0 && selectedInvoice && (
        <Card className="border-app-blue-200 bg-app-blue-50 dark:bg-app-blue-900/20">
          <CardHeader>
            <CardTitle className="text-lg">Investment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Investment Amount</div>
                <div className="font-semibold">{formatCurrency(purchaseAmount)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Expected Return</div>
                <div className="font-semibold text-app-green-600">
                  {formatCurrency(purchaseAmount * 1.18)} {/* Approximate 18% return */}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Transaction Fee</div>
                <div className="font-semibold">{formatHBAR(0.001)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Settlement Date</div>
                <div className="font-semibold">
                  {new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}