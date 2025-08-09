# NFT Contracts Deployment Guide

## Overview

This project includes four different NFT contract implementations:

1. **MyToken** - Basic ERC-721 implementation
2. **MyTokenAdvanced** - Advanced ERC-721 with access control and pausable functionality
3. **MyTokenUpgradeable** - Upgradeable ERC-721 using UUPS proxy pattern
4. **HederaNFT** - Hedera Token Service (HTS) integration

## Prerequisites

1. Node.js and npm installed
2. Hardhat development environment
3. Hedera testnet account with HBAR balance (for testnet deployment)

## Local Deployment (Hardhat Network)

### Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to local hardhat network
npx hardhat run scripts/deploy-nft.js --network hardhat
```

### Expected Output

Successful deployment will show:
- Contract addresses for all 4 NFT contracts
- Transaction hashes
- Test minting operations
- Token balance verification
- Deployment summary saved to `deployments/` folder

## Hedera Testnet Deployment

### 1. Configure Environment

Create or update `.env` file with your Hedera credentials:

```bash
# Copy example file
cp .env.example .env
```

Update `.env` with your actual values:

```env
# Hedera Network Configuration
HEDERA_PRIVATE_KEY=your_actual_hedera_private_key_here
HEDERA_ACCOUNT_ID=0.0.your_account_id
NEXT_PUBLIC_HEDERA_NETWORK=testnet
```

### 2. Get Hedera Testnet Credentials

1. Visit [Hedera Portal](https://portal.hedera.com/)
2. Create a testnet account
3. Fund your account with test HBAR from the faucet
4. Copy your private key and account ID

### 3. Deploy to Testnet

```bash
# Deploy to Hedera testnet
npx hardhat run scripts/deploy-nft.js --network hederaTestnet
```

## Contract Details

### MyToken (Basic ERC-721)
- **Constructor**: `constructor(address initialOwner)`
- **Features**: Basic minting, burning, ownership
- **Mint Function**: `safeMint(address to)` - no URI required

### MyTokenAdvanced (Advanced ERC-721)
- **Constructor**: `constructor(address defaultAdmin, address pauser, address minter)`
- **Features**: Role-based access control, pausable, URI storage
- **Mint Function**: `safeMint(address to, string memory uri)` - URI required
- **Roles**: DEFAULT_ADMIN_ROLE, PAUSER_ROLE, MINTER_ROLE

### MyTokenUpgradeable (Upgradeable ERC-721)
- **Initialization**: `initialize(address initialOwner)`
- **Features**: UUPS upgradeable proxy pattern
- **Mint Function**: `safeMint(address to)` - no URI required
- **Upgrade**: Only owner can authorize upgrades

### HederaNFT (Hedera Token Service)
- **Constructor**: No parameters required
- **Features**: Integration with Hedera Token Service
- **Special**: Uses HTS for native Hedera token operations

## Deployment Script Features

1. **Automatic Parameter Detection**: Script automatically provides correct constructor parameters
2. **Test Minting**: Performs test mints to verify functionality
3. **Balance Verification**: Checks token balances after minting
4. **Deployment Logging**: Saves deployment info to JSON file
5. **Error Handling**: Comprehensive error handling and reporting

## Troubleshooting

### Common Issues

1. **"Invalid account" Error**
   - Ensure HEDERA_PRIVATE_KEY is correctly set in .env
   - Private key should be 64 characters (32 bytes) hex string

2. **"Insufficient Balance" Error**
   - Fund your Hedera testnet account with HBAR
   - Visit Hedera testnet faucet

3. **"Contract Compilation Failed"**
   - Run `npx hardhat clean`
   - Run `npx hardhat compile`

4. **"Network Connection Failed"**
   - Check internet connection
   - Verify Hedera testnet RPC endpoint is accessible

### Verification

After successful deployment, you can:

1. View contracts on [HashScan Testnet](https://hashscan.io/testnet/)
2. Check deployment files in `deployments/` folder
3. Use contract addresses for frontend integration

## Next Steps

1. **Frontend Integration**: Use deployed contract addresses in your dApp
2. **Contract Verification**: Verify contracts on HashScan for transparency
3. **Mainnet Deployment**: Follow same process with mainnet credentials

## Security Notes

- Never commit private keys to version control
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet deployment
- Consider multi-signature wallets for production deployments