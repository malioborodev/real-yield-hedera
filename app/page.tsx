'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, CheckCircle, DollarSign, Globe, Handshake, Lightbulb, Shield, TrendingUp, Zap } from 'lucide-react'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Separator } from '@/components/ui/separator'
import { hederaWallet } from '@/lib/hedera-wallet-mock'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkWalletStatus = () => {
      setIsConnected(hederaWallet.isConnected())
    }
    checkWalletStatus()
    const unsubscribe = hederaWallet.subscribe(checkWalletStatus)
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-app-gray-50 text-app-gray-900 dark:bg-app-gray-950 dark:text-app-50">
      <Header showNav={true} showCreateInvoice={false} />

      <main className="container mx-auto px-4 py-12 space-y-20">
        {/* Hero Section */}
        <section id="hero" className="text-center py-16 md:py-24 lg:py-32 bg-gradient-to-br from-app-green-50 to-app-blue-50 dark:from-app-gray-800 dark:to-app-gray-900 rounded-3xl shadow-xl">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-app-gray-900 dark:text-app-gray-50 leading-tight mb-6">
              DeFi x RWA : The Game Changer
            </h1>
            <p className="text-lg md:text-xl text-app-gray-600 dark:text-app-gray-300 mb-10 max-w-2xl mx-auto">
              Unlock $ 2 Trillion Real World Borderless Liquidity into Blockchain Fixed-price sales, transparent fees, and real yield from actual settlements.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild className="bg-app-green-600 hover:bg-app-green-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                <Link href="/dashboard">Launch App <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" className="border-app-green-600 text-app-green-600 hover:bg-app-green-50 dark:border-app-green-400 dark:text-app-green-400 dark:hover:bg-app-green-900/20 text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="bg-app-red-100 text-app-red-700 border-app-red-200 dark:bg-app-red-900 dark:text-app-red-200 text-sm px-3 py-1 rounded-full">
              The Problem
            </Badge>
            <h2 className="text-4xl font-bold text-app-gray-900 dark:text-app-gray-50 leading-tight">
              Bridging the $1.7 Trillion Global Trade Finance Gap
            </h2>
            <p className="text-lg text-app-gray-600 dark:text-app-gray-300">
              Small and Medium Enterprises (SMEs) worldwide face immense challenges in accessing working capital due to traditional, inefficient trade finance systems. This leads to a massive funding gap, hindering growth and innovation.
            </p>
            <ul className="space-y-3 text-app-gray-700 dark:text-app-gray-300">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-app-red-500 mr-2 flex-shrink-0" />
                Complex, slow, and costly traditional processes.
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-app-red-500 mr-2 flex-shrink-0" />
                Lack of transparency and high counterparty risk.
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-app-red-500 mr-2 flex-shrink-0" />
                Limited access to capital for SMEs, especially in emerging markets.
              </li>
            </ul>
          </div>
          <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/world-financial-gap.png"
              alt="Global Financial Gap Chart"
              fill
              className="object-cover"
              unoptimized={true}
            />
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-xl order-2 lg:order-1">
            <Image
              src="/global-commodity-growth.png"
              alt="Global Commodity Growth Chart"
              fill
              className="object-cover"
              unoptimized={true}
            />
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <Badge variant="outline" className="bg-app-green-100 text-app-green-700 border-app-green-200 dark:bg-app-green-900 dark:text-app-green-200 text-sm px-3 py-1 rounded-full">
              The Solution
            </Badge>
            <h2 className="text-4xl font-bold text-app-gray-900 dark:text-app-gray-50 leading-tight">
              Real-Yield: Decentralizing Trade Finance with Hedera
            </h2>
            <p className="text-lg text-app-gray-600 dark:text-app-gray-300">
              Real-Yield leverages Hedera Hashgraph to create a transparent, efficient, and accessible invoice factoring marketplace. We tokenize trade receivables as Hedera Token Service (HTS) NFTs, enabling global investors to fund invoices and earn real yield.
            </p>
            <ul className="space-y-3 text-app-gray-700 dark:text-app-gray-300">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-app-green-500 mr-2 flex-shrink-0" />
                Instant liquidity for SMEs through fixed-price invoice sales.
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-app-green-500 mr-2 flex-shrink-0" />
                Transparent and auditable transactions on Hedera Consensus Service (HCS).
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-app-green-500 mr-2 flex-shrink-0" />
                Real yield for investors, directly from invoice settlements.
              </li>
            </ul>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="text-center space-y-10">
          <Badge variant="outline" className="bg-app-blue-100 text-app-blue-700 border-app-blue-200 dark:bg-app-blue-900 dark:text-app-blue-200 text-sm px-3 py-1 rounded-full">
            How It Works
          </Badge>
          <h2 className="text-4xl font-bold text-app-gray-900 dark:text-app-gray-50 leading-tight">
            A Seamless Process for Exporters & Investors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-lg rounded-xl p-6 space-y-4 card-hover-effect">
              <div className="bg-app-green-100 dark:bg-app-green-900 p-3 rounded-full inline-flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-app-green-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-app-gray-900 dark:text-app-gray-50">1. Invoice Submission</CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Exporters submit their invoices, which are then tokenized as unique HTS NFTs on Hedera.
              </CardDescription>
            </Card>
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-lg rounded-xl p-6 space-y-4 card-hover-effect">
              <div className="bg-app-blue-100 dark:bg-app-blue-900 p-3 rounded-full inline-flex items-center justify-center">
                <Handshake className="w-8 h-8 text-app-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-app-gray-900 dark:text-app-gray-50">2. Investor Funding</CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Investors browse the marketplace, assess risk with AI-powered scores, and fund invoices at a fixed discount.
              </CardDescription>
            </Card>
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-lg rounded-xl p-6 space-y-4 card-hover-effect">
              <div className="bg-app-purple-100 dark:bg-app-purple-900 p-3 rounded-full inline-flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-app-purple-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-app-gray-900 dark:text-app-gray-50">3. Automated Settlement</CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Upon maturity, smart contracts automate settlement, distributing principal and yield directly to investors.
              </CardDescription>
            </Card>
          </div>
        </section>

        {/* Technology Section */}
        <section id="technology" className="text-center space-y-10">
          <Badge variant="outline" className="bg-app-green-100 text-app-green-700 border-app-green-200 dark:bg-app-green-900 dark:text-app-green-200 text-sm px-3 py-1 rounded-full">
            Technology
          </Badge>
          <h2 className="text-4xl font-bold text-app-gray-900 dark:text-app-gray-50 leading-tight">
            Powered by Hedera Hashgraph
          </h2>
          <p className="text-lg text-app-gray-600 dark:text-app-gray-300 max-w-3xl mx-auto">
            Real-Yield leverages Hedera's unique architecture for unparalleled speed, security, and low, predictable fees.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-lg rounded-xl p-6 space-y-4 card-hover-effect">
              <div className="bg-app-blue-100 dark:bg-app-blue-900 p-3 rounded-full inline-flex items-center justify-center">
                <Zap className="w-8 h-8 text-app-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-app-gray-900 dark:text-app-gray-50">Hedera Consensus Service (HCS)</CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Provides an immutable, auditable log for all invoice and settlement data.
              </CardDescription>
            </Card>
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-lg rounded-xl p-6 space-y-4 card-hover-effect">
              <div className="bg-app-green-100 dark:bg-app-green-900 p-3 rounded-full inline-flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-app-green-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-app-gray-900 dark:text-app-gray-50">Hedera Token Service (HTS)</CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Enables native tokenization of invoices as NFTs for efficient trading.
              </CardDescription>
            </Card>
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-lg rounded-xl p-6 space-y-4 card-hover-effect">
              <div className="bg-app-purple-100 dark:bg-app-purple-900 p-3 rounded-full inline-flex items-center justify-center">
                <Shield className="w-8 h-8 text-app-purple-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-app-gray-900 dark:text-app-gray-50">Smart Contracts</CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Automate funding, collateral management, and settlement logic securely.
              </CardDescription>
            </Card>
            <Card className="bg-white dark:bg-app-gray-800 border-app-gray-200 dark:border-app-gray-700 shadow-lg rounded-xl p-6 space-y-4 card-hover-effect">
              <div className="bg-app-orange-100 dark:bg-app-orange-900 p-3 rounded-full inline-flex items-center justify-center">
                <Globe className="w-8 h-8 text-app-orange-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-app-gray-900 dark:text-app-gray-50">Low, Predictable Fees</CardTitle>
              <CardDescription className="text-app-gray-600 dark:text-app-gray-400">
                Hedera's fixed, low transaction fees ensure cost-effectiveness for all participants.
              </CardDescription>
            </Card>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="cta" className="text-center py-16 bg-gradient-to-br from-app-green-500 to-app-blue-600 text-white rounded-3xl shadow-xl space-y-6">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Ready to Transform Trade Finance?
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Join Real-Yield today and become part of the future of global trade. Whether you're an exporter seeking capital or an investor looking for real yield, we've got you covered.
          </p>
          <Button asChild className="bg-white text-app-green-600 hover:bg-app-gray-100 text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
            <Link href="/dashboard">Launch App <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-app-gray-600 dark:text-app-gray-400">
        <Separator className="my-8 bg-app-gray-200 dark:bg-app-gray-700" />
        <p>&copy; {new Date().getFullYear()} RealYield. All rights reserved.</p>
        <p className="text-sm mt-2">
          Built with ❤️ on <a href="https://hedera.com/" target="_blank" rel="noopener noreferrer" className="text-app-green-600 hover:underline">Hedera Hashgraph</a>
        </p>
      </footer>
    </div>
  )
}
