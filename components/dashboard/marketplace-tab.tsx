'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ShoppingCart, TrendingUp, Clock, MapPin, Package, Loader2, Eye, Filter } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Invoice {
  id: string
  exporter: string
  importer: string
  commodity: string
  faceValue: number
  buyPrice: number
  tenor: number
  daysRemaining: number
  estimatedPd: number
  projectedIrr: number
  country: string
  status: 'available' | 'pending' | 'sold'
  createdAt: string
  image?: string
}

interface MarketplaceTabProps {
  isWalletConnected: boolean
  walletBalance: number
  invoices: Invoice[]
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedCountry: string
  setSelectedCountry: (value: string) => void
  selectedCommodity: string
  setSelectedCommodity: (value: string) => void
  minIrr: number | ''
  setMinIrr: (value: number | '') => void
  maxTenor: number | ''
  setMaxTenor: (value: number | '') => void
  purchaseStatus: 'idle' | 'purchasing' | 'success' | 'error'
  purchaseMessage: string
  handlePurchaseInvoice: (invoiceId: string) => Promise<void>
  handleViewDetails: (invoiceId: string) => void
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
}

export function MarketplaceTab({
  isWalletConnected,
  walletBalance,
  invoices,
  searchTerm,
  setSearchTerm,
  selectedCountry,
  setSelectedCountry,
  selectedCommodity,
  setSelectedCommodity,
  minIrr,
  setMinIrr,
  maxTenor,
  setMaxTenor,
  purchaseStatus,
  purchaseMessage,
  handlePurchaseInvoice,
  handleViewDetails,
  formatCurrency,
  formatHBAR
}: MarketplaceTabProps) {
  const { toast } = useToast()
  const [showFilters, setShowFilters] = useState(false)

  // Filter invoices based on search criteria
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.exporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.importer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.commodity.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCountry = !selectedCountry || invoice.country === selectedCountry
    const matchesCommodity = !selectedCommodity || invoice.commodity === selectedCommodity
    const matchesIrr = !minIrr || invoice.projectedIrr >= minIrr
    const matchesTenor = !maxTenor || invoice.daysRemaining <= maxTenor
    
    return matchesSearch && matchesCountry && matchesCommodity && matchesIrr && matchesTenor
  })

  // Get unique countries and commodities for filter options
  const countries = [...new Set(invoices.map(inv => inv.country))]
  const commodities = [...new Set(invoices.map(inv => inv.commodity))]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-app-green-100 text-app-green-800 dark:bg-app-green-900 dark:text-app-green-200'
      case 'pending': return 'bg-app-yellow-100 text-app-yellow-800 dark:bg-app-yellow-900 dark:text-app-yellow-200'
      case 'sold': return 'bg-app-gray-100 text-app-gray-800 dark:bg-app-gray-700 dark:text-app-gray-200'
      default: return 'bg-app-gray-100 text-app-gray-800 dark:bg-app-gray-700 dark:text-app-gray-200'
    }
  }

  const getRiskColor = (pd: number) => {
    if (pd <= 1) return 'text-app-green-600 dark:text-app-green-400'
    if (pd <= 3) return 'text-app-yellow-600 dark:text-app-yellow-400'
    return 'text-app-red-600 dark:text-app-red-400'
  }

  const getCommodityImage = (commodity: string) => {
    const imageMap: { [key: string]: string } = {
      'Crude Palm Oil': '/images/commodities/palm-oil.png',
      'Arabica Coffee Beans': '/images/commodities/coffee-beans.png',
      'Natural Rubber RSS3': '/images/commodities/rubber-tree.png',
      'Cocoa Beans': '/images/commodities/cocoa-beans.png',
      'Jasmine Rice': '/images/commodities/jasmine-rice.png',
      'Black Pepper': '/images/commodities/black-pepper.png',
      'Coconut Oil': '/images/commodities/coconut-oil.png',
      'Vanilla Beans': '/images/commodities/vanilla-beans.png',
      'Cloves': '/images/commodities/cloves.png',
      'Nutmeg': '/images/commodities/nutmeg.png'
    }
    return imageMap[commodity] || '/images/commodities/palm-oil.png'
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-app-gray-900 dark:text-app-gray-50 mb-2">Invoice Marketplace</h2>
        <p className="text-app-gray-600 dark:text-app-gray-400">Discover and invest in trade finance opportunities</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-app-gray-900 dark:text-app-gray-50">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-app-gray-300 dark:border-app-gray-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-app-gray-400" />
            <Input
              type="text"
              placeholder="Search by company, commodity, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-app-gray-700 border-app-gray-300 dark:border-app-gray-600"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-app-gray-200 dark:border-app-gray-600">
              <div>
                <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Country</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-white dark:bg-app-gray-700 border-app-gray-300 dark:border-app-gray-600">
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All countries</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Commodity</label>
                <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                  <SelectTrigger className="bg-white dark:bg-app-gray-700 border-app-gray-300 dark:border-app-gray-600">
                    <SelectValue placeholder="All commodities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All commodities</SelectItem>
                    {commodities.map(commodity => (
                      <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Min IRR (%)</label>
                <Input
                  type="number"
                  placeholder="e.g., 15"
                  value={minIrr}
                  onChange={(e) => setMinIrr(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-white dark:bg-app-gray-700 border-app-gray-300 dark:border-app-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Max Days Remaining</label>
                <Input
                  type="number"
                  placeholder="e.g., 60"
                  value={maxTenor}
                  onChange={(e) => setMaxTenor(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-white dark:bg-app-gray-700 border-app-gray-300 dark:border-app-gray-600"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-app-gray-600 dark:text-app-gray-400">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
        <div className="flex items-center gap-2 text-sm text-app-gray-600 dark:text-app-gray-400">
          <div className="w-3 h-3 bg-app-green-500 rounded-full"></div>
          <span>Available</span>
          <div className="w-3 h-3 bg-app-yellow-500 rounded-full ml-4"></div>
          <span>Pending</span>
          <div className="w-3 h-3 bg-app-gray-400 rounded-full ml-4"></div>
          <span>Sold</span>
        </div>
      </div>

      {/* Invoice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
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
              {/* Commodity Image */}
              <div className="relative w-full h-32 bg-app-gray-100 dark:bg-app-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={invoice.image || getCommodityImage(invoice.commodity)}
                  alt={invoice.commodity}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                  {invoice.commodity}
                </div>
              </div>
              {/* Company Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-app-gray-500 dark:text-app-gray-400">Exporter:</span>
                  <span className="text-app-gray-900 dark:text-app-gray-100 font-medium">{invoice.exporter}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-app-gray-500 dark:text-app-gray-400">Importer:</span>
                  <span className="text-app-gray-900 dark:text-app-gray-100 font-medium">{invoice.importer}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-3 w-3 text-app-gray-400" />
                  <span className="text-app-gray-900 dark:text-app-gray-100">{invoice.commodity}</span>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-app-gray-50 dark:bg-app-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Face Value</p>
                  <p className="text-sm font-semibold text-app-gray-900 dark:text-app-gray-100">{formatCurrency(invoice.faceValue)}</p>
                </div>
                <div className="bg-app-blue-50 dark:bg-app-blue-900 p-3 rounded-lg">
                  <p className="text-xs text-app-blue-600 dark:text-app-blue-400">Buy Price</p>
                  <p className="text-sm font-semibold text-app-blue-700 dark:text-app-blue-300">{formatCurrency(invoice.buyPrice)}</p>
                </div>
              </div>

              {/* Risk & Return */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-app-green-50 dark:bg-app-green-900 p-3 rounded-lg">
                  <p className="text-xs text-app-green-600 dark:text-app-green-400">Projected IRR</p>
                  <p className="text-sm font-semibold text-app-green-700 dark:text-app-green-300">{invoice.projectedIrr.toFixed(1)}%</p>
                </div>
                <div className="bg-app-gray-50 dark:bg-app-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Risk (PD)</p>
                  <p className={`text-sm font-semibold ${getRiskColor(invoice.estimatedPd)}`}>{invoice.estimatedPd.toFixed(1)}%</p>
                </div>
              </div>

              {/* Time Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-app-gray-600 dark:text-app-gray-400">
                  <Clock className="h-3 w-3" />
                  {invoice.daysRemaining} days remaining
                </div>
                <span className="text-app-gray-500 dark:text-app-gray-400">
                  Created {new Date(invoice.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(invoice.id)}
                  className="flex-1 border-app-gray-300 dark:border-app-gray-600"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                <Button
                  onClick={() => handlePurchaseInvoice(invoice.id)}
                  disabled={invoice.status !== 'available' || !isWalletConnected || purchaseStatus === 'purchasing'}
                  className="flex-1 bg-app-blue-600 hover:bg-app-blue-700 text-white"
                  size="sm"
                >
                  {purchaseStatus === 'purchasing' ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-3 w-3 mr-1" />
                  )}
                  {invoice.status === 'available' ? 'Buy' : 'Unavailable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-app-gray-400" />
            <h3 className="text-lg font-semibold text-app-gray-900 dark:text-app-gray-50 mb-2">No invoices found</h3>
            <p className="text-app-gray-600 dark:text-app-gray-400 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCountry('')
                setSelectedCommodity('')
                setMinIrr('')
                setMaxTenor('')
              }}
              className="border-app-gray-300 dark:border-app-gray-600"
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Purchase Status Message */}
      {purchaseMessage && (
        <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
          <CardContent className="pt-6">
            <div className={`p-3 rounded-lg text-sm ${
              purchaseStatus === 'success' ? 'bg-app-green-50 dark:bg-app-green-900 text-app-green-700 dark:text-app-green-300' :
              purchaseStatus === 'error' ? 'bg-app-red-50 dark:bg-app-red-900 text-app-red-700 dark:text-app-red-300' :
              'bg-app-blue-50 dark:bg-app-blue-900 text-app-blue-700 dark:text-app-blue-300'
            }`}>
              {purchaseMessage}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Statistics */}
      <Card className="bg-gradient-to-br from-app-blue-50 to-app-green-50 dark:from-app-gray-800 dark:to-app-gray-900 border-app-blue-200 dark:border-app-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-app-gray-900 dark:text-app-gray-50">
            <TrendingUp className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-app-blue-600 dark:text-app-blue-400">{invoices.filter(inv => inv.status === 'available').length}</p>
              <p className="text-sm text-app-gray-600 dark:text-app-gray-400">Available Invoices</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-app-green-600 dark:text-app-green-400">
                {invoices.length > 0 ? (invoices.reduce((sum, inv) => sum + inv.projectedIrr, 0) / invoices.length).toFixed(1) : '0'}%
              </p>
              <p className="text-sm text-app-gray-600 dark:text-app-gray-400">Avg. IRR</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-app-orange-600 dark:text-app-orange-400">
                {formatCurrency(invoices.reduce((sum, inv) => sum + inv.faceValue, 0))}
              </p>
              <p className="text-sm text-app-gray-600 dark:text-app-gray-400">Total Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-app-purple-600 dark:text-app-purple-400">{countries.length}</p>
              <p className="text-sm text-app-gray-600 dark:text-app-gray-400">Countries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}