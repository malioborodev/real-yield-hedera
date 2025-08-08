// Shared data and utility functions for dashboard components

// Enhanced mock data with Real Yield Formula
export const kpiData = [
  { name: 'Jan', tvl: 24000000, yield: 12.2, volume: 12000000, contracts: 145, settlements: 132, insurancePool: 48000 },
  { name: 'Feb', tvl: 28000000, yield: 13.5, volume: 14000000, contracts: 167, settlements: 154, insurancePool: 56000 },
  { name: 'Mar', tvl: 32000000, yield: 14.8, volume: 16000000, contracts: 189, settlements: 176, insurancePool: 64000 },
  { name: 'Apr', tvl: 36000000, yield: 15.1, volume: 18000000, contracts: 212, settlements: 198, insurancePool: 72000 },
  { name: 'May', tvl: 42000000, yield: 16.4, volume: 21000000, contracts: 234, settlements: 221, insurancePool: 84000 },
  { name: 'Jun', tvl: 48000000, yield: 17.7, volume: 24000000, contracts: 267, settlements: 245, insurancePool: 96000 },
  { name: 'Jul', tvl: 52000000, yield: 18.1, volume: 26500000, contracts: 289, settlements: 267, insurancePool: 104000 },
  { name: 'Aug', tvl: 58000000, yield: 19.3, volume: 29000000, contracts: 312, settlements: 289, insurancePool: 116000 },
]

export const riskDistribution = [
  { name: 'AAA Grade (PD: 0-0.1)', value: 35, color: '#10B981', description: 'dmin: 0.6% | Tenor ≤30d' },
  { name: 'AA Grade (PD: 0.1-0.3)', value: 30, color: '#059669', description: 'Discount: 0.6-2.8%' },
  { name: 'A Grade (PD: 0.3-0.5)', value: 20, color: '#F59E0B', description: 'Discount: 2.8-4.4%' },
  { name: 'BBB Grade (PD: 0.5-0.7)', value: 10, color: '#EF4444', description: 'Discount: 4.4-6.0%' },
  { name: 'Speculative (PD: 0.7-1.0)', value: 5, color: '#DC2626', description: 'dmax: 8% | Tenor 90d' },
]

// Real Yield Formula Implementation
export const calculateRealYield = (faceValue: number, pd: number, tenor: number) => {
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
  const requiredCollateral = faceValue * exporterCollateralPercentage;

  return {
    discountRate: discountRate * 100,
    buyPrice,
    margin,
    irr,
    costSME,
    reserveAmount: faceValue * reserveFee,
    platformAmount: faceValue * platformFee,
    requiredCollateral
  }
}

export const topInvoices = [
  { 
    id: 'INV-2024-001', 
    exporter: 'Singapore Agri Corp',
    importer: 'Rotterdam Trading BV',
    commodity: 'Crude Palm Oil',
    origin: 'Singapore',
    destination: 'Rotterdam, Netherlands',
    faceValue: 50000, 
    pd: 0.15,
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
    pd: 0.08,
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
    pd: 0.25,
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
    pd: 0.18,
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
    pd: 0.12,
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
    pd: 0.22,
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

export const liveTrades = [
  { type: 'funded', user: '0x1a2b...c3d4', amount: 45000, invoice: 'INV-2024-001', time: '1 min ago', irr: 18.8, destination: 'Netherlands', hbarFee: 0.001 },
  { type: 'settled', user: '0x8e7f...9a0b', amount: 75000, invoice: 'INV-2024-002', time: '3 min ago', irr: 22.2, destination: 'Germany', hbarFee: 0.001 },
  { type: 'yield_paid', user: '0x9c8d...7e6f', amount: 8200, invoice: 'INV-2024-003', time: '5 min ago', irr: 19.1, destination: 'Japan', hbarFee: 0.001 },
  { type: 'funded', user: '0x5f4e...3d2c', amount: 78000, invoice: 'INV-2024-004', time: '8 min ago', irr: 24.5, destination: 'Netherlands', hbarFee: 0.001 },
  { type: 'settled', user: '0x2b1a...9c8d', amount: 95000, invoice: 'INV-2024-005', time: '12 min ago', irr: 16.9, destination: 'UAE', hbarFee: 0.001 },
  { type: 'yield_paid', user: '0x7e6f...5a4b', amount: 12500, invoice: 'INV-2024-006', time: '15 min ago', irr: 28.7, destination: 'India', hbarFee: 0.001 },
]

export const portfolioData = [
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

export const categoryData = [
  { name: 'Oils & Fats', value: 35, amount: 12500000, color: '#10B981' },
  { name: 'Spices', value: 25, amount: 9000000, color: '#F59E0B' },
  { name: 'Beverages', value: 15, amount: 5400000, color: '#3B82F6' },
  { name: 'Grains', value: 12, amount: 4320000, color: '#8B5CF6' },
  { name: 'Industrial', value: 8, amount: 2880000, color: '#EF4444' },
  { name: 'Others', value: 5, amount: 1800000, color: '#6B7280' },
]

// Utility functions
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatHBAR = (value: number) => {
  return `${value.toFixed(6)} ℏ`
}

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'AAA': return 'bg-app-green-200 text-app-green-700 border-app-green-300 dark:bg-app-green-900 dark:text-app-green-200 dark:border-app-green-800'
    case 'AA': return 'bg-app-green-200 text-app-green-700 border-app-green-300 dark:bg-app-green-900 dark:text-app-green-200 dark:border-app-green-800'
    case 'A': return 'bg-app-orange-200 text-app-orange-700 border-app-orange-300 dark:bg-app-orange-900 dark:text-app-orange-200 dark:border-app-orange-800'
    case 'BBB': return 'bg-app-red-200 text-app-red-700 border-app-red-300 dark:bg-app-red-900 dark:text-app-red-200 dark:border-app-red-800'
    case 'BB': return 'bg-app-red-200 text-app-red-700 border-app-red-300 dark:bg-app-red-900 dark:text-app-red-200 dark:border-app-red-800'
    default: return 'bg-app-gray-200 text-app-gray-700 border-app-gray-300 dark:bg-app-gray-700 dark:text-app-gray-200 dark:border-app-gray-600'
  }
}

// Function to simulate AI risk scoring based on input
export const simulateAiRisk = (fv: number, t: number) => {
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