'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, FileText, Zap, Loader2, Coins, HandCoins, PiggyBank } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CreateTabProps {
  isWalletConnected: boolean
  walletBalance: number
  stakedBalance: number
  exporter: string
  setExporter: (value: string) => void
  importer: string
  setImporter: (value: string) => void
  commodity: string
  setCommodity: (value: string) => void
  faceValue: number | ''
  setFaceValue: (value: number | '') => void
  tenor: number | ''
  setTenor: (value: number | '') => void
  quantity: string
  setQuantity: (value: string) => void
  estimatedPd: number | null
  discountRatePreview: number | null
  projectedIrrPreview: number | null
  requiredHbarCollateral: number | null
  mintingStatus: 'idle' | 'calculating' | 'minting' | 'success' | 'error' | 'calculated'
  mintingMessage: string
  releaseInvoiceId: string
  setReleaseInvoiceId: (value: string) => void
  releaseCollateralAmount: number | ''
  setReleaseCollateralAmount: (value: number | '') => void
  releaseStatus: 'idle' | 'releasing' | 'success' | 'error'
  releaseMessage: string
  stakingStatus: 'idle' | 'processing' | 'success' | 'error'
  stakingMessage: string
  totalInvoiceValueForStake: number | ''
  setTotalInvoiceValueForStake: (value: number | '') => void
  calculatedRequiredStake: number | null
  missingHbarForCollateral: number
  missingHbarForCalculatedStake: number
  handleCalculateYield: () => void
  handleMintNFT: () => Promise<void>
  handleReleaseCollateral: () => Promise<void>
  handleStake: (amount: number) => Promise<void>
  formatCurrency: (value: number) => string
  formatHBAR: (value: number) => string
  calculateRealYield: (faceValue: number, pd: number, tenor: number) => any
}

export function CreateTab({
  isWalletConnected,
  walletBalance,
  stakedBalance,
  exporter,
  setExporter,
  importer,
  setImporter,
  commodity,
  setCommodity,
  faceValue,
  setFaceValue,
  tenor,
  setTenor,
  quantity,
  setQuantity,
  estimatedPd,
  discountRatePreview,
  projectedIrrPreview,
  requiredHbarCollateral,
  mintingStatus,
  mintingMessage,
  releaseInvoiceId,
  setReleaseInvoiceId,
  releaseCollateralAmount,
  setReleaseCollateralAmount,
  releaseStatus,
  releaseMessage,
  stakingStatus,
  stakingMessage,
  totalInvoiceValueForStake,
  setTotalInvoiceValueForStake,
  calculatedRequiredStake,
  missingHbarForCollateral,
  missingHbarForCalculatedStake,
  handleCalculateYield,
  handleMintNFT,
  handleReleaseCollateral,
  handleStake,
  formatCurrency,
  formatHBAR,
  calculateRealYield
}: CreateTabProps) {
  const { toast } = useToast()

  // Example calculation for the simulation section
  const exampleFaceValue = 50000
  const exampleTenor = 60
  const examplePD = 0.40
  const exampleCalc = calculateRealYield(exampleFaceValue, examplePD, exampleTenor)

  return (
    <div className="space-y-8">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-app-gray-900 dark:text-app-gray-50 mb-2">Create Invoice NFT</h2>
        <p className="text-app-gray-600 dark:text-app-gray-400">Mint HTS NFTs for trade finance invoices with AI-powered risk assessment</p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-app-gray-100/80 dark:bg-app-gray-800/80">
          <TabsTrigger value="create">Create Invoice</TabsTrigger>
          <TabsTrigger value="stake">Stake HBAR</TabsTrigger>
          <TabsTrigger value="release">Release Collateral</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Invoice Creation Form */}
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-app-gray-900 dark:text-app-gray-50">
                  <FileText className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
                <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                  Enter the trade finance invoice information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Exporter Company</label>
                    <input
                      type="text"
                      value={exporter}
                      onChange={(e) => setExporter(e.target.value)}
                      className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                      placeholder="e.g., Singapore Agri Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Importer Company</label>
                    <input
                      type="text"
                      value={importer}
                      onChange={(e) => setImporter(e.target.value)}
                      className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                      placeholder="e.g., Rotterdam Trading BV"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Commodity</label>
                  <input
                    type="text"
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                    placeholder="e.g., Crude Palm Oil"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Face Value (USD)</label>
                    <input
                      type="number"
                      value={faceValue}
                      onChange={(e) => setFaceValue(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Tenor (Days)</label>
                    <input
                      type="number"
                      value={tenor}
                      onChange={(e) => setTenor(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                      placeholder="45"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Quantity</label>
                    <input
                      type="text"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                      placeholder="1,000 MT"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCalculateYield}
                  disabled={mintingStatus === 'calculating'}
                  className="w-full bg-app-blue-600 hover:bg-app-blue-700 text-white"
                >
                  {mintingStatus === 'calculating' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
                  ) : (
                    <><Calculator className="mr-2 h-4 w-4" /> Calculate Yield & Collateral</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* AI Risk Assessment Preview */}
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-app-gray-900 dark:text-app-gray-50">
                  <Zap className="h-5 w-5" />
                  AI Risk Assessment
                </CardTitle>
                <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                  Real-time yield calculation and collateral requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mintingStatus === 'calculated' && estimatedPd !== null ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-app-gray-50 dark:bg-app-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-app-gray-600 dark:text-app-gray-400">Estimated PD</p>
                        <p className="text-lg font-semibold text-app-gray-900 dark:text-app-gray-50">{estimatedPd.toFixed(1)}%</p>
                      </div>
                      <div className="bg-app-gray-50 dark:bg-app-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-app-gray-600 dark:text-app-gray-400">Discount Rate</p>
                        <p className="text-lg font-semibold text-app-gray-900 dark:text-app-gray-50">{discountRatePreview?.toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-app-green-50 dark:bg-app-green-900 p-3 rounded-lg">
                        <p className="text-sm text-app-green-600 dark:text-app-green-400">Projected IRR</p>
                        <p className="text-lg font-semibold text-app-green-700 dark:text-app-green-300">{projectedIrrPreview?.toFixed(1)}%</p>
                      </div>
                      <div className="bg-app-orange-50 dark:bg-app-orange-900 p-3 rounded-lg">
                        <p className="text-sm text-app-orange-600 dark:text-app-orange-400">Required Collateral</p>
                        <p className="text-lg font-semibold text-app-orange-700 dark:text-app-orange-300">{formatHBAR(requiredHbarCollateral || 0)}</p>
                      </div>
                    </div>
                    
                    {/* Collateral Status */}
                    <div className="bg-app-blue-50 dark:bg-app-blue-900 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-app-blue-700 dark:text-app-blue-300">Your Staked Balance</span>
                        <span className="text-sm font-semibold text-app-blue-800 dark:text-app-blue-200">{formatHBAR(stakedBalance)}</span>
                      </div>
                      {missingHbarForCollateral > 0 ? (
                        <div className="text-sm text-app-red-600 dark:text-app-red-400">
                          ⚠️ Need {formatHBAR(missingHbarForCollateral)} more staked HBAR for collateral
                        </div>
                      ) : (
                        <div className="text-sm text-app-green-600 dark:text-app-green-400">
                          ✅ Sufficient staked balance for collateral
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-app-gray-500 dark:text-app-gray-400">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter invoice details and calculate to see AI risk assessment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mint Button and Status */}
          <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Button 
                  onClick={handleMintNFT}
                  disabled={mintingStatus !== 'calculated' || !isWalletConnected}
                  className="bg-app-green-600 hover:bg-app-green-700 text-white px-8 py-3 text-lg"
                >
                  {mintingStatus === 'minting' ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Minting HTS NFT...</>
                  ) : (
                    <><Coins className="mr-2 h-5 w-5" /> Mint Invoice NFT</>
                  )}
                </Button>
                {mintingMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    mintingStatus === 'success' ? 'bg-app-green-50 dark:bg-app-green-900 text-app-green-700 dark:text-app-green-300' :
                    mintingStatus === 'error' ? 'bg-app-red-50 dark:bg-app-red-900 text-app-red-700 dark:text-app-red-300' :
                    'bg-app-blue-50 dark:bg-app-blue-900 text-app-blue-700 dark:text-app-blue-300'
                  }`}>
                    {mintingMessage}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real Yield Formula Explanation */}
          <Card className="bg-gradient-to-br from-app-green-50 to-app-blue-50 dark:from-app-gray-800 dark:to-app-gray-900 border-app-green-200 dark:border-app-green-700">
            <CardHeader>
              <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Real Yield Formula</CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Transparent, algorithmic pricing based on risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-app-gray-900 dark:text-app-gray-50">Formula Components:</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-app-gray-700 dark:text-app-gray-300"><strong>Discount Rate:</strong> d_min + (d_max - d_min) × PD</p>
                    <p className="text-app-gray-700 dark:text-app-gray-300"><strong>Buy Price:</strong> Face Value × (1 - Discount - Reserve - Platform)</p>
                    <p className="text-app-gray-700 dark:text-app-gray-300"><strong>IRR:</strong> (Margin / Buy Price) × (365 / Tenor) × 100</p>
                    <p className="text-app-gray-700 dark:text-app-gray-300"><strong>Collateral:</strong> 5% of Face Value in HBAR</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-app-gray-900 dark:text-app-gray-50">Example Calculation:</h4>
                  <div className="bg-white dark:bg-app-gray-800 p-4 rounded-lg space-y-2 text-sm">
                    <p className="text-app-gray-700 dark:text-app-gray-300">Face Value: {formatCurrency(exampleFaceValue)}</p>
                    <p className="text-app-gray-700 dark:text-app-gray-300">Tenor: {exampleTenor} days</p>
                    <p className="text-app-gray-700 dark:text-app-gray-300">PD: {(examplePD * 100).toFixed(1)}%</p>
                    <hr className="border-app-gray-200 dark:border-app-gray-600" />
                    <p className="text-app-green-600 dark:text-app-green-400 font-semibold">IRR: {exampleCalc.irr.toFixed(1)}%</p>
                    <p className="text-app-blue-600 dark:text-app-blue-400">Buy Price: {formatCurrency(exampleCalc.buyPrice)}</p>
                    <p className="text-app-orange-600 dark:text-app-orange-400">Collateral: {formatHBAR(exampleCalc.requiredCollateral)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake" className="space-y-6">
          <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-app-gray-900 dark:text-app-gray-50">
                <PiggyBank className="h-5 w-5" />
                Stake HBAR for Collateral
              </CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Stake HBAR to use as collateral for invoice creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Balances */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-app-blue-50 dark:bg-app-blue-900 p-4 rounded-lg">
                  <p className="text-sm text-app-blue-600 dark:text-app-blue-400">Wallet Balance</p>
                  <p className="text-xl font-semibold text-app-blue-700 dark:text-app-blue-300">{formatHBAR(walletBalance)}</p>
                </div>
                <div className="bg-app-green-50 dark:bg-app-green-900 p-4 rounded-lg">
                  <p className="text-sm text-app-green-600 dark:text-app-green-400">Staked Balance</p>
                  <p className="text-xl font-semibold text-app-green-700 dark:text-app-green-300">{formatHBAR(stakedBalance)}</p>
                </div>
              </div>

              {/* Stake Calculator */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">
                    Total Invoice Value (USD) - to calculate required stake
                  </label>
                  <input
                    type="number"
                    value={totalInvoiceValueForStake}
                    onChange={(e) => setTotalInvoiceValueForStake(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                    placeholder="Enter total value of invoices you plan to create"
                  />
                </div>
                
                {calculatedRequiredStake !== null && (
                  <div className="bg-app-orange-50 dark:bg-app-orange-900 p-4 rounded-lg">
                    <p className="text-sm text-app-orange-600 dark:text-app-orange-400">Required Stake (5% of invoice value)</p>
                    <p className="text-lg font-semibold text-app-orange-700 dark:text-app-orange-300">{formatHBAR(calculatedRequiredStake)}</p>
                    {missingHbarForCalculatedStake > 0 && (
                      <p className="text-sm text-app-red-600 dark:text-app-red-400 mt-2">
                        Need to stake: {formatHBAR(missingHbarForCalculatedStake)}
                      </p>
                    )}
                  </div>
                )}

                {missingHbarForCalculatedStake > 0 && (
                  <Button 
                    onClick={() => handleStake(missingHbarForCalculatedStake)}
                    disabled={stakingStatus === 'processing' || !isWalletConnected || walletBalance < missingHbarForCalculatedStake}
                    className="w-full bg-app-green-600 hover:bg-app-green-700 text-white"
                  >
                    {stakingStatus === 'processing' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Staking...</>
                    ) : (
                      <><HandCoins className="mr-2 h-4 w-4" /> Stake {formatHBAR(missingHbarForCalculatedStake)}</>
                    )}
                  </Button>
                )}

                {stakingMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    stakingStatus === 'success' ? 'bg-app-green-50 dark:bg-app-green-900 text-app-green-700 dark:text-app-green-300' :
                    stakingStatus === 'error' ? 'bg-app-red-50 dark:bg-app-red-900 text-app-red-700 dark:text-app-red-300' :
                    'bg-app-blue-50 dark:bg-app-blue-900 text-app-blue-700 dark:text-app-blue-300'
                  }`}>
                    {stakingMessage}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="release" className="space-y-6">
          <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-app-gray-900 dark:text-app-gray-50">
                <HandCoins className="h-5 w-5" />
                Release Exporter Collateral
              </CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Release locked HBAR collateral after invoice settlement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Invoice ID</label>
                  <input
                    type="text"
                    value={releaseInvoiceId}
                    onChange={(e) => setReleaseInvoiceId(e.target.value)}
                    className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                    placeholder="INV-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-2">Collateral Amount (HBAR)</label>
                  <input
                    type="number"
                    value={releaseCollateralAmount}
                    onChange={(e) => setReleaseCollateralAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-app-gray-300 dark:border-app-gray-600 rounded-md bg-white dark:bg-app-gray-700 text-app-gray-900 dark:text-app-gray-100"
                    placeholder="2500"
                  />
                </div>
              </div>
              <Button 
                onClick={handleReleaseCollateral}
                disabled={releaseStatus === 'releasing' || !isWalletConnected}
                className="w-full bg-app-orange-600 hover:bg-app-orange-700 text-white"
              >
                {releaseStatus === 'releasing' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Releasing...</>
                ) : (
                  <><HandCoins className="mr-2 h-4 w-4" /> Release Collateral</>
                )}
              </Button>
              {releaseMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  releaseStatus === 'success' ? 'bg-app-green-50 dark:bg-app-green-900 text-app-green-700 dark:text-app-green-300' :
                  releaseStatus === 'error' ? 'bg-app-red-50 dark:bg-app-red-900 text-app-red-700 dark:text-app-red-300' :
                  'bg-app-blue-50 dark:bg-app-blue-900 text-app-blue-700 dark:text-app-blue-300'
                }`}>
                  {releaseMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}