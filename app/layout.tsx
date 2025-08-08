import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Real Yield - Trade Invoice Funding on Hedera ',
  description: 'Unlock $ 2 Trillion Real World Borderless Liquidity into Blockchain powered by Hedera Hashgraph. Fixed-price sales, transparent fees, and real yield from actual settlements.'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
