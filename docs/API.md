# Real Yield Hedera API Documentation

## Overview

This document provides comprehensive API documentation for the Real Yield Hedera platform, including Hedera service integrations, smart contract interactions, and frontend components.

## Table of Contents

- [Hedera Services](#hedera-services)
  - [HTS (Token Service)](#hts-token-service)
  - [HCS (Consensus Service)](#hcs-consensus-service)
  - [HFS (File Service)](#hfs-file-service)
  - [Mirror Node](#mirror-node)
- [Wallet Integration](#wallet-integration)
- [Smart Contracts](#smart-contracts)
- [Frontend Components](#frontend-components)
- [Error Handling](#error-handling)

## Hedera Services

### HTS (Token Service)

The Hedera Token Service integration for invoice tokenization and NFT management.

#### `HederaTokenService`

**Location:** `lib/hts.ts`

##### Methods

###### `createInvoiceToken(invoiceData, initialSupply?)`

Creates a new invoice token (NFT) representing a factored invoice.

**Parameters:**
- `invoiceData` (object): Invoice metadata
  - `invoiceId` (string): Unique invoice identifier
  - `exporter` (string): Exporter company name
  - `importer` (string): Importer company name
  - `commodity` (string): Commodity type
  - `faceValue` (number): Invoice face value in USD
  - `tenor` (number): Payment term in days
  - `region` (string): Geographic region
  - `riskScore` (number): Risk assessment score (0-1000)
- `initialSupply` (number, optional): Initial token supply (default: 1,000,000)

**Returns:** `Promise<InvoiceToken>`

**Example:**
```typescript
const invoiceToken = await htsService.createInvoiceToken({
  invoiceId: 'INV-2024-001',
  exporter: 'Global Exports Ltd',
  importer: 'Import Solutions Inc',
  commodity: 'Electronics',
  faceValue: 100000,
  tenor: 90,
  region: 'Asia-Pacific',
  riskScore: 750
}, 1000000);
```

###### `transferTokens(tokenId, fromAccountId, toAccountId, amount, fromAccountKey)`

Transfers tokens between accounts.

**Parameters:**
- `tokenId` (string): Token ID to transfer
- `fromAccountId` (string): Sender account ID
- `toAccountId` (string): Recipient account ID
- `amount` (number): Amount to transfer
- `fromAccountKey` (PrivateKey): Sender's private key

**Returns:** `Promise<string | null>` - Transaction ID or null if failed

###### `getAccountPortfolio(accountId)`

Retrieves complete portfolio for an account.

**Parameters:**
- `accountId` (string): Account ID to query

**Returns:** `Promise<TokenPortfolio>`

**TokenPortfolio Interface:**
```typescript
interface TokenPortfolio {
  accountId: string;
  tokens: {
    tokenId: string;
    balance: number;
    value: number;
    metadata: TokenMetadata;
  }[];
  totalValue: number;
  totalTokens: number;
}
```

### HCS (Consensus Service)

Hedera Consensus Service for immutable audit trails and event logging.

#### `HederaConsensusService`

**Location:** `lib/hcs.ts`

##### Methods

###### `createTopic(memo?)`

Creates a new consensus topic.

**Parameters:**
- `memo` (string, optional): Topic description

**Returns:** `Promise<string>` - Topic ID

###### `submitMessage(topicId, message)`

Submits a message to a consensus topic.

**Parameters:**
- `topicId` (string): Target topic ID
- `message` (string | object): Message content

**Returns:** `Promise<string>` - Transaction ID

**Example:**
```typescript
// Log invoice creation
const auditMessage = {
  event: 'INVOICE_CREATED',
  invoiceId: 'INV-2024-001',
  timestamp: Date.now(),
  exporter: '0.0.123456',
  faceValue: 100000,
  tenor: 90
};

const txId = await hcsService.submitMessage(
  '0.0.789012',
  JSON.stringify(auditMessage)
);
```

###### `getTopicMessages(topicId, limit?)`

Retrieves messages from a topic.

**Parameters:**
- `topicId` (string): Topic ID to query
- `limit` (number, optional): Maximum messages to retrieve

**Returns:** `Promise<ConsensusMessage[]>`

### HFS (File Service)

Hedera File Service for secure document storage.

#### `HederaFileService`

**Location:** `lib/hfs.ts`

##### Methods

###### `uploadFile(fileContent, memo?)`

Uploads a file to Hedera File Service.

**Parameters:**
- `fileContent` (Uint8Array): File content as bytes
- `memo` (string, optional): File description

**Returns:** `Promise<string>` - File ID

###### `getFileContents(fileId)`

Retrieves file contents.

**Parameters:**
- `fileId` (string): File ID to retrieve

**Returns:** `Promise<Uint8Array>` - File content

### Mirror Node

Hedera Mirror Node API integration for real-time data and analytics.

#### `MirrorNodeService`

**Location:** `lib/mirror-node.ts`

##### Methods

###### `getAccountInfo(accountId)`

Retrieves account information.

**Parameters:**
- `accountId` (string): Account ID to query

**Returns:** `Promise<AccountInfo>`

###### `getTransactionHistory(accountId, limit?)`

Retrieves transaction history for an account.

**Parameters:**
- `accountId` (string): Account ID
- `limit` (number, optional): Maximum transactions to retrieve

**Returns:** `Promise<Transaction[]>`

###### `getTokenInfo(tokenId)`

Retrieves token information.

**Parameters:**
- `tokenId` (string): Token ID to query

**Returns:** `Promise<TokenInfo>`

## Wallet Integration

### `WalletService`

**Location:** `lib/wallet-integration.ts`

Multi-wallet integration supporting HashPack, Blade, Kabila, MetaMask, and Private Key connections.

#### Methods

###### `connectWallet(walletType, options?)`

Connects to a specified wallet.

**Parameters:**
- `walletType` (WalletType): 'hashpack' | 'blade' | 'kabila' | 'metamask-hedera' | 'private-key'
- `options` (object, optional): Wallet-specific options

**Returns:** `Promise<WalletConnection>`

**Example:**
```typescript
// Connect to HashPack
const connection = await walletService.connectWallet('hashpack');

// Connect with private key
const connection = await walletService.connectWallet('private-key', {
  privateKey: 'your-private-key-here'
});
```

###### `getAccountBalance()`

Retrieves current account balance.

**Returns:** `Promise<WalletBalance>`

**WalletBalance Interface:**
```typescript
interface WalletBalance {
  hbar: number;
  tokens: {
    tokenId: string;
    symbol: string;
    balance: number;
    decimals: number;
  }[];
}
```

###### `transferHBAR(toAccountId, amount, memo?)`

Transfers HBAR to another account.

**Parameters:**
- `toAccountId` (string): Recipient account ID
- `amount` (number): Amount in HBAR
- `memo` (string, optional): Transaction memo

**Returns:** `Promise<TransactionResult>`

## Smart Contracts

### RealYieldInvoiceFactoring

**Location:** `contracts/RealYieldInvoiceFactoring.sol`

Main smart contract for invoice factoring logic.

#### Functions

###### `createInvoice(faceValue, tenor, riskScore, metadata)`

Creates a new invoice for factoring.

**Parameters:**
- `faceValue` (uint256): Invoice face value in wei
- `tenor` (uint256): Payment term in days
- `riskScore` (uint256): Risk score (0-1000)
- `metadata` (string): IPFS hash or metadata string

**Payable:** Yes (requires collateral)

###### `investInInvoice(invoiceId)`

Invests in an existing invoice.

**Parameters:**
- `invoiceId` (uint256): Invoice ID to invest in

**Payable:** Yes (investment amount)

###### `settleInvoice(invoiceId)`

Settles a matured invoice (owner only).

**Parameters:**
- `invoiceId` (uint256): Invoice ID to settle

###### `claimReturns(invoiceId)`

Claims returns from a settled invoice.

**Parameters:**
- `invoiceId` (uint256): Invoice ID to claim from

### InsurancePool

**Location:** `contracts/InsurancePool.sol`

Insurance pool contract for risk protection.

#### Functions

###### `deposit()`

Deposits HBAR into the insurance pool.

**Payable:** Yes

###### `claimInsurance(invoiceId, amount)`

Claims insurance for a defaulted invoice.

**Parameters:**
- `invoiceId` (uint256): Defaulted invoice ID
- `amount` (uint256): Claim amount

## Frontend Components

### Dashboard Components

#### `CreateTab`

**Location:** `components/dashboard/create-tab.tsx`

Invoice creation interface with AI risk assessment.

**Props:** None

**Features:**
- Invoice form with validation
- AI-powered risk scoring
- HBAR collateral calculation
- Document upload integration

#### `MarketplaceTab`

**Location:** `components/dashboard/marketplace-tab.tsx`

Invoice marketplace for browsing and purchasing tokens.

**Props:** None

**Features:**
- Invoice filtering and search
- Real-time pricing
- Purchase functionality
- Market analytics

#### `PortfolioTab`

**Location:** `components/dashboard/portfolio-tab.tsx`

User portfolio management interface.

**Props:** None

**Features:**
- Investment overview
- Performance tracking
- Asset allocation charts
- Transaction history

### Wallet Components

#### `WalletConnect`

**Location:** `components/wallet/wallet-connect.tsx`

Wallet connection interface.

**Props:**
- `onConnect` (function): Callback when wallet connects
- `onDisconnect` (function): Callback when wallet disconnects

## Error Handling

### Error Types

#### `HederaError`

Base error class for Hedera-related errors.

```typescript
class HederaError extends Error {
  code: string;
  details?: any;
}
```

#### `WalletError`

Wallet connection and transaction errors.

```typescript
class WalletError extends Error {
  walletType: WalletType;
  originalError?: Error;
}
```

#### `ContractError`

Smart contract interaction errors.

```typescript
class ContractError extends Error {
  contractAddress: string;
  method: string;
  transactionId?: string;
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `WALLET_NOT_CONNECTED` | Wallet not connected |
| `INSUFFICIENT_BALANCE` | Insufficient HBAR balance |
| `TRANSACTION_FAILED` | Transaction execution failed |
| `INVALID_ACCOUNT_ID` | Invalid Hedera account ID |
| `NETWORK_ERROR` | Network connectivity issue |
| `CONTRACT_REVERT` | Smart contract reverted |
| `INVALID_SIGNATURE` | Invalid transaction signature |

### Error Handling Best Practices

1. **Always wrap async calls in try-catch blocks**
2. **Provide user-friendly error messages**
3. **Log detailed errors for debugging**
4. **Implement retry logic for network errors**
5. **Validate inputs before API calls**

**Example:**
```typescript
try {
  const result = await walletService.transferHBAR(
    '0.0.123456',
    100,
    'Invoice payment'
  );
  
  if (result.success) {
    console.log('Transfer successful:', result.transactionId);
  } else {
    throw new Error(result.error);
  }
} catch (error) {
  if (error instanceof WalletError) {
    console.error('Wallet error:', error.message);
    // Show user-friendly message
  } else {
    console.error('Unexpected error:', error);
    // Log for debugging
  }
}
```

## Rate Limits

### Hedera Network Limits

- **Transactions per second:** 10,000 TPS
- **Mirror Node API:** 100 requests/second
- **File uploads:** 1MB max file size
- **HCS messages:** 1024 bytes max

### Best Practices

1. **Implement request queuing for high-volume operations**
2. **Cache Mirror Node responses when appropriate**
3. **Use batch operations when available**
4. **Monitor rate limit headers**

## Testing

### Unit Tests

Run unit tests for individual components:

```bash
npm run test
```

### Integration Tests

Test Hedera service integrations:

```bash
npm run test:integration
```

### Smart Contract Tests

Test smart contract functionality:

```bash
npm run test:contracts
```

## Support

For API support and questions:

- **Documentation:** [GitHub Wiki](https://github.com/your-repo/wiki)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Discord:** [Community Server](https://discord.gg/your-server)
- **Email:** developers@realyieldhedera.com