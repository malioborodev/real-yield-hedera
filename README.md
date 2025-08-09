# Real Yield Hedera 🚀

> Unlock $2 Trillion Realworld Liquidity into Blockchain powered by Hedera Hashgraph

A comprehensive decentralized invoice factoring platform built on Hedera Hashgraph, enabling businesses to unlock liquidity from their outstanding invoices while providing investors with real-world yield opportunities. The platform tokenizes real-world invoices into tradeable NFTs, providing transparent pricing, immutable audit trails, and real yield from actual settlements.

## 🌟 Features

### Core Functionality
- **Invoice Tokenization**: Convert invoices into NFTs using Hedera Token Service (HTS)
- **Decentralized Marketplace**: Trade invoice tokens with transparent pricing
- **Risk Assessment**: AI-powered risk scoring and insurance pool protection
- **Real-time Analytics**: Live data via Hedera Mirror Node APIs
- **Immutable Audit**: Tamper-proof logging with Hedera Consensus Service (HCS)
- **Multi-wallet Support**: HashPack, Blade, Kabila, MetaMask, and Private Key

### Hedera Integration
- **HTS (Token Service)**: Invoice NFT creation and management
- **HCS (Consensus Service)**: Audit trails and event logging
- **HFS (File Service)**: Secure document storage
- **Mirror Node**: Real-time data and analytics
- **Smart Contracts**: On-chain factoring and insurance logic

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Blockchain**: Hedera Hashgraph (Testnet/Mainnet)
- **Smart Contracts**: Solidity
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: React Hooks, Context API
- **Styling**: Tailwind CSS, CSS Modules

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Hedera Testnet Account ([Portal](https://portal.hedera.com/))
- Supported Wallet (HashPack recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/real-yield-hedera.git
   cd real-yield-hedera
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Hedera credentials:
   ```env
   NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
real-yield-hedera/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   ├── ui/              # Reusable UI components
│   └── wallet/          # Wallet integration components
├── contracts/            # Solidity smart contracts
│   ├── RealYieldInvoiceFactoring.sol
│   └── InsurancePool.sol
├── lib/                  # Core libraries
│   ├── hts.ts           # Hedera Token Service
│   ├── hcs.ts           # Hedera Consensus Service
│   ├── hfs.ts           # Hedera File Service
│   ├── mirror-node.ts   # Mirror Node API
│   └── wallet-integration.ts # Wallet management
└── hooks/               # Custom React hooks
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_HEDERA_NETWORK` | Network (testnet/mainnet) | ✅ |
| `NEXT_PUBLIC_HEDERA_ACCOUNT_ID` | Your Hedera Account ID | ✅ |
| `HEDERA_PRIVATE_KEY` | Your Private Key | ✅ |
| `NEXT_PUBLIC_MIRROR_NODE_URL` | Mirror Node API URL | ✅ |

### Wallet Setup

1. **HashPack** (Recommended)
   - Install [HashPack Extension](https://www.hashpack.app/)
   - Create/Import Hedera account
   - Fund with HBAR for transactions

2. **Other Wallets**
   - Blade Wallet, Kabila, MetaMask (with Hedera support)
   - Private Key connection for development

## 📊 Dashboard Features

### Overview Tab
- Platform KPIs (TVL, Average Yield, Active Invoices)
- Performance charts and risk distribution
- Live trades and top performing invoices

### Create Tab
- Invoice tokenization form
- AI risk assessment
- HBAR collateral calculation
- Document upload (HFS integration)

### Marketplace Tab
- Browse available invoice tokens
- Filter by region, commodity, IRR, tenor
- Purchase tokens with HBAR

### Portfolio Tab
- Personal investment overview
- Active and completed investments
- Performance tracking

### Settle Tab
- Matured invoice management
- Settlement processing
- Return claims

## 🔐 Security

- **Private Key Management**: Never commit private keys
- **Environment Variables**: Use `.env.local` for sensitive data
- **Smart Contract Audits**: Contracts should be audited before mainnet
- **Input Validation**: All user inputs are validated
- **Error Handling**: Comprehensive error boundaries

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Testnet Deployment

1. **Smart Contracts**
   ```bash
   npm run deploy:testnet
   ```

2. **Frontend**
   ```bash
   npm run build
   npm run start
   ```

### Production Deployment

1. **Environment Setup**
   - Update environment variables for mainnet
   - Configure production database
   - Set up monitoring and logging

2. **Deploy to Vercel/Netlify**
   ```bash
   npm run build
   # Deploy to your preferred platform
   ```

## 📚 API Reference

### Hedera Services

- **HTS Service**: Token creation, minting, trading
- **HCS Service**: Message submission, topic management
- **HFS Service**: File upload, retrieval
- **Mirror Node**: Transaction queries, analytics

### Wallet Integration

- **Multi-wallet Support**: HashPack, Blade, Kabila, MetaMask
- **Connection Management**: Connect, disconnect, status
- **Transaction Handling**: HBAR transfers, token operations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/real-yield-hedera/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/real-yield-hedera/issues)
- **Discord**: [Community Server](https://discord.gg/your-server)
- **Email**: support@realyieldhedera.com

## 🙏 Acknowledgments

- [Hedera Hashgraph](https://hedera.com/) for the robust DLT platform
- [HashPack](https://www.hashpack.app/) for wallet integration
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Next.js](https://nextjs.org/) for the amazing React framework

---

**Built with ❤️ on Hedera Hashgraph**

*Unlocking real-world liquidity through blockchain innovation*