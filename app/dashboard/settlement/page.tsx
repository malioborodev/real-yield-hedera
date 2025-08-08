'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  MapPin, 
  AlertCircle,
  Upload,
  Download,
  ExternalLink,
  Loader2,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react'
import { formatCurrency, formatHBAR } from '../shared/data'

interface SettlementTabProps {
  portfolioData: any[]
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
}

export default function SettlementTab({
  portfolioData,
  formatCurrency,
  formatHBAR
}: SettlementTabProps) {
  const [selectedTab, setSelectedTab] = useState('pending')
  const [settlementProof, setSettlementProof] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSettling, setIsSettling] = useState(false)
  
  // Filter data based on settlement status
  const pendingSettlements = portfolioData.filter(item => 
    item.status === 'Active' && item.daysLeft <= 7
  )
  const readyForSettlement = portfolioData.filter(item => 
    item.status === 'Active' && item.daysLeft <= 0
  )
  const settledInvoices = portfolioData.filter(item => 
    item.status === 'Settled'
  )
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 200)
    }
  }
  
  const handleSettlement = async (invoiceId: string) => {
    setIsSettling(true)
    // Simulate settlement process
    setTimeout(() => {
      setIsSettling(false)
      // Update invoice status
    }, 3000)
  }
  
  const totalPendingValue = pendingSettlements.reduce((sum, item) => sum + item.faceValue, 0)
  const totalSettledValue = settledInvoices.reduce((sum, item) => sum + item.faceValue, 0)
  const totalProfitEarned = settledInvoices.reduce((sum, item) => sum + item.profitEarned, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Settlement Center</h2>
        <p className="text-muted-foreground">
          Manage invoice settlements and claim your yields
        </p>
      </div>

      {/* Settlement Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-app-orange-50 to-app-orange-100 dark:from-app-orange-900 dark:to-app-orange-800 border-app-orange-200 dark:border-app-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-orange-700 dark:text-app-orange-200">Pending Settlements</CardTitle>
            <Clock className="h-4 w-4 text-app-orange-600 dark:text-app-orange-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-orange-900 dark:text-app-orange-100">{pendingSettlements.length}</div>
            <p className="text-xs text-app-orange-600 dark:text-app-orange-300">
              {formatCurrency(totalPendingValue)} total value
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-blue-50 to-app-blue-100 dark:from-app-blue-900 dark:to-app-blue-800 border-app-blue-200 dark:border-app-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-blue-700 dark:text-app-blue-200">Ready to Settle</CardTitle>
            <CheckCircle className="h-4 w-4 text-app-blue-600 dark:text-app-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-blue-900 dark:text-app-blue-100">{readyForSettlement.length}</div>
            <p className="text-xs text-app-blue-600 dark:text-app-blue-300">
              Awaiting settlement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-green-50 to-app-green-100 dark:from-app-green-900 dark:to-app-green-800 border-app-green-200 dark:border-app-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-green-700 dark:text-app-green-200">Settled Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-app-green-600 dark:text-app-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-green-900 dark:text-app-green-100">{settledInvoices.length}</div>
            <p className="text-xs text-app-green-600 dark:text-app-green-300">
              {formatCurrency(totalSettledValue)} settled
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-app-purple-50 to-app-purple-100 dark:from-app-purple-900 dark:to-app-purple-800 border-app-purple-200 dark:border-app-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-app-purple-700 dark:text-app-purple-200">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-app-purple-600 dark:text-app-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-app-purple-900 dark:text-app-purple-100">{formatCurrency(totalProfitEarned)}</div>
            <p className="text-xs text-app-purple-600 dark:text-app-purple-300">
              From settlements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingSettlements.length})</TabsTrigger>
          <TabsTrigger value="ready">Ready ({readyForSettlement.length})</TabsTrigger>
          <TabsTrigger value="settled">Settled ({settledInvoices.length})</TabsTrigger>
        </TabsList>

        {/* Pending Settlements */}
        <TabsContent value="pending" className="space-y-4">
          {pendingSettlements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Settlements</h3>
                <p className="text-muted-foreground">
                  All your investments are either settled or not yet due for settlement
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingSettlements.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{invoice.commodity}</h3>
                        <Badge className="bg-app-orange-200 text-app-orange-700 border-app-orange-300">
                          {invoice.daysLeft} days left
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {invoice.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Settlement: {new Date(Date.now() + invoice.daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </span>
                        <span className="font-mono text-xs">{invoice.htsTokenId}</span>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">Expected Settlement</div>
                      <div className="text-xl font-bold">{formatCurrency(invoice.faceValue)}</div>
                      <div className="text-sm font-medium text-app-green-600">
                        +{formatCurrency(invoice.faceValue - invoice.invested)} profit
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Invested</div>
                      <div className="font-semibold">{formatCurrency(invoice.invested)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Current Value</div>
                      <div className="font-semibold">{formatCurrency(invoice.currentValue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Expected Yield</div>
                      <div className="font-semibold text-app-green-600">
                        {(((invoice.faceValue - invoice.invested) / invoice.invested) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Time to Settlement</span>
                      <span>{invoice.daysLeft} days remaining</span>
                    </div>
                    <Progress 
                      value={((invoice.tenor - invoice.daysLeft) / invoice.tenor) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Settlement will be automatically processed when the tenor expires. 
                      Monitor for any settlement documentation requirements.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Ready for Settlement */}
        <TabsContent value="ready" className="space-y-4">
          {readyForSettlement.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Invoices Ready</h3>
                <p className="text-muted-foreground">
                  No invoices are currently ready for settlement
                </p>
              </CardContent>
            </Card>
          ) : (
            readyForSettlement.map((invoice) => (
              <Card key={invoice.id} className="border-app-green-200 bg-app-green-50 dark:bg-app-green-900/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{invoice.commodity}</h3>
                        <Badge className="bg-app-green-200 text-app-green-700 border-app-green-300">
                          Ready to Settle
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {invoice.destination}
                        </span>
                        <span className="font-mono text-xs">{invoice.htsTokenId}</span>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">Settlement Amount</div>
                      <div className="text-xl font-bold text-app-green-600">{formatCurrency(invoice.faceValue)}</div>
                      <div className="text-sm font-medium">
                        Profit: {formatCurrency(invoice.faceValue - invoice.invested)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Settlement Form */}
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="proof">Settlement Proof (Optional)</Label>
                      <Textarea
                        id="proof"
                        placeholder="Add any settlement documentation or notes..."
                        value={settlementProof}
                        onChange={(e) => setSettlementProof(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documents">Upload Documents</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Upload settlement confirmation or payment proof
                          </p>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.png,.doc,.docx"
                            onChange={handleFileUpload}
                            className="max-w-xs mx-auto"
                          />
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="mt-2">
                            <Progress value={uploadProgress} className="w-full" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSettlement(invoice.id)}
                        disabled={isSettling}
                        className="flex-1 bg-app-green-600 hover:bg-app-green-700"
                      >
                        {isSettling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing Settlement...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Settlement
                          </>
                        )}
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Hedera
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Settled Invoices */}
        <TabsContent value="settled" className="space-y-4">
          {settledInvoices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Settled Invoices</h3>
                <p className="text-muted-foreground">
                  Your settled invoices will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            settledInvoices.map((invoice) => (
              <Card key={invoice.id} className="border-app-gray-200 bg-app-gray-50 dark:bg-app-gray-900/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{invoice.commodity}</h3>
                        <Badge className="bg-app-gray-200 text-app-gray-700 border-app-gray-300">
                          Settled
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {invoice.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Settled: {new Date().toLocaleDateString()}
                        </span>
                        <span className="font-mono text-xs">{invoice.htsTokenId}</span>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">Final Settlement</div>
                      <div className="text-xl font-bold">{formatCurrency(invoice.faceValue)}</div>
                      <div className="text-sm font-medium text-app-green-600">
                        Profit: {formatCurrency(invoice.profitEarned)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Invested</div>
                      <div className="font-semibold">{formatCurrency(invoice.invested)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Settled Amount</div>
                      <div className="font-semibold">{formatCurrency(invoice.faceValue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Profit Earned</div>
                      <div className="font-semibold text-app-green-600">{formatCurrency(invoice.profitEarned)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Yield Achieved</div>
                      <div className="font-semibold">
                        {((invoice.profitEarned / invoice.invested) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download Receipt
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Transaction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Settlement Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Settlement Process
          </CardTitle>
          <CardDescription>
            How settlements work on the Real Yield Protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-app-blue-100 text-app-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">1. Tenor Expiry</h3>
              <p className="text-sm text-muted-foreground">
                When the invoice tenor expires, it becomes eligible for settlement
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-app-green-100 text-app-green-600 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">2. Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Upload settlement proof and confirm the transaction details
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-app-purple-100 text-app-purple-600 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">3. Yield Distribution</h3>
              <p className="text-sm text-muted-foreground">
                Receive your principal plus yield directly to your wallet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}