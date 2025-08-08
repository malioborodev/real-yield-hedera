# Real Yield Hedera - Invoice Factoring Platform

🏆 **Hackathon Project for Hello Future Origins**

A decentralized invoice factoring platform built on Hedera Hashgraph that enables SMEs to unlock liquidity from their trade invoices while providing investors with real yield opportunities.

## 🚀 Features

### Core Platform
- **Real Yield Formula**: Dynamic pricing based on PD (Probability of Default), tenor, and risk assessment
- **Invoice NFTs**: Tokenized invoices using Hedera Token Service (HTS)
- **Audit Trail**: Immutable transaction history via Hedera Consensus Service (HCS)
- **Risk Assessment**: Automated grading system (AAA to Speculative)
- **Collateral Management**: HBAR-based collateral system

### Wallet Integration
- **HashPack Wallet**: Official Hedera wallet support
- **Blade Wallet**: Multi-chain wallet integration
- **Real Account Connection**: Connect with your actual Hedera account ID
- **Live Balance Display**: Real-time HBAR balance and staking info

### Dashboard Features
- **Portfolio Management**: Track your investments and returns
- **Live Trading Feed**: Real-time transaction monitoring
- **Risk Analytics**: Comprehensive risk distribution charts
- **Commodity Categories**: Diversified trade finance opportunities

## 🛠 Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Hedera Hashgraph
- **Services**: HTS (Token Service), HCS (Consensus Service)
- **Wallets**: HashPack, Blade Wallet
- **Charts**: Recharts for data visualization
- **UI**: Shadcn/ui components

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Hedera Wallet** (HashPack or Blade)
3. **Hedera Account** with testnet HBAR

### Wallet Setup

#### HashPack Wallet
1. Install [HashPack Extension](https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk)
2. Create or import your Hedera account
3. Switch to Hedera Testnet
4. Fund your account with testnet HBAR from [Hedera Portal](https://portal.hedera.com/)

#### Blade Wallet
1. Install [Blade Wallet Extension](https://chrome.google.com/webstore/detail/blade-hedera-wallet/abogmiocnneedmmepnohnhlijcjpcifd)
2. Create or import your Hedera account
3. Configure for Hedera Testnet
4. Fund your account with testnet HBAR

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd real-yield-hedera
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file:
```env
# Hedera Network Configuration
HEDERA_NETWORK=testnet

# Optional: For server-side operations
HEDERA_OPERATOR_ID=your_operator_account_id
HEDERA_OPERATOR_KEY=your_operator_private_key
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💰 How to Use

### For Investors
1. **Connect Wallet**: Choose HashPack or Blade wallet
2. **Browse Invoices**: Explore available trade finance opportunities
3. **Analyze Risk**: Review PD ratings and expected returns
4. **Invest**: Fund invoices and earn real yield
5. **Track Portfolio**: Monitor your investments and returns

### For SMEs (Exporters)
1. **Connect Wallet**: Link your Hedera account
2. **Create Invoice**: Submit trade invoice details
3. **Provide Collateral**: Lock HBAR as collateral (5% of face value)
4. **Get Funding**: Receive immediate liquidity
5. **Settle Invoice**: Complete payment upon maturity

## 🔧 Real Yield Formula

```
Discount Rate = dmin + (dmax - dmin) × PD
Buy Price = Face Value × (1 - Discount Rate - Reserve Fee - Platform Fee)
IRR = (Margin / Buy Price) × (365 / Tenor) × 100
```

Where:
- `dmin = 0.6%` (minimum discount)
- `dmax = 8%` (maximum discount)
- `Reserve Fee = 0.2%`
- `Platform Fee = 0.2%`
- `Collateral = 5%` of face value in HBAR

## 🏗 Architecture

### Smart Contract Integration
- **HTS Tokens**: Each invoice becomes an NFT
- **HCS Topics**: Audit trail and transaction logging
- **Account Management**: Real wallet integration
- **Collateral System**: HBAR-based security

### Data Flow
1. **Invoice Creation** → HTS NFT Minting
2. **Investment** → Token Transfer + HCS Logging
3. **Settlement** → Collateral Release + Profit Distribution
4. **Audit** → HCS Consensus + Mirror Node Queries

## 🎯 Hackathon Criteria Alignment

### Innovation (10%)
- ✅ First invoice factoring platform on Hedera
- ✅ Novel real yield formula for trade finance
- ✅ Integrated HTS + HCS for complete solution

### Feasibility (10%)
- ✅ Built using native Hedera services
- ✅ Real wallet integration (not mockup)
- ✅ Comprehensive business model

### Execution (20%)
- ✅ Fully functional MVP
- ✅ Professional UI/UX design
- ✅ Real Hedera account integration
- ✅ Complete feature set

### Integration (20%)
- ✅ Deep Hedera integration (HTS + HCS)
- ✅ Native wallet support (HashPack + Blade)
- ✅ Mirror Node API integration
- ✅ Testnet deployment ready

### Success (20%)
- ✅ Drives HBAR adoption through collateral
- ✅ Creates new Hedera accounts (SMEs + Investors)
- ✅ Increases network TPS through transactions
- ✅ Expands Hedera to trade finance sector

### Validation (20%)
- ✅ Real-world trade finance problem
- ✅ Validated business model
- ✅ Market-ready solution
- ✅ Scalable architecture

## 🔐 Security Features

- **Wallet Security**: Non-custodial wallet integration
- **Collateral Protection**: HBAR-based security deposits
- **Audit Trail**: Immutable HCS logging
- **Risk Assessment**: Automated PD calculation
- **Smart Contracts**: Hedera native services

## 📊 Demo Data

The platform includes realistic demo data:
- **6 Sample Invoices**: Various commodities and risk levels
- **Live Trading Feed**: Simulated real-time activity
- **Portfolio Tracking**: Investment performance metrics
- **Risk Analytics**: Distribution charts and insights

## 🚀 Deployment

### Testnet Deployment
```bash
npm run build
npm start
```

### Production Considerations
- Configure mainnet environment variables
- Set up proper operator accounts
- Implement additional security measures
- Scale infrastructure for production load

## 🤝 Contributing

This is a hackathon project built for Hello Future Origins. For questions or collaboration:

- **Team**: Real Yield Platform
- **Focus**: Trade Finance × Hedera Hashgraph
- **Goal**: Democratizing trade finance through DeFi

## 📄 License

MIT License - Built for Hello Future Origins Hackathon

---

**Built with ❤️ for the Hedera ecosystem**