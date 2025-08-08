'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, DollarSign, Package, Users, Activity, ArrowUpRight, ArrowDownRight, Wallet, Bell, Settings, Search, Filter, Plus, Globe, Truck, Ship, CheckCircle, Circle, Shield, Calculator, FileText, Zap, Loader2, Coins, HandCoins, PiggyBank } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import Image from 'next/image'
import { Header } from '@/components/header'

// Add import for Hedera services
import { useToast } from '@/components/ui/use-toast'

// Enhanced mock data with Real Yield Formula
const kpiData = [
  { name: 'Jan', tvl: 24000000, yield: 12.2, volume: 12000000, contracts: 145, settlements: 132, insurancePool: 48000 },
  { name: 'Feb', tvl: 28000000, yield: 13.5, volume: 14000000, contracts: 167, settlements: 154, insurancePool: 56000 },
  { name: 'Mar', tvl: 32000000, yield: 14.8, volume: 16000000, contracts: 189, settlements: 176, insurancePool: 64000 },
  { name: 'Apr', tvl: 36000000, yield: 15.1, volume: 18000000, contracts: 212, settlements: 198, insurancePool: 72000 },
  { name: 'May', tvl: 42000000, yield: 16.4, volume: 21000000, contracts: 234, settlements: 221, insurancePool: 84000 },
  { name: 'Jun', tvl: 48000000, yield: 17.7, volume: 24000000, contracts: 267, settlements: 245, insurancePool: 96000 },
  { name: 'Jul', tvl: 52000000, yield: 18.1, volume: 26500000, contracts: 289, settlements: 267, insurancePool: 104000 },
  { name: 'Aug', tvl: 58000000, yield: 19.3, volume: 29000000, contracts: 312, settlements: 289, insurancePool: 116000 },
]

const riskDistribution = [
  { name: 'AAA Grade (PD: 0-0.1)', value: 35, color: '#10B981', description: 'dmin: 0.6% | Tenor ≤30d' }, // app-green-600
  { name: 'AA Grade (PD: 0.1-0.3)', value: 30, color: '#059669', description: 'Discount: 0.6-2.8%' }, // app-green-700
  { name: 'A Grade (PD: 0.3-0.5)', value: 20, color: '#F59E0B', description: 'Discount: 2.8-4.4%' }, // app-orange-500
  { name: 'BBB Grade (PD: 0.5-0.7)', value: 10, color: '#EF4444', description: 'Discount: 4.4-6.0%' }, // app-red-500
  { name: 'Speculative (PD: 0.7-1.0)', value: 5, color: '#DC2626', description: 'dmax: 8% | Tenor 90d' }, // app-red-600
]

// Real Yield Formula Implementation
const calculateRealYield = (faceValue: number, pd: number, tenor: number) => {
  const dmin = 0.006 // 0.6%
  const dmax = 0.08  // 8%
  const reserveFee = 0.002 // 0.2%
  const platformFee = 0.002 // 0.2%
  const exporterCollateralPercentage = 0.05; // 5% of faceValue as HBAR collateral
  
  const discountRate = dmin + (dmax - dmin) * pd
  const buyPrice = faceValue * (1 - discountRate - reserveFee - platformFee)
  const margin = faceValue - buyPrice
  const irr = (margin / buyPrice) * (365 / tenor) * 100
  const costSME = discountRate * (365 / tenor) * 100
  const requiredCollateral = faceValue * exporterCollateralPercentage; // Calculate HBAR collateral based on face value

  return {
    discountRate: discountRate * 100,
    buyPrice,
    margin,
    irr,
    costSME,
    reserveAmount: faceValue * reserveFee,
    platformAmount: faceValue * platformFee,
    requiredCollateral // Return the calculated collateral
  }
}

const topInvoices = [
  { 
    id: 'INV-2024-001', 
    exporter: 'Singapore Agri Corp',
    importer: 'Rotterdam Trading BV',
    commodity: 'Crude Palm Oil',
    origin: 'Singapore',
    destination: 'Rotterdam, Netherlands',
    faceValue: 50000, 
    pd: 0.15, // 15% probability of default
    tenor: 45, 
    risk: 'AA', 
    category: 'Oils & Fats',
    quality: 'Premium RSPO',
    quantity: '1,000 MT',
    funded: 85,
    image: '/images/commodities/palm-oil.png',
    htsTokenId: '0.0.123456',
    hcsTopicId: '0.0.789012'
  },
  { 
    id: 'INV-2024-002', 
    exporter: 'Brazilian Coffee Exporters',
    importer: 'Hamburg Coffee Roasters',
    commodity: 'Arabica Coffee Beans',
    origin: 'Minas Gerais, Brazil',
    destination: 'Hamburg, Germany',
    faceValue: 75000, 
    pd: 0.08, // 8% probability of default
    tenor: 32, 
    risk: 'AAA', 
    category: 'Beverages',
    quality: 'Specialty Grade 1',
    quantity: '500 MT',
    funded: 92,
    image: '/images/commodities/coffee-beans.png',
    htsTokenId: '0.0.123457',
    hcsTopicId: '0.0.789013'
  },
  { 
    id: 'INV-2024-003', 
    exporter: 'Thai Rubber Producers',
    importer: 'Yokohama Tire Corp',
    commodity: 'Natural Rubber RSS3',
    origin: 'Surat Thani, Thailand',
    destination: 'Yokohama, Japan',
    faceValue: 120000, 
    pd: 0.25, // 25% probability of default
    tenor: 60, 
    risk: 'A', 
    category: 'Industrial',
    quality: 'RSS Grade 3',
    quantity: '2,000 MT',
    funded: 67,
    image: '/images/commodities/rubber-tree.png',
    htsTokenId: '0.0.123458',
    hcsTopicId: '0.0.789014'
  },
  { 
    id: 'INV-2024-004', 
    exporter: 'Ghana Cocoa Board',
    importer: 'Amsterdam Cocoa Trading',
    commodity: 'Cocoa Beans',
    origin: 'Accra, Ghana',
    destination: 'Amsterdam, Netherlands',
    faceValue: 85000, 
    pd: 0.18, // 18% probability of default
    tenor: 38, 
    risk: 'AA', 
    category: 'Food',
    quality: 'Fine Flavor Premium',
    quantity: '800 MT',
    funded: 78,
    image: '/images/commodities/cocoa-beans.png',
    htsTokenId: '0.0.123459',
    hcsTopicId: '0.0.789015'
  },
  { 
    id: 'INV-2024-005', 
    exporter: 'Vietnamese Rice Millers',
    importer: 'Dubai Food Trading LLC',
    commodity: 'Jasmine Rice',
    origin: 'Mekong Delta, Vietnam',
    destination: 'Dubai, UAE',
    faceValue: 95000, 
    pd: 0.12, // 12% probability of default
    tenor: 52, 
    risk: 'AAA', 
    category: 'Grains',
    quality: '5% Broken Premium',
    quantity: '2,500 MT',
    funded: 43,
    image: '/images/commodities/jasmine-rice.png',
    htsTokenId: '0.0.123460',
    hcsTopicId: '0.0.789016'
  },
  { 
    id: 'INV-2024-006', 
    exporter: 'Indian Spice Traders',
    importer: 'Mumbai Spice Traders',
    commodity: 'Black Pepper',
    origin: 'Kerala, India',
    destination: 'Mumbai, India',
    faceValue: 65000, 
    pd: 0.22, // 22% probability of default
    tenor: 21, 
    risk: 'A', 
    category: 'Spices',
    quality: '500 GL Premium',
    quantity: '300 MT',
    funded: 89,
    image: '/images/commodities/black-pepper.png',
    htsTokenId: '0.0.123461',
    hcsTopicId: '0.0.789017'
  },
]

const liveTrades = [
  { type: 'funded', user: '0x1a2b...c3d4', amount: 45000, invoice: 'INV-2024-001', time: '1 min ago', irr: 18.8, destination: 'Netherlands', hbarFee: 0.001 },
  { type: 'settled', user: '0x8e7f...9a0b', amount: 75000, invoice: 'INV-2024-002', time: '3 min ago', irr: 22.2, destination: 'Germany', hbarFee: 0.001 },
  { type: 'yield_paid', user: '0x9c8d...7e6f', amount: 8200, invoice: 'INV-2024-003', time: '5 min ago', irr: 19.1, destination: 'Japan', hbarFee: 0.001 },
  { type: 'funded', user: '0x5f4e...3d2c', amount: 78000, invoice: 'INV-2024-004', time: '8 min ago', irr: 24.5, destination: 'Netherlands', hbarFee: 0.001 },
  { type: 'settled', user: '0x2b1a...9c8d', amount: 95000, invoice: 'INV-2024-005', time: '12 min ago', irr: 16.9, destination: 'UAE', hbarFee: 0.001 },
  { type: 'yield_paid', user: '0x7e6f...5a4b', amount: 12500, invoice: 'INV-2024-006', time: '15 min ago', irr: 28.7, destination: 'India', hbarFee: 0.001 },
]

const portfolioData = [
  { 
    id: 'INV-2024-001', 
    commodity: 'Crude Palm Oil', 
    invested: 45000, 
    currentValue: 47500, 
    faceValue: 50000,
    pd: 0.15,
    tenor: 45,
    daysLeft: 45,
    status: 'Active',
    profitEarned: 2500,
    destination: 'Netherlands',
    htsTokenId: '0.0.123456'
  },
  { 
    id: 'INV-2024-003', 
    commodity: 'Natural Rubber RSS3', 
    invested: 89000, 
    currentValue: 94200, 
    faceValue: 120000,
    pd: 0.25,
    tenor: 60,
    daysLeft: 28,
    status: 'Active',
    profitEarned: 5200,
    destination: 'Japan',
    htsTokenId: '0.0.123458'
  },
  { 
    id: 'INV-2023-156', 
    commodity: 'Arabica Coffee Beans', 
    invested: 71000, 
    currentValue: 75000, 
    faceValue: 75000,
    pd: 0.08,
    tenor: 32,
    daysLeft: 0,
    status: 'Settled',
    profitEarned: 4000,
    destination: 'Germany',
    htsTokenId: '0.0.123457'
  },
]

const categoryData = [
  { name: 'Oils & Fats', value: 35, amount: 12500000, color: '#10B981' },
  { name: 'Spices', value: 25, amount: 9000000, color: '#F59E0B' },
  { name: 'Beverages', value: 15, amount: 5400000, color: '#3B82F6' },
  { name: 'Grains', value: 12, amount: 4320000, color: '#8B5CF6' },
  { name: 'Industrial', value: 8, amount: 2880000, color: '#EF4444' },
  { name: 'Others', value: 5, amount: 1800000, color: '#6B7280' },
]

// Dashboard component props interface
interface DashboardProps {
  accountInfo: any
  isConnected: boolean
  invoiceNFTs: any[]
  auditTrail: any[]
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
  onStakeHBAR: () => Promise<void>
  stakeAmount: number
  setStakeAmount: (amount: number) => void
}

// Update the Dashboard component's state and logic
export function Dashboard({
  accountInfo,
  isConnected,
  invoiceNFTs,
  auditTrail,
  onConnectWallet,
  onDisconnectWallet,
  onStakeHBAR,
  stakeAmount,
  setStakeAmount
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [currentTVL, setCurrentTVL] = useState(58000000)
  const [currentYield, setCurrentYield] = useState(19.3)
  const [insurancePool, setInsurancePool] = useState(116000)
  const { toast } = useToast()
  
  // Map props to local variables for compatibility
  const isWalletConnected = isConnected
  const walletBalance = accountInfo?.balance || 0
  const stakedBalance = accountInfo?.stakedBalance || 0
  
  // Mock hederaWallet object for compatibility
  const hederaWallet = {
    createInvoiceTransaction: async (data: any, metadata: any, collateral: any) => {
      // This would be handled by parent component
      return { success: true, txId: 'mock-tx-id', message: 'Transaction successful' }
    },
    releaseCollateralTransaction: async (invoiceId: any, amount: any) => {
      return { success: true, txId: 'mock-tx-id', message: 'Collateral released' }
    },
    stakeHBAR: async (amount: number) => {
      await onStakeHBAR()
      return { success: true, txId: 'mock-tx-id', message: 'HBAR staked successfully' }
    }
  }

  // Form states for Create tab
  const [exporter, setExporter] = useState('')
  const [importer, setImporter] = useState('')
  const [commodity, setCommodity] = useState('')
  const [faceValue, setFaceValue] = useState<number | ''>('')
  const [tenor, setTenor] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('')

  // AI Risk Assessment Preview states
  const [estimatedPd, setEstimatedPd] = useState<number | null>(null)
  const [discountRatePreview, setDiscountRatePreview] = useState<number | null>(null)
  const [projectedIrrPreview, setProjectedIrrPreview] = useState<number | null>(null)
  const [requiredHbarCollateral, setRequiredHbarCollateral] = useState<number | null>(null)

  // Minting status
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'calculating' | 'minting' | 'success' | 'error' | 'calculated'>('idle')
  const [mintingMessage, setMintingMessage] = useState('')

  // Collateral release states
  const [releaseInvoiceId, setReleaseInvoiceId] = useState('')
  const [releaseCollateralAmount, setReleaseCollateralAmount] = useState<number | ''>('')
  const [releaseStatus, setReleaseStatus] = useState<'idle' | 'releasing' | 'success' | 'error'>('idle')
  const [releaseMessage, setReleaseMessage] = useState('')

  // Staking states (moved to Create tab)
  const [stakingStatus, setStakingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [stakingMessage, setStakingMessage] = useState('')
  const [totalInvoiceValueForStake, setTotalInvoiceValueForStake] = useState<number | ''>('');
  const [calculatedRequiredStake, setCalculatedRequiredStake] = useState<number | null>(null);


  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTVL(prev => prev + Math.random() * 50000 - 25000)
      setCurrentYield(prev => prev + (Math.random() * 0.4 - 0.2))
      setInsurancePool(prev => prev + Math.random() * 1000 - 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Wallet connection and balance updates are handled by parent component
  useEffect(() => {
    // All wallet state is managed by parent component through props
  }, []);

  // Calculate required stake based on total invoice value
  useEffect(() => {
    if (typeof totalInvoiceValueForStake === 'number' && totalInvoiceValueForStake > 0) {
      setCalculatedRequiredStake(totalInvoiceValueForStake * 0.05); // 5% of total invoice value
    } else {
      setCalculatedRequiredStake(null);
    }
  }, [totalInvoiceValueForStake]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatHBAR = (value: number) => {
    return `${value.toFixed(6)} ℏ`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'AAA': return 'bg-app-green-200 text-app-green-700 border-app-green-300 dark:bg-app-green-900 dark:text-app-green-200 dark:border-app-green-800'
      case 'AA': return 'bg-app-green-200 text-app-green-700 border-app-green-300 dark:bg-app-green-900 dark:text-app-green-200 dark:border-app-green-800'
      case 'A': return 'bg-app-orange-200 text-app-orange-700 border-app-orange-300 dark:bg-app-orange-900 dark:text-app-orange-200 dark:border-app-orange-800'
      case 'BBB': return 'bg-app-red-200 text-app-red-700 border-app-red-300 dark:bg-app-red-900 dark:text-app-red-200 dark:border-app-red-800'
      case 'BB': return 'bg-app-red-200 text-app-red-700 border-app-red-300 dark:bg-app-red-900 dark:text-app-red-200 dark:border-app-red-800'
      default: return 'bg-app-gray-200 text-app-gray-700 border-app-gray-300 dark:bg-app-gray-700 dark:text-app-gray-200 dark:border-app-gray-600'
    }
  }

  // Example calculation for the simulation section
  const exampleFaceValue = 50000;
  const exampleTenor = 60;
  const examplePD = 0.40;
  const exampleCalc = calculateRealYield(exampleFaceValue, examplePD, exampleTenor);

  // Function to simulate AI risk scoring based on input
  const simulateAiRisk = (fv: number, t: number) => {
    // Simple mock logic: higher face value, lower tenor = lower PD
    // This is just for demonstration, real AI would be more complex
    let pd = 0.5; // Default
    if (fv > 70000 && t < 40) {
      pd = 0.1; // AAA
    } else if (fv > 50000 && t < 60) {
      pd = 0.2; // AA
    } else if (fv > 30000 && t < 75) {
      pd = 0.4; // A
    } else {
      pd = 0.6; // BBB or Speculative
    }
    return pd;
  }

  const handleCalculateYield = () => {
    if (faceValue === '' || tenor === '') {
      setMintingMessage('Please enter Face Value and Tenor to calculate yield.');
      setMintingStatus('error');
      return;
    }

    setMintingStatus('calculating');
    setMintingMessage('Calculating real yield...');

    // Simulate AI risk scoring
    const simulatedPd = simulateAiRisk(Number(faceValue), Number(tenor));
    const result = calculateRealYield(Number(faceValue), simulatedPd, Number(tenor));

    setTimeout(() => {
      setEstimatedPd(simulatedPd * 100);
      setDiscountRatePreview(result.discountRate);
      setProjectedIrrPreview(result.irr);
      setRequiredHbarCollateral(result.requiredCollateral);
      setMintingStatus('calculated');
      setMintingMessage('Yield and collateral calculated. Ready to mint!');
    }, 1000); // Simulate calculation time
  }

  const handleMintNFT = async () => {
    if (mintingStatus !== 'calculated') {
      setMintingMessage('Please calculate yield first.');
      setMintingStatus('error');
      return;
    }
    if (!exporter || !importer || !commodity || !faceValue || !tenor || !quantity) {
      setMintingMessage('Please fill all invoice details before minting.');
      setMintingStatus('error');
      return;
    }
    if (!isWalletConnected) {
      setMintingMessage('Please connect your wallet to mint invoices.');
      setMintingStatus('error');
      return;
    }
    // Check staked balance instead of wallet balance for collateral
    if (requiredHbarCollateral === null || stakedBalance < requiredHbarCollateral) {
      setMintingMessage('Insufficient STAKED HBAR balance for collateral. Please stake more HBAR.');
      setMintingStatus('error');
      return;
    }

    setMintingStatus('minting');
    setMintingMessage('Minting HTS NFT and locking collateral from stake...');

    try {
      // Simulate HTS NFT minting and HBAR collateral transfer via mock wallet service
      const mockHtsTokenId = `0.0.${Math.floor(Math.random() * 999999) + 100000}`;
      const mockHcsTopicId = `0.0.${Math.floor(Math.random() * 999999) + 100000}`;
      const mockInvoiceId = `INV-${Date.now().toString().slice(-6)}`; // Generate a mock invoice ID for tracking locked collateral

      const txResult = await hederaWallet.createInvoiceTransaction(
        {
          exporterCompany: exporter,
          importerCompany: importer,
          commodity: commodity,
          faceValue: Number(faceValue),
          tenor: Number(tenor),
          pd: estimatedPd !== null ? estimatedPd / 100 : 0, // Convert back to 0-1 range
          htsTokenId: mockHtsTokenId,
          hcsTopicId: mockHcsTopicId,
        },
        requiredHbarCollateral,
        mockInvoiceId // Pass the mock invoice ID
      );

      if (txResult.success) {
        setMintingStatus('success');
        setMintingMessage(`HTS NFT for ${commodity} (ID: ${mockHtsTokenId}) minted successfully! Collateral locked. Tx: ${txResult.txId}`);
        // Reset form
        setExporter('');
        setImporter('');
        setCommodity('');
        setFaceValue('');
        setTenor('');
        setQuantity('');
        setEstimatedPd(null);
        setDiscountRatePreview(null);
        setProjectedIrrPreview(null);
        setRequiredHbarCollateral(null);
      } else {
        throw new Error(txResult.message);
      }
    } catch (error: any) {
      setMintingStatus('error');
      setMintingMessage(`Minting failed: ${error.message || 'Unknown error'}`);
    }
  }

  const handleReleaseCollateral = async () => {
    if (!releaseInvoiceId || releaseCollateralAmount === '') {
      setReleaseMessage('Please enter Invoice ID and Collateral Amount.');
      setReleaseStatus('error');
      return;
    }
    if (!isWalletConnected) {
      setReleaseMessage('Please connect your wallet to release collateral.');
      setReleaseStatus('error');
      return;
    }

    setReleaseStatus('releasing');
    setReleaseMessage('Releasing exporter collateral...');

    try {
      const txResult = await hederaWallet.releaseCollateralTransaction(
        releaseInvoiceId,
        Number(releaseCollateralAmount)
      );

      if (txResult.success) {
        setReleaseStatus('success');
        setReleaseMessage(`Collateral for ${releaseInvoiceId} released successfully! Tx: ${txResult.txId}`);
        setReleaseInvoiceId('');
        setReleaseCollateralAmount('');
      } else {
        throw new Error(txResult.message);
      }
    } catch (error: any) {
      setReleaseStatus('error');
      setReleaseMessage(`Release failed: ${error.message || 'Unknown error'}`);
    }
  }

  // Staking function
  const handleStake = async (amountToStake: number) => {
    if (amountToStake <= 0) {
      setStakingMessage('Amount to stake must be positive.');
      setStakingStatus('error');
      return;
    }
    if (!isWalletConnected) {
      setStakingMessage('Please connect your wallet to stake HBAR.');
      setStakingStatus('error');
      return;
    }
    if (walletBalance < amountToStake) {
      setStakingMessage('Insufficient HBAR balance in wallet to stake.');
      setStakingStatus('error');
      return;
    }

    setStakingStatus('processing');
    setStakingMessage('Staking HBAR...');
    try {
      const result = await hederaWallet.stakeHBAR(amountToStake);
      if (result.success) {
        setStakingStatus('success');
        setStakingMessage(result.message);
        setTotalInvoiceValueForStake(''); // Clear input after successful stake
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setStakingStatus('error');
      setStakingMessage(`Staking failed: ${error.message || 'Unknown error'}`);
    }
  }

  // Calculate missing HBAR for collateral
  const missingHbarForCollateral = requiredHbarCollateral !== null && stakedBalance < requiredHbarCollateral
    ? requiredHbarCollateral - stakedBalance
    : 0;

  // Calculate missing HBAR for calculated required stake
  const missingHbarForCalculatedStake = calculatedRequiredStake !== null && stakedBalance < calculatedRequiredStake
    ? calculatedRequiredStake - stakedBalance
    : 0;

  return (
    <div className="min-h-screen bg-app-gray-50 text-app-gray-900 dark:bg-app-gray-950 dark:text-app-50">
      <Header showNav={false} showCreateInvoice={true} />

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-app-gray-100/80 dark:bg-app-gray-800/80 border border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Overview</TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Create</TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Market</TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Portfolio</TabsTrigger>
            <TabsTrigger value="settle" className="data-[state=active]:bg-app-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-md transition-all duration-200 text-app-gray-700 dark:text-app-gray-300 hover:text-app-green-600 dark:hover:text-app-green-400">Settle</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
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
                  <DollarSign className="h-5 w-5 text-app-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-app-gray-900 dark:text-app-gray-50">{formatCurrency(currentTVL)}</div>
                  <p className="text-xs text-app-green-500 flex items-center mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +18.5% from last month
                  </p>
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400 mt-2">Network Fee: {formatHBAR(0.001)}</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg card-hover-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Average IRR</CardTitle>
                  <TrendingUp className="h-5 w-5 text-app-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-app-gray-900 dark:text-app-gray-50">{currentYield.toFixed(1)}% p.a.</div>
                  <p className="text-xs text-app-green-500 flex items-center mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +2.3% from last week
                  </p>
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400 mt-2">Fixed margin, no compounding</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg card-hover-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Active Invoices</CardTitle>
                  <FileText className="h-5 w-5 text-app-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-app-gray-900 dark:text-app-gray-50">312</div>
                  <p className="text-xs text-app-green-500 flex items-center mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +23 this week
                  </p>
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400 mt-2">HTS NFT tokenized</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-lg card-hover-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Insurance Pool</CardTitle>
                  <Shield className="h-5 w-5 text-app-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-app-gray-900 dark:text-app-50">{formatCurrency(insurancePool)}</div>
                  <p className="text-xs text-app-blue-500 flex items-center mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    0.2% reserve fee
                  </p>
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400 mt-2">Default protection</p>
                </CardContent>
              </Card>
            </div>

            {/* Real Yield Formula Explanation */}
            <Card className="bg-gradient-to-r from-app-green-50 to-app-blue-50 dark:from-app-gray-800 dark:to-app-gray-900 border-app-green-200 dark:border-app-gray-700 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-app-gray-900 dark:text-app-gray-50 flex items-center text-xl">
                  <Calculator className="w-5 h-5 mr-2 text-app-green-600" />
                  Real Yield Formula
                </CardTitle>
                <CardDescription className="text-app-gray-700 dark:text-app-gray-300">
                  Fixed-price invoice sales - profit from price difference only
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-app-gray-900 p-5 rounded-lg border border-app-gray-200 dark:border-app-gray-700 shadow-sm">
                    <h4 className="font-semibold text-app-gray-900 dark:text-app-gray-50 mb-2 text-lg">1. Discount Rate (d)</h4>
                    <p className="text-sm text-app-gray-600 dark:text-app-gray-400 mb-3">d = d_min + (d_max - d_min) × PD</p>
                    <ul className="text-xs text-app-gray-500 dark:text-app-gray-400 space-y-1">
                      <li>• d_min = 0.6% (AAA, ≤30d)</li>
                      <li>• d_max = 8.0% (Speculative, 90d)</li>
                      <li>• PD = AI risk score (0-1)</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-app-gray-900 p-5 rounded-lg border border-app-gray-200 dark:border-app-gray-700 shadow-sm">
                    <h4 className="font-semibold text-app-gray-900 dark:text-app-gray-50 mb-2 text-lg">2. Buy Price (Pd)</h4>
                    <p className="text-sm text-app-gray-600 dark:text-app-gray-400 mb-3">Pd = Face × (1 - d - r - p)</p>
                    <ul className="text-xs text-app-gray-500 dark:text-app-gray-400 space-y-1">
                      <li>• r = 0.2% (Insurance Pool)</li>
                      <li>• p = 0.2% (Platform Fee)</li>
                      <li>• SME gets cash on day-0</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-app-gray-900 p-5 rounded-lg border border-app-gray-200 dark:border-app-gray-700 shadow-sm">
                    <h4 className="font-semibold text-app-gray-900 dark:text-app-gray-50 mb-2 text-lg">3. Investor IRR</h4>
                    <p className="text-sm text-app-gray-600 dark:text-app-gray-400 mb-3">IRR ≈ (Margin/Pd) × 365/Tenor</p>
                    <ul className="text-xs text-app-gray-500 dark:text-app-gray-400 space-y-1">
                      <li>• Margin = Face - Pd</li>
                      <li>• Fixed return, no compounding</li>
                      <li>• Transparent & auditable</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real Yield Calculation Simulation */}
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-app-gray-900 dark:text-app-gray-50 flex items-center text-xl">
                  <Calculator className="w-5 h-5 mr-2 text-app-green-600" />
                  Real Yield Calculation Simulation
                </CardTitle>
                <CardDescription className="text-app-gray-700 dark:text-app-gray-300">
                  Example: Face Value = {formatCurrency(exampleFaceValue)}, Tenor = {exampleTenor} days, PD = {(examplePD * 100).toFixed(1)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-app-gray-600 dark:text-app-gray-400">Discount Rate (d):</span>
                      <span className="font-semibold text-app-gray-900 dark:text-app-gray-50">{exampleCalc.discountRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-app-gray-600 dark:text-app-gray-400">Buy Price (Pd):</span>
                      <span className="font-semibold text-app-green-600 dark:text-app-green-400">{formatCurrency(exampleCalc.buyPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-app-gray-600 dark:text-app-gray-400">Net Cash for SME:</span>
                      <span className="font-semibold text-app-gray-900 dark:text-app-gray-50">{formatCurrency(exampleCalc.buyPrice)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-app-gray-600 dark:text-app-gray-400">Reserve Fee (0.2%):</span>
                      <span className="font-semibold text-app-gray-900 dark:text-app-gray-50">{formatCurrency(exampleCalc.reserveAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-app-600 dark:text-app-gray-400">Platform Fee (0.2%):</span>
                      <span className="font-semibold text-app-gray-900 dark:text-app-gray-50">{formatCurrency(exampleCalc.platformAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-app-gray-600 dark:text-app-gray-400">Projected Margin:</span>
                      <span className="font-semibold text-app-green-600 dark:text-app-green-400">{formatCurrency(exampleCalc.margin)}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base pt-5 border-t border-app-gray-200 dark:border-app-gray-700">
                  <div className="flex justify-between">
                    <span className="text-app-gray-600 dark:text-app-gray-400">Projected Investor IRR:</span>
                    <span className="font-bold text-app-green-600 dark:text-app-green-400 text-lg">{exampleCalc.irr.toFixed(1)}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-app-600 dark:text-app-gray-400">Equivalent Cost for SME:</span>
                    <span className="font-bold text-app-red-600 dark:text-app-red-400 text-lg">{exampleCalc.costSME.toFixed(1)}% p.a.</span>
                  </div>
                </div>
                <p className="text-xs text-app-gray-500 dark:text-app-gray-400 mt-3">
                  * Network Fee: {formatHBAR(0.001)} (not included in above calculations for simplicity)
                </p>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-app-gray-900 dark:text-app-gray-50">TVL & Insurance Pool Growth</CardTitle>
                  <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Monthly growth with 0.2% reserve accumulation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={kpiData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value, name) => [
                          name === 'tvl' ? formatCurrency(value as number) : formatCurrency(value as number), 
                          name === 'tvl' ? 'TVL' : 'Insurance Pool'
                        ]}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="tvl" 
                        stroke="hsl(var(--chart-1))" 
                        fill="url(#colorTvl)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="insurancePool" 
                        stroke="hsl(var(--chart-2))" 
                        fill="url(#colorInsurance)" 
                      />
                      <defs>
                        <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInsurance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Risk Distribution (PD-Based)</CardTitle>
                  <CardDescription className="text-app-gray-600 dark:text-app-gray-400">AI-powered probability of default scoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value) => [`${value}%`, 'Share']}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {riskDistribution.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-app-gray-700 dark:text-app-gray-300">{item.name}</span>
                        </div>
                        <span className="text-app-gray-500 dark:text-app-gray-400">{item.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-app-gray-900 dark:text-app-gray-50 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-app-green-500" />
                    Live Transaction Feed
                  </CardTitle>
                  <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Real-time HCS updates • Ultra-low fees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {liveTrades.map((trade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-app-gray-100 dark:bg-app-gray-900 rounded-lg border border-app-gray-200 dark:border-app-gray-700">
                        <div className={`w-2 h-2 rounded-full ${
                          trade.type === 'funded' ? 'bg-app-blue-500' :
                          trade.type === 'settled' ? 'bg-app-green-500' : 'bg-app-orange-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-app-gray-900 dark:text-app-gray-50 capitalize">{trade.type.replace('_', ' ')}</p>
                          <p className="text-xs text-app-gray-600 dark:text-app-gray-400">{trade.user} • {formatHBAR(0.001)} fee</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-app-gray-900 dark:text-app-gray-50">{formatCurrency(trade.amount)}</p>
                          <p className="text-xs text-app-green-500">{trade.irr.toFixed(1)}% IRR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Top Performing Invoices</CardTitle>
                  <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Highest IRR opportunities • HTS tokenized</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topInvoices.slice(0, 4).map((invoice, index) => {
                      const calc = calculateRealYield(invoice.faceValue, invoice.pd, invoice.tenor)
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-app-gray-100 dark:bg-app-gray-900 rounded-lg border border-app-gray-200 dark:border-app-gray-700">
                          <div className="flex items-center space-x-3">
                            <Image
                              src={invoice.image || "/placeholder.svg"}
                              alt={invoice.commodity}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover border border-app-gray-200 dark:border-app-gray-700"
                              unoptimized={true}
                            />
                            <div>
                              <p className="text-sm font-medium text-app-gray-900 dark:text-app-gray-50">{invoice.commodity}</p>
                              <p className="text-xs text-app-gray-600 dark:text-app-gray-400">{invoice.origin} → {invoice.destination}</p>
                              <p className="text-xs text-app-blue-600 dark:text-app-blue-400 font-mono">{invoice.htsTokenId}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm font-medium text-app-gray-900 dark:text-app-gray-50">{formatCurrency(invoice.faceValue)}</p>
                            <div className="flex items-center justify-end space-x-2">
                              <Badge className={`${getRiskColor(invoice.risk)} text-xs font-medium px-2 py-1 rounded-full`} variant="outline">
                                {invoice.risk}
                              </Badge>
                              <span className="text-xs text-app-green-500 font-semibold">{calc.irr.toFixed(1)}% IRR</span>
                            </div>
                            <p className="text-xs text-app-gray-500 dark:text-app-gray-400">PD: {(invoice.pd * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <h2 className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">Create Invoice NFT</h2>
            <p className="text-app-gray-600 dark:text-app-gray-400">Tokenize your trade receivable on Hedera • Fixed-price factoring</p>
            
            {/* HBAR Staking Section */}
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-app-gray-900 dark:text-app-gray-50 flex items-center text-xl">
                  <PiggyBank className="w-5 h-5 mr-2 text-app-green-600" />
                  Manage HBAR Collateral
                </CardTitle>
                <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                  Stake HBAR to enable invoice creation and secure the protocol.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-app-gray-700 dark:text-app-gray-300">Your Staked HBAR:</span>
                  <span className="font-bold text-app-green-600 dark:text-app-green-400">{formatHBAR(stakedBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-app-gray-700 dark:text-app-gray-300">Wallet Balance:</span>
                  <span className="font-semibold text-app-gray-900 dark:text-app-gray-50">{formatHBAR(walletBalance)}</span>
                </div>
                <p className="text-xs text-app-gray-500 dark:text-app-gray-400">
                  * 1 HBAR ≈ $0.2625 USD (approximate value)
                </p>
                {!isWalletConnected && (
                  <div className="mt-4 text-center text-sm text-app-red-600 dark:text-app-red-400">
                    Please connect your wallet to manage staking.
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="totalInvoiceValueForStake" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Total Invoice Face Value (USDC)</label>
                    <input
                      type="number"
                      id="totalInvoiceValueForStake"
                      className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                      placeholder="e.g., 100000"
                      value={totalInvoiceValueForStake}
                      onChange={(e) => setTotalInvoiceValueForStake(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  {calculatedRequiredStake !== null && (
                    <div className="bg-app-blue-50 dark:bg-app-blue-950 p-3 rounded-lg border border-app-blue-200 dark:border-app-blue-800 flex justify-between items-center">
                      <span className="text-app-blue-700 dark:text-app-blue-300 text-sm">Required HBAR to Stake (5%):</span>
                      <span className="font-bold text-app-blue-900 dark:text-app-blue-100 text-base">
                        {formatHBAR(calculatedRequiredStake)}
                      </span>
                    </div>
                  )}
                  <Button 
                    className="w-full bg-app-green-600 hover:bg-app-green-700 text-white py-2 rounded-md shadow-sm"
                    onClick={() => handleStake(calculatedRequiredStake !== null ? calculatedRequiredStake - stakedBalance : 0)}
                    disabled={
                      stakingStatus === 'processing' || 
                      calculatedRequiredStake === null || 
                      calculatedRequiredStake <= 0 || 
                      !isWalletConnected || 
                      walletBalance < (calculatedRequiredStake - stakedBalance) ||
                      stakedBalance >= calculatedRequiredStake
                    }
                  >
                    {stakingStatus === 'processing' && stakingMessage.includes('Staking') ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Staking...
                      </>
                    ) : (
                      <>
                        <HandCoins className="w-4 h-4 mr-2" />
                        {stakedBalance < (calculatedRequiredStake || 0) ? `Stake Missing ${formatHBAR(missingHbarForCalculatedStake)}` : 'Stake HBAR'}
                      </>
                    )}
                  </Button>
                </div>
                {stakingMessage && (
                  <div className={`mt-4 text-center text-sm font-medium ${
                    stakingStatus === 'success' ? 'text-app-green-600 dark:text-app-green-400' :
                    stakingStatus === 'error' ? 'text-app-red-600 dark:text-app-red-400' :
                    'text-app-gray-600 dark:text-app-gray-400'
                  }`}>
                    {stakingMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Details Form */}
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Invoice Details</CardTitle>
                <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                  All data will be stored on Hedera File Service with HCS audit trail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="exporter" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Exporter Company</label>
                    <input
                      type="text"
                      id="exporter"
                      className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                      placeholder="e.g., Global Agri Corp"
                      value={exporter}
                      onChange={(e) => setExporter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="importer" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Importer Company</label>
                    <input
                      type="text"
                      id="importer"
                      className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                      placeholder="e.g., European Trading Co."
                      value={importer}
                      onChange={(e) => setImporter(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="commodity" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Commodity</label>
                    <input
                      type="text"
                      id="commodity"
                      className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                      placeholder="e.g., Crude Palm Oil"
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="faceValue" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Face Value (USDC)</label>
                    <input
                      type="number"
                      id="faceValue"
                      className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                      placeholder="e.g., 50000"
                      value={faceValue}
                      onChange={(e) => setFaceValue(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor="tenor" className="block text-sm font-medium text-app-700 dark:text-app-gray-300 mb-1">Tenor (Days)</label>
                    <input
                      type="number"
                      id="tenor"
                      className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                      placeholder="e.g., 45"
                      value={tenor}
                      onChange={(e) => setTenor(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Quantity</label>
                    <input
                      type="text"
                      id="quantity"
                      className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                      placeholder="e.g., 1,000 MT"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-app-blue-50 dark:bg-app-blue-950 p-5 rounded-lg border border-app-blue-200 dark:border-app-blue-800">
                  <h4 className="font-semibold text-app-blue-900 dark:text-app-blue-100 mb-3 text-lg">AI Risk Assessment & Yield Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-app-blue-700 dark:text-app-blue-300">Estimated PD:</span>
                      <span className="font-mono ml-2 text-app-blue-900 dark:text-app-blue-100">
                        {estimatedPd !== null ? `${estimatedPd.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-app-blue-700 dark:text-app-blue-300">Discount Rate:</span>
                      <span className="font-mono ml-2 text-app-blue-900 dark:text-app-blue-100">
                        {discountRatePreview !== null ? `${discountRatePreview.toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-app-blue-700 dark:text-app-blue-300">Projected IRR:</span>
                      <span className="font-mono ml-2 text-app-green-600 dark:text-app-green-400">
                        {projectedIrrPreview !== null ? `${projectedIrrPreview.toFixed(1)}% p.a.` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-app-blue-600 dark:text-app-blue-400 mt-3">
                    * Final rates determined after document verification and HCS data feed
                  </p>
                </div>

                {requiredHbarCollateral !== null && (
                  <div className="bg-app-purple-50 dark:bg-app-purple-950 p-5 rounded-lg border border-app-purple-200 dark:border-app-purple-800">
                    <h4 className="font-semibold text-app-purple-900 dark:text-app-purple-100 mb-3 text-lg">Required HBAR Collateral (from Staked Balance)</h4>
                    <div className="flex items-center justify-between text-base">
                      <span className="text-app-purple-700 dark:text-app-purple-300">Amount to Lock:</span>
                      <span className="font-bold text-app-purple-900 dark:text-app-purple-100">
                        {formatHBAR(requiredHbarCollateral)}
                      </span>
                    </div>
                    <p className="text-xs text-app-purple-600 dark:text-app-purple-400 mt-3">
                      * This amount (5% of Face Value) will be locked from your staked HBAR and returned upon successful invoice settlement.
                    </p>
                    {isWalletConnected && stakedBalance < requiredHbarCollateral && (
                      <p className="text-xs text-app-red-600 dark:text-app-red-400 mt-2">
                        Insufficient STAKED HBAR balance ({formatHBAR(stakedBalance)}) to cover collateral. Please stake more HBAR using the section above.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="documents" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Upload Documents</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-app-gray-300 dark:border-app-gray-700 border-dashed rounded-md bg-app-gray-50 dark:bg-app-gray-900">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-app-gray-400 dark:text-app-gray-600" />
                      <div className="flex text-sm text-app-gray-600 dark:text-app-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-app-gray-800 rounded-md font-medium text-app-green-600 hover:text-app-green-500 dark:text-app-green-300"
                        >
                          <span>Upload invoice & certificates</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                        </label>
                      </div>
                      <p className="text-xs text-app-gray-500 dark:text-app-gray-500">Files will be stored on Hedera File Service</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button 
                    className="flex-1 bg-app-green-600 hover:bg-app-green-700 text-white py-2 rounded-md shadow-sm"
                    onClick={handleCalculateYield}
                    disabled={mintingStatus === 'calculating' || faceValue === '' || tenor === ''}
                  >
                    {mintingStatus === 'calculating' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Real Yield
                      </>
                    )}
                  </Button>
                  <Button 
                    className="flex-1 bg-app-blue-600 hover:bg-app-blue-700 text-white py-2 rounded-md shadow-sm"
                    onClick={handleMintNFT}
                    disabled={
                      (mintingStatus !== 'calculated' && mintingStatus !== 'minting') || 
                      mintingStatus === 'minting' || 
                      !isWalletConnected || 
                      requiredHbarCollateral === null ||
                      stakedBalance < (requiredHbarCollateral || 0) // Disable if insufficient STAKED HBAR
                    }
                  >
                    {mintingStatus === 'minting' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Mint HTS NFT
                      </>
                    )}
                  </Button>
                </div>
                {mintingMessage && (
                  <div className={`mt-4 text-center text-sm font-medium ${
                    mintingStatus === 'success' ? 'text-app-green-600 dark:text-app-green-400' :
                    mintingStatus === 'error' ? 'text-app-red-600 dark:text-app-red-400' :
                    'text-app-gray-600 dark:text-app-gray-400'
                  }`}>
                    {mintingMessage}
                  </div>
                )}
                {!isWalletConnected && (
                  <div className="mt-4 text-center text-sm text-app-red-600 dark:text-app-red-400">
                    Please connect your wallet to mint invoices.
                  </div>
                )}
                {isWalletConnected && requiredHbarCollateral !== null && mintingStatus === 'calculated' && stakedBalance >= requiredHbarCollateral && (
                  <div className="mt-2 text-center text-sm text-app-purple-600 dark:text-app-purple-400">
                    Your STAKED balance is {formatHBAR(stakedBalance)}. Ready to mint!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">Invoice Marketplace</h2>
                <p className="text-app-gray-600 dark:text-app-gray-400">HTS NFT tokenized trade receivables • Fixed-price</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-app-gray-300 dark:border-app-gray-700 text-app-gray-800 dark:text-app-gray-200 hover:bg-app-gray-100 dark:hover:bg-app-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Risk
                </Button>
                <Button className="bg-app-green-600 hover:bg-app-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  List Invoice
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topInvoices.map((invoice, index) => {
                const calc = calculateRealYield(invoice.faceValue, invoice.pd, invoice.tenor)
                return (
                  <Card key={index} className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl overflow-hidden card-hover-effect">
                    <div className="relative h-48">
                      <Image
                        src={invoice.image || "/placeholder.svg"}
                        alt={invoice.commodity}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${getRiskColor(invoice.risk)} text-xs font-medium px-2 py-1 rounded-full`} variant="outline">
                          {invoice.risk}
                        </Badge>
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-app-blue-100 text-app-blue-700 dark:bg-app-blue-900 dark:text-app-blue-200 text-xs font-mono px-2 py-1 rounded-full">
                          {invoice.htsTokenId}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg text-app-gray-900 dark:text-app-gray-50">{invoice.commodity}</CardTitle>
                      <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Truck className="w-3 h-3 text-app-gray-500" />
                            <span className="text-xs">{invoice.origin} → {invoice.destination}</span>
                          </div>
                          <div className="text-xs text-app-gray-500 dark:text-app-gray-400">
                            {invoice.exporter} → {invoice.importer}
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-app-gray-600 dark:text-app-gray-400">Face Value</span>
                          <p className="font-semibold text-app-gray-900 dark:text-app-gray-50">{formatCurrency(invoice.faceValue)}</p>
                        </div>
                        <div>
                          <span className="text-app-gray-600 dark:text-app-gray-400">Buy Price</span>
                          <p className="font-semibold text-app-green-600 dark:text-app-green-400">{formatCurrency(calc.buyPrice)}</p>
                        </div>
                        <div>
                          <span className="text-app-600 dark:text-app-gray-400">Projected IRR</span>
                          <p className="font-semibold text-app-green-600 dark:text-app-green-400">{calc.irr.toFixed(1)}% p.a.</p>
                        </div>
                        <div>
                          <span className="text-app-gray-600 dark:text-app-gray-400">Tenor</span>
                          <p className="font-semibold text-app-gray-900 dark:text-app-gray-50">{invoice.tenor} days</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-app-gray-600 dark:text-app-gray-400">Funded</span>
                          <span className="text-app-gray-900 dark:text-app-gray-50">{invoice.funded}%</span>
                        </div>
                        <Progress value={invoice.funded} className="h-2 bg-app-gray-200 dark:bg-app-gray-700 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-app-green-500" />
                      </div>

                      <div className="text-xs text-app-gray-500 dark:text-app-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Reserve Fee (0.2%):</span>
                          <span>{formatCurrency(calc.reserveAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee (0.2%):</span>
                          <span>{formatCurrency(calc.platformAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Network Fee:</span>
                          <span>{formatHBAR(0.001)}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-app-green-600 hover:bg-app-green-700 text-white py-2 rounded-md shadow-sm" disabled={!isWalletConnected}>
                        {isWalletConnected ? `Fund Invoice • ${formatCurrency(calc.buyPrice)}` : 'Connect Wallet to Fund'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">Your Portfolio</h2>
                <p className="text-app-gray-600 dark:text-app-gray-400">HTS NFT positions • Fixed returns, transparent fees</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl card-hover-effect">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Total Invested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">
                    {formatCurrency(portfolioData.reduce((sum, item) => sum + item.invested, 0))}
                  </div>
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Across {portfolioData.length} positions</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl card-hover-effect">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Current Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">
                    {formatCurrency(portfolioData.reduce((sum, item) => sum + item.currentValue, 0))}
                  </div>
                  <p className="text-xs text-app-green-500 dark:text-app-green-400">
                    +{(((portfolioData.reduce((sum, item) => sum + item.currentValue, 0) / portfolioData.reduce((sum, item) => sum + item.invested, 0)) - 1) * 100).toFixed(1)}% unrealized
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl card-hover-effect">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Realized Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-app-green-600">
                    {formatCurrency(portfolioData.filter(item => item.status === 'Settled').reduce((sum, item) => sum + item.profitEarned, 0))}
                  </div>
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400">From settled invoices</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl card-hover-effect">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-app-gray-600 dark:text-app-gray-400">Avg. IRR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-app-gray-900 dark:text-app-gray-50">
                    {(portfolioData.reduce((sum, item) => {
                      const calc = calculateRealYield(item.faceValue, item.pd, item.tenor)
                      return sum + calc.irr
                    }, 0) / portfolioData.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-app-gray-500 dark:text-app-gray-400">Weighted average</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-app-gray-900 dark:text-app-gray-50">Active Positions</CardTitle>
                <CardDescription className="text-app-gray-600 dark:text-app-gray-400">Your HTS NFT tokenized invoice investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-app-gray-200 dark:divide-app-gray-700">
                    <thead className="bg-app-gray-50 dark:bg-app-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 dark:text-app-gray-400 uppercase tracking-wider">
                          Invoice / Token ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 dark:text-app-gray-400 uppercase tracking-wider">
                          Invested / Face Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 dark:text-app-gray-400 uppercase tracking-wider">
                          Current Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 dark:text-app-gray-400 uppercase tracking-wider">
                          IRR / Days Left
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-app-gray-500 dark:text-app-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-app-gray-800 divide-y divide-app-gray-200 dark:divide-app-gray-700">
                      {portfolioData.map((item) => {
                        const calc = calculateRealYield(item.faceValue, item.pd, item.tenor)
                        return (
                          <tr key={item.id} className="hover:bg-app-gray-50 dark:hover:bg-app-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-app-gray-900 dark:text-app-gray-50">{item.commodity}</div>
                              <div className="text-xs text-app-gray-500 dark:text-app-gray-400">{item.id}</div>
                              <div className="text-xs text-app-blue-600 dark:text-app-blue-400 font-mono">{item.htsTokenId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-app-gray-900 dark:text-app-gray-50">{formatCurrency(item.invested)}</div>
                              <div className="text-xs text-app-gray-500 dark:text-app-gray-400">Face: {formatCurrency(item.faceValue)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-app-gray-900 dark:text-app-gray-50">{formatCurrency(item.currentValue)}</div>
                              <div className="text-xs text-app-green-600 dark:text-app-green-400">
                                +{formatCurrency(item.currentValue - item.invested)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-app-green-600 dark:text-app-green-400">{calc.irr.toFixed(1)}% p.a.</div>
                              <div className="text-xs text-app-gray-500 dark:text-app-gray-400">
                                {item.daysLeft > 0 ? `${item.daysLeft} days left` : 'Settled'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={item.status === 'Active' ? 'bg-app-blue-100 text-app-blue-700 dark:bg-app-blue-900 dark:text-app-blue-200' : 'bg-app-green-100 text-app-green-700 dark:bg-app-green-900 dark:text-app-green-200'}>
                                {item.status}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settle" className="space-y-6">
            <div className="text-center py-12 bg-gradient-to-br from-app-green-50 to-app-blue-50 dark:from-app-gray-800 dark:to-app-gray-900 rounded-xl shadow-md">
              <Shield className="w-16 h-16 text-app-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-app-gray-900 dark:text-app-gray-50 mb-2">Settlement & Payout</h3>
              <p className="text-app-gray-600 dark:text-app-gray-400 mb-8">
                Automated settlement via Hedera smart contracts • Transparent yield distribution
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-base">
                <div className="bg-app-green-50 dark:bg-app-green-950 p-5 rounded-lg border border-app-green-200 dark:border-app-green-800 shadow-sm">
                  <h4 className="font-semibold text-app-green-900 dark:text-app-green-100 mb-2">Auto Settlement</h4>
                  <p className="text-app-green-700 dark:text-app-green-300">Smart contracts automatically distribute payments when invoices mature</p>
                </div>
                <div className="bg-app-blue-50 dark:bg-app-blue-950 p-5 rounded-lg border border-app-blue-200 dark:border-app-blue-800 shadow-sm">
                  <h4 className="font-semibold text-app-blue-900 dark:text-app-blue-100 mb-2">HCS Audit Trail</h4>
                  <p className="text-app-blue-700 dark:text-app-blue-300">All settlements recorded on Hedera Consensus Service for transparency</p>
                </div>
                <div className="bg-app-purple-50 dark:bg-app-purple-950 p-5 rounded-lg border border-app-purple-200 dark:border-app-purple-800 shadow-sm">
                  <h4 className="font-semibold text-app-purple-900 dark:text-app-purple-100 mb-2">Insurance Protection</h4>
                  <p className="text-app-purple-700 dark:text-app-purple-300">0.2% reserve fund protects against defaults</p>
                </div>
              </div>
            </div>

            {/* Release Exporter Collateral Section */}
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-app-gray-900 dark:text-app-gray-50 flex items-center text-xl">
                  <Coins className="w-5 h-5 mr-2 text-app-purple-600" />
                  Release Exporter Collateral
                </CardTitle>
                <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                  For platform admins: Release HBAR collateral for settled invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="releaseInvoiceId" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Invoice ID</label>
                  <input
                    type="text"
                    id="releaseInvoiceId"
                    className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                    placeholder="e.g., INV-2024-001"
                    value={releaseInvoiceId}
                    onChange={(e) => setReleaseInvoiceId(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="releaseCollateralAmount" className="block text-sm font-medium text-app-gray-700 dark:text-app-gray-300 mb-1">Collateral Amount (HBAR)</label>
                  <input
                    type="number"
                    id="releaseCollateralAmount"
                    className="mt-1 block w-full border border-app-gray-300 dark:border-app-gray-700 bg-app-gray-50 dark:bg-app-gray-900 rounded-md shadow-sm py-2 px-3 text-app-gray-900 dark:text-app-50 focus:ring-app-green-500 focus:border-app-green-500 sm:text-sm"
                    placeholder="e.g., 2500"
                    value={releaseCollateralAmount}
                    onChange={(e) => setReleaseCollateralAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <Button 
                  className="w-full bg-app-purple-600 hover:bg-app-purple-700 text-white py-2 rounded-md shadow-sm"
                  onClick={handleReleaseCollateral}
                  disabled={
                    releaseStatus === 'releasing' || 
                    !releaseInvoiceId || 
                    releaseCollateralAmount === '' || 
                    !isWalletConnected
                  }
                >
                  {releaseStatus === 'releasing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Releasing...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Release Collateral
                    </>
                  )}
                </Button>
                {releaseMessage && (
                  <div className={`mt-4 text-center text-sm font-medium ${
                    releaseStatus === 'success' ? 'text-app-green-600 dark:text-app-green-400' :
                    releaseStatus === 'error' ? 'text-app-red-600 dark:text-app-red-400' :
                    'text-app-gray-600 dark:text-app-gray-400'
                  }`}>
                    {releaseMessage}
                  </div>
                )}
                {!isWalletConnected && (
                  <div className="mt-4 text-center text-sm text-app-red-600 dark:text-app-red-400">
                    Please connect your wallet to release collateral.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
