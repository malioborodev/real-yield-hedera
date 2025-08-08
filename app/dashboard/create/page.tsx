'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Calculator, Upload, FileText, Shield, DollarSign, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { calculateRealYield, simulateAiRisk, formatCurrency, formatHBAR } from '../shared/data'

interface CreateTabProps {
  faceValue: number
  setFaceValue: (value: number) => void
  tenor: number
  setTenor: (value: number) => void
  commodity: string
  setCommodity: (value: string) => void
  exporter: string
  setExporter: (value: string) => void
  importer: string
  setImporter: (value: string) => void
  origin: string
  setOrigin: (value: string) => void
  destination: string
  setDestination: (value: string) => void
  quantity: string
  setQuantity: (value: string) => void
  quality: string
  setQuality: (value: string) => void
  description: string
  setDescription: (value: string) => void
  collateralAmount: number
  setCollateralAmount: (value: number) => void
  isCreating: boolean
  createStatus: string
  onCalculateYield: () => void
  onMintNFT: () => void
  onReleaseCollateral: () => void
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
}

export default function CreateTab({
  faceValue,
  setFaceValue,
  tenor,
  setTenor,
  commodity,
  setCommodity,
  exporter,
  setExporter,
  importer,
  setImporter,
  origin,
  setOrigin,
  destination,
  setDestination,
  quantity,
  setQuantity,
  quality,
  setQuality,
  description,
  setDescription,
  collateralAmount,
  setCollateralAmount,
  isCreating,
  createStatus,
  onCalculateYield,
  onMintNFT,
  onReleaseCollateral,
  formatCurrency,
  formatHBAR
}: CreateTabProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [documentUploaded, setDocumentUploaded] = useState(false)
  
  // Calculate real yield and risk
  const pd = simulateAiRisk(faceValue, tenor)
  const yieldCalc = calculateRealYield(faceValue, pd, tenor)
  
  const getRiskGrade = (pd: number) => {
    if (pd <= 0.1) return { grade: 'AAA', color: 'bg-app-green-200 text-app-green-700 border-app-green-300' }
    if (pd <= 0.3) return { grade: 'AA', color: 'bg-app-green-200 text-app-green-700 border-app-green-300' }
    if (pd <= 0.5) return { grade: 'A', color: 'bg-app-orange-200 text-app-orange-700 border-app-orange-300' }
    if (pd <= 0.7) return { grade: 'BBB', color: 'bg-app-red-200 text-app-red-700 border-app-red-300' }
    return { grade: 'BB', color: 'bg-app-red-200 text-app-red-700 border-app-red-300' }
  }
  
  const riskGrade = getRiskGrade(pd)
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simulate upload progress
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setDocumentUploaded(true)
            return 100
          }
          return prev + 10
        })
      }, 200)
    }
  }
  
  const isFormValid = faceValue > 0 && tenor > 0 && commodity && exporter && importer && documentUploaded

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Create Invoice NFT</h2>
        <p className="text-muted-foreground">
          Tokenize your trade invoice and access instant liquidity through our Real Yield Protocol
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Details Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </CardTitle>
            <CardDescription>
              Enter your trade invoice information for tokenization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faceValue">Face Value (USD)</Label>
                <Input
                  id="faceValue"
                  type="number"
                  placeholder="50000"
                  value={faceValue || ''}
                  onChange={(e) => setFaceValue(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenor">Tenor (Days)</Label>
                <Input
                  id="tenor"
                  type="number"
                  placeholder="45"
                  value={tenor || ''}
                  onChange={(e) => setTenor(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Commodity Information */}
            <div className="space-y-2">
              <Label htmlFor="commodity">Commodity</Label>
              <Select value={commodity} onValueChange={setCommodity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select commodity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crude Palm Oil">Crude Palm Oil</SelectItem>
                  <SelectItem value="Arabica Coffee Beans">Arabica Coffee Beans</SelectItem>
                  <SelectItem value="Natural Rubber RSS3">Natural Rubber RSS3</SelectItem>
                  <SelectItem value="Cocoa Beans">Cocoa Beans</SelectItem>
                  <SelectItem value="Jasmine Rice">Jasmine Rice</SelectItem>
                  <SelectItem value="Black Pepper">Black Pepper</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trading Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exporter">Exporter</Label>
                <Input
                  id="exporter"
                  placeholder="Company Name"
                  value={exporter}
                  onChange={(e) => setExporter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="importer">Importer</Label>
                <Input
                  id="importer"
                  placeholder="Company Name"
                  value={importer}
                  onChange={(e) => setImporter(e.target.value)}
                />
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  placeholder="Country/Port"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="Country/Port"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            {/* Quantity and Quality */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  placeholder="1,000 MT"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Quality Grade</Label>
                <Input
                  id="quality"
                  placeholder="Premium Grade"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                placeholder="Any additional information about the trade..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label htmlFor="document">Trade Documents</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Upload invoice, bill of lading, or other trade documents
                  </p>
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.jpg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
                {documentUploaded && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-app-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Document uploaded successfully</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real Yield Calculator & Results */}
        <div className="space-y-6">
          {/* AI Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI Risk Assessment
              </CardTitle>
              <CardDescription>
                Automated credit scoring based on trade parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Credit Rating</span>
                  <Badge className={riskGrade.color}>
                    {riskGrade.grade}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Probability of Default</span>
                  <span className="text-sm font-mono">{(pd * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Discount Rate</span>
                  <span className="text-sm font-mono">{yieldCalc.discountRate.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Required Collateral</span>
                  <span className="text-sm font-mono">{formatHBAR(yieldCalc.requiredCollateral / 0.05)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real Yield Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Real Yield Calculator
              </CardTitle>
              <CardDescription>
                Calculate expected returns for investors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={onCalculateYield}
                  className="w-full"
                  disabled={!faceValue || !tenor}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Real Yield
                </Button>
                
                {faceValue > 0 && tenor > 0 && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Face Value</span>
                      <span className="text-sm font-mono">{formatCurrency(faceValue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Buy Price</span>
                      <span className="text-sm font-mono">{formatCurrency(yieldCalc.buyPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Margin</span>
                      <span className="text-sm font-mono text-app-green-600">{formatCurrency(yieldCalc.margin)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm font-bold">Expected IRR</span>
                      <span className="text-sm font-bold text-app-green-600">{yieldCalc.irr.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cost to SME</span>
                      <span className="text-sm font-mono">{yieldCalc.costSME.toFixed(2)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Collateral Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                HBAR Collateral
              </CardTitle>
              <CardDescription>
                Manage your collateral requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collateral">Collateral Amount (HBAR)</Label>
                <Input
                  id="collateral"
                  type="number"
                  placeholder="2500"
                  value={collateralAmount || ''}
                  onChange={(e) => setCollateralAmount(Number(e.target.value))}
                />
              </div>
              
              {faceValue > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Required collateral: {formatHBAR(yieldCalc.requiredCollateral / 0.05)} 
                    (5% of face value)
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={onReleaseCollateral}
                variant="outline"
                className="w-full"
                disabled={collateralAmount <= 0}
              >
                Release Collateral
              </Button>
            </CardContent>
          </Card>

          {/* Create NFT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mint Invoice NFT
              </CardTitle>
              <CardDescription>
                Create your tradeable invoice token on Hedera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onMintNFT}
                className="w-full bg-app-blue-600 hover:bg-app-blue-700"
                disabled={!isFormValid || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating NFT...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Mint Invoice NFT
                  </>
                )}
              </Button>
              
              {createStatus && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{createStatus}</AlertDescription>
                </Alert>
              )}
              
              {!isFormValid && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fill all required fields and upload documents to continue.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}