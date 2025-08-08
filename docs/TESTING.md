# Testing Guide

## Overview

This guide covers comprehensive testing strategies for the Real Yield Hedera application, including unit tests, integration tests, smart contract tests, and end-to-end testing.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Setup & Configuration](#setup--configuration)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Smart Contract Testing](#smart-contract-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Test Data Management](#test-data-management)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Testing Strategy

### Testing Pyramid

```
    /\     E2E Tests (Few)
   /  \    - User workflows
  /____\   - Critical paths
 
  /______\  Integration Tests (Some)
 /        \ - API endpoints
/__________\- Service interactions

/____________\ Unit Tests (Many)
              - Individual functions
              - Component logic
              - Utility functions
```

### Test Coverage Goals

- **Unit Tests:** 90%+ coverage
- **Integration Tests:** Critical paths covered
- **Smart Contracts:** 100% function coverage
- **E2E Tests:** Main user journeys

## Setup & Configuration

### Test Environment Setup

```bash
# Install test dependencies
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest \
  supertest \
  playwright \
  @playwright/test
```

### Jest Configuration

**jest.config.js:**

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1'
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

module.exports = createJestConfig(customJestConfig);
```

**jest.setup.js:**

```javascript
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Hedera SDK
jest.mock('@hashgraph/sdk', () => ({
  Client: {
    forTestnet: jest.fn(() => ({
      setOperator: jest.fn(),
      close: jest.fn()
    })),
    forMainnet: jest.fn(() => ({
      setOperator: jest.fn(),
      close: jest.fn()
    }))
  },
  PrivateKey: {
    fromString: jest.fn(() => ({
      publicKey: {
        toStringDer: jest.fn(() => 'mock-public-key')
      }
    }))
  },
  AccountId: {
    fromString: jest.fn()
  },
  TokenCreateTransaction: jest.fn(),
  TokenAssociateTransaction: jest.fn(),
  TransferTransaction: jest.fn()
}));

// Mock environment variables
process.env.HEDERA_NETWORK = 'testnet';
process.env.HEDERA_ACCOUNT_ID = '0.0.123456';
process.env.HEDERA_PRIVATE_KEY = 'mock-private-key';

// Global test utilities
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

### Test Environment Variables

**.env.test:**

```env
# Test Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_PUBLIC_KEY=302a300506032b6570032100...

# Test Mirror Node
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# Test Contract Addresses
REAL_YIELD_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
INSURANCE_POOL_CONTRACT_ADDRESS=0x0987654321098765432109876543210987654321

# Test Topic IDs
AUDIT_TOPIC_ID=0.0.789012
TRANSACTION_TOPIC_ID=0.0.789013

# Application
NEXT_PUBLIC_APP_ENV=test
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Unit Testing

### Component Testing

**Example: WalletConnect Component**

```typescript
// __tests__/components/wallet/wallet-connect.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletConnect } from '@/components/wallet/wallet-connect';
import { WalletProvider } from '@/contexts/wallet-context';

const MockWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const mockValue = {
    isConnected: false,
    accountId: null,
    balance: null,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    loading: false,
    error: null
  };
  
  return (
    <WalletProvider value={mockValue}>
      {children}
    </WalletProvider>
  );
};

describe('WalletConnect', () => {
  const mockOnConnect = jest.fn();
  const mockOnDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders wallet connection options', () => {
    render(
      <MockWalletProvider>
        <WalletConnect 
          onConnect={mockOnConnect} 
          onDisconnect={mockOnDisconnect} 
        />
      </MockWalletProvider>
    );

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    expect(screen.getByText('HashPack')).toBeInTheDocument();
    expect(screen.getByText('Blade Wallet')).toBeInTheDocument();
    expect(screen.getByText('Kabila Wallet')).toBeInTheDocument();
  });

  it('calls connectWallet when HashPack is clicked', async () => {
    const mockConnectWallet = jest.fn();
    
    render(
      <WalletProvider value={{ 
        ...mockValue, 
        connectWallet: mockConnectWallet 
      }}>
        <WalletConnect 
          onConnect={mockOnConnect} 
          onDisconnect={mockOnDisconnect} 
        />
      </WalletProvider>
    );

    fireEvent.click(screen.getByText('HashPack'));
    
    await waitFor(() => {
      expect(mockConnectWallet).toHaveBeenCalledWith('hashpack');
    });
  });

  it('displays error message when connection fails', () => {
    render(
      <WalletProvider value={{ 
        ...mockValue, 
        error: 'Connection failed' 
      }}>
        <WalletConnect 
          onConnect={mockOnConnect} 
          onDisconnect={mockOnDisconnect} 
        />
      </WalletProvider>
    );

    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });
});
```

### Service Testing

**Example: HederaTokenService**

```typescript
// __tests__/lib/hts.test.ts
import { HederaTokenService } from '@/lib/hts';
import { Client, PrivateKey } from '@hashgraph/sdk';

jest.mock('@hashgraph/sdk');

describe('HederaTokenService', () => {
  let htsService: HederaTokenService;
  let mockClient: jest.Mocked<Client>;

  beforeEach(() => {
    mockClient = {
      setOperator: jest.fn(),
      close: jest.fn()
    } as any;
    
    (Client.forTestnet as jest.Mock).mockReturnValue(mockClient);
    
    htsService = new HederaTokenService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvoiceToken', () => {
    it('creates token with correct parameters', async () => {
      const invoiceData = {
        invoiceId: 'INV-001',
        exporter: 'Test Exporter',
        importer: 'Test Importer',
        commodity: 'Electronics',
        faceValue: 100000,
        tenor: 90,
        region: 'Asia-Pacific',
        riskScore: 750
      };

      const mockTokenId = '0.0.123456';
      const mockExecute = jest.fn().mockResolvedValue({
        getReceipt: jest.fn().mockResolvedValue({
          tokenId: mockTokenId
        })
      });

      // Mock TokenCreateTransaction
      const mockTokenCreateTransaction = {
        setTokenName: jest.fn().mockReturnThis(),
        setTokenSymbol: jest.fn().mockReturnThis(),
        setTokenType: jest.fn().mockReturnThis(),
        setDecimals: jest.fn().mockReturnThis(),
        setInitialSupply: jest.fn().mockReturnThis(),
        setTreasuryAccountId: jest.fn().mockReturnThis(),
        setAdminKey: jest.fn().mockReturnThis(),
        setSupplyKey: jest.fn().mockReturnThis(),
        setTokenMemo: jest.fn().mockReturnThis(),
        freezeWith: jest.fn().mockReturnThis(),
        sign: jest.fn().mockReturnThis(),
        execute: mockExecute
      };

      require('@hashgraph/sdk').TokenCreateTransaction.mockImplementation(
        () => mockTokenCreateTransaction
      );

      const result = await htsService.createInvoiceToken(invoiceData);

      expect(mockTokenCreateTransaction.setTokenName)
        .toHaveBeenCalledWith('Invoice Token INV-001');
      expect(mockTokenCreateTransaction.setTokenSymbol)
        .toHaveBeenCalledWith('RYINV');
      expect(result.tokenId).toBe(mockTokenId);
    });

    it('throws error when token creation fails', async () => {
      const invoiceData = {
        invoiceId: 'INV-001',
        exporter: 'Test Exporter',
        importer: 'Test Importer',
        commodity: 'Electronics',
        faceValue: 100000,
        tenor: 90,
        region: 'Asia-Pacific',
        riskScore: 750
      };

      const mockExecute = jest.fn().mockRejectedValue(
        new Error('Transaction failed')
      );

      const mockTokenCreateTransaction = {
        setTokenName: jest.fn().mockReturnThis(),
        setTokenSymbol: jest.fn().mockReturnThis(),
        setTokenType: jest.fn().mockReturnThis(),
        setDecimals: jest.fn().mockReturnThis(),
        setInitialSupply: jest.fn().mockReturnThis(),
        setTreasuryAccountId: jest.fn().mockReturnThis(),
        setAdminKey: jest.fn().mockReturnThis(),
        setSupplyKey: jest.fn().mockReturnThis(),
        setTokenMemo: jest.fn().mockReturnThis(),
        freezeWith: jest.fn().mockReturnThis(),
        sign: jest.fn().mockReturnThis(),
        execute: mockExecute
      };

      require('@hashgraph/sdk').TokenCreateTransaction.mockImplementation(
        () => mockTokenCreateTransaction
      );

      await expect(htsService.createInvoiceToken(invoiceData))
        .rejects.toThrow('Transaction failed');
    });
  });
});
```

### Utility Testing

**Example: Risk Assessment Utilities**

```typescript
// __tests__/utils/risk-assessment.test.ts
import { 
  calculateRiskScore, 
  getRiskCategory, 
  calculateDiscountRate 
} from '@/utils/risk-assessment';

describe('Risk Assessment Utils', () => {
  describe('calculateRiskScore', () => {
    it('calculates risk score correctly for low-risk invoice', () => {
      const invoiceData = {
        tenor: 30,
        faceValue: 50000,
        region: 'North America',
        commodity: 'Technology',
        exporterRating: 'AAA',
        importerRating: 'AA'
      };

      const riskScore = calculateRiskScore(invoiceData);
      
      expect(riskScore).toBeGreaterThanOrEqual(0);
      expect(riskScore).toBeLessThanOrEqual(1000);
      expect(riskScore).toBeLessThan(300); // Low risk
    });

    it('calculates risk score correctly for high-risk invoice', () => {
      const invoiceData = {
        tenor: 180,
        faceValue: 1000000,
        region: 'Africa',
        commodity: 'Raw Materials',
        exporterRating: 'B',
        importerRating: 'CCC'
      };

      const riskScore = calculateRiskScore(invoiceData);
      
      expect(riskScore).toBeGreaterThan(700); // High risk
      expect(riskScore).toBeLessThanOrEqual(1000);
    });
  });

  describe('getRiskCategory', () => {
    it('returns correct risk categories', () => {
      expect(getRiskCategory(200)).toBe('Low');
      expect(getRiskCategory(500)).toBe('Medium');
      expect(getRiskCategory(800)).toBe('High');
    });
  });

  describe('calculateDiscountRate', () => {
    it('calculates discount rate based on risk score', () => {
      expect(calculateDiscountRate(200, 30)).toBeCloseTo(0.02, 2);
      expect(calculateDiscountRate(500, 60)).toBeCloseTo(0.05, 2);
      expect(calculateDiscountRate(800, 90)).toBeCloseTo(0.12, 2);
    });
  });
});
```

## Integration Testing

### API Route Testing

**Example: Invoice API**

```typescript
// __tests__/api/invoices.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/invoices';
import { HederaTokenService } from '@/lib/hts';

jest.mock('@/lib/hts');

describe('/api/invoices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates invoice successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        exporter: 'Test Exporter',
        importer: 'Test Importer',
        commodity: 'Electronics',
        faceValue: 100000,
        tenor: 90,
        region: 'Asia-Pacific'
      }
    });

    const mockCreateInvoiceToken = jest.fn().mockResolvedValue({
      tokenId: '0.0.123456',
      transactionId: '0.0.123456@1234567890.123456789'
    });

    (HederaTokenService as jest.Mock).mockImplementation(() => ({
      createInvoiceToken: mockCreateInvoiceToken
    }));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: true,
      tokenId: '0.0.123456'
    });
  });

  it('returns 400 for invalid input', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        // Missing required fields
        exporter: 'Test Exporter'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: false,
      error: expect.stringContaining('validation')
    });
  });

  it('handles service errors gracefully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        exporter: 'Test Exporter',
        importer: 'Test Importer',
        commodity: 'Electronics',
        faceValue: 100000,
        tenor: 90,
        region: 'Asia-Pacific'
      }
    });

    const mockCreateInvoiceToken = jest.fn().mockRejectedValue(
      new Error('Hedera service unavailable')
    );

    (HederaTokenService as jest.Mock).mockImplementation(() => ({
      createInvoiceToken: mockCreateInvoiceToken
    }));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: false,
      error: 'Internal server error'
    });
  });
});
```

### Database Integration Testing

```typescript
// __tests__/integration/database.test.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Reset test database
  execSync('npx prisma migrate reset --force --skip-seed', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Database Integration', () => {
  it('creates and retrieves invoice records', async () => {
    const invoiceData = {
      invoiceId: 'INV-TEST-001',
      tokenId: '0.0.123456',
      exporter: 'Test Exporter',
      importer: 'Test Importer',
      faceValue: 100000,
      tenor: 90,
      riskScore: 750,
      status: 'ACTIVE'
    };

    // Create invoice
    const created = await prisma.invoice.create({
      data: invoiceData
    });

    expect(created.id).toBeDefined();
    expect(created.invoiceId).toBe(invoiceData.invoiceId);

    // Retrieve invoice
    const retrieved = await prisma.invoice.findUnique({
      where: { invoiceId: invoiceData.invoiceId }
    });

    expect(retrieved).toMatchObject(invoiceData);
  });
});
```

## Smart Contract Testing

### Hardhat Test Configuration

**hardhat.config.js (test section):**

```javascript
module.exports = {
  // ... other config
  mocha: {
    timeout: 60000
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  }
};
```

### Contract Unit Tests

**test/RealYieldInvoiceFactoring.test.js:**

```javascript
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('RealYieldInvoiceFactoring', function () {
  let realYield, insurancePool;
  let owner, exporter, investor, addr1;
  
  beforeEach(async function () {
    [owner, exporter, investor, addr1] = await ethers.getSigners();
    
    // Deploy InsurancePool
    const InsurancePool = await ethers.getContractFactory('InsurancePool');
    insurancePool = await InsurancePool.deploy();
    await insurancePool.deployed();
    
    // Deploy RealYieldInvoiceFactoring
    const RealYield = await ethers.getContractFactory('RealYieldInvoiceFactoring');
    realYield = await RealYield.deploy(insurancePool.address);
    await realYield.deployed();
    
    // Set factoring contract in insurance pool
    await insurancePool.setFactoringContract(realYield.address);
  });

  describe('Invoice Creation', function () {
    it('Should create invoice with correct parameters', async function () {
      const faceValue = ethers.utils.parseEther('100');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash';
      const collateral = ethers.utils.parseEther('10');

      await expect(
        realYield.connect(exporter).createInvoice(
          faceValue,
          tenor,
          riskScore,
          metadata,
          { value: collateral }
        )
      ).to.emit(realYield, 'InvoiceCreated')
        .withArgs(1, exporter.address, faceValue, tenor, riskScore);

      const invoice = await realYield.invoices(1);
      expect(invoice.owner).to.equal(exporter.address);
      expect(invoice.faceValue).to.equal(faceValue);
      expect(invoice.tenor).to.equal(tenor);
      expect(invoice.riskScore).to.equal(riskScore);
      expect(invoice.status).to.equal(0); // ACTIVE
    });

    it('Should require minimum collateral', async function () {
      const faceValue = ethers.utils.parseEther('100');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash';
      const insufficientCollateral = ethers.utils.parseEther('1');

      await expect(
        realYield.connect(exporter).createInvoice(
          faceValue,
          tenor,
          riskScore,
          metadata,
          { value: insufficientCollateral }
        )
      ).to.be.revertedWith('Insufficient collateral');
    });

    it('Should reject invalid risk scores', async function () {
      const faceValue = ethers.utils.parseEther('100');
      const tenor = 90;
      const invalidRiskScore = 1001; // > 1000
      const metadata = 'QmTestHash';
      const collateral = ethers.utils.parseEther('10');

      await expect(
        realYield.connect(exporter).createInvoice(
          faceValue,
          tenor,
          invalidRiskScore,
          metadata,
          { value: collateral }
        )
      ).to.be.revertedWith('Invalid risk score');
    });
  });

  describe('Investment', function () {
    beforeEach(async function () {
      // Create an invoice first
      const faceValue = ethers.utils.parseEther('100');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash';
      const collateral = ethers.utils.parseEther('10');

      await realYield.connect(exporter).createInvoice(
        faceValue,
        tenor,
        riskScore,
        metadata,
        { value: collateral }
      );
    });

    it('Should allow investment in active invoice', async function () {
      const investmentAmount = ethers.utils.parseEther('80');

      await expect(
        realYield.connect(investor).investInInvoice(1, {
          value: investmentAmount
        })
      ).to.emit(realYield, 'InvestmentMade')
        .withArgs(1, investor.address, investmentAmount);

      const investment = await realYield.investments(1, investor.address);
      expect(investment).to.equal(investmentAmount);
    });

    it('Should calculate correct discount rate', async function () {
      const discountRate = await realYield.calculateDiscountRate(750, 90);
      
      // Expected discount rate for risk score 750 and tenor 90
      // Formula: baseRate + (riskScore / 1000) * riskMultiplier + (tenor / 365) * tenorMultiplier
      const expectedRate = 200 + (750 / 1000) * 500 + (90 / 365) * 300;
      
      expect(discountRate).to.be.closeTo(expectedRate, 10);
    });

    it('Should prevent over-investment', async function () {
      const excessiveInvestment = ethers.utils.parseEther('150');

      await expect(
        realYield.connect(investor).investInInvoice(1, {
          value: excessiveInvestment
        })
      ).to.be.revertedWith('Investment exceeds face value');
    });
  });

  describe('Settlement', function () {
    beforeEach(async function () {
      // Create and invest in invoice
      const faceValue = ethers.utils.parseEther('100');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash';
      const collateral = ethers.utils.parseEther('10');
      const investmentAmount = ethers.utils.parseEther('80');

      await realYield.connect(exporter).createInvoice(
        faceValue,
        tenor,
        riskScore,
        metadata,
        { value: collateral }
      );

      await realYield.connect(investor).investInInvoice(1, {
        value: investmentAmount
      });
    });

    it('Should allow owner to settle invoice', async function () {
      await expect(
        realYield.connect(exporter).settleInvoice(1)
      ).to.emit(realYield, 'InvoiceSettled')
        .withArgs(1);

      const invoice = await realYield.invoices(1);
      expect(invoice.status).to.equal(1); // SETTLED
    });

    it('Should prevent non-owner from settling', async function () {
      await expect(
        realYield.connect(investor).settleInvoice(1)
      ).to.be.revertedWith('Only invoice owner can settle');
    });

    it('Should allow investors to claim returns after settlement', async function () {
      // Settle invoice
      await realYield.connect(exporter).settleInvoice(1);

      const initialBalance = await investor.getBalance();
      
      await expect(
        realYield.connect(investor).claimReturns(1)
      ).to.emit(realYield, 'ReturnsClaimed');

      const finalBalance = await investor.getBalance();
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe('Default Handling', function () {
    beforeEach(async function () {
      // Create and invest in invoice
      const faceValue = ethers.utils.parseEther('100');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash';
      const collateral = ethers.utils.parseEther('10');
      const investmentAmount = ethers.utils.parseEther('80');

      await realYield.connect(exporter).createInvoice(
        faceValue,
        tenor,
        riskScore,
        metadata,
        { value: collateral }
      );

      await realYield.connect(investor).investInInvoice(1, {
        value: investmentAmount
      });

      // Add funds to insurance pool
      await insurancePool.deposit({ value: ethers.utils.parseEther('50') });
    });

    it('Should handle invoice default', async function () {
      await expect(
        realYield.connect(owner).markAsDefault(1)
      ).to.emit(realYield, 'InvoiceDefaulted')
        .withArgs(1);

      const invoice = await realYield.invoices(1);
      expect(invoice.status).to.equal(2); // DEFAULTED
    });

    it('Should allow insurance claims for defaulted invoices', async function () {
      // Mark as default
      await realYield.connect(owner).markAsDefault(1);

      const claimAmount = ethers.utils.parseEther('40');
      
      await expect(
        realYield.connect(investor).claimInsurance(1, claimAmount)
      ).to.emit(insurancePool, 'InsuranceClaimed');
    });
  });

  describe('View Functions', function () {
    it('Should return correct invoice count', async function () {
      expect(await realYield.getInvoiceCount()).to.equal(0);

      // Create an invoice
      const faceValue = ethers.utils.parseEther('100');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash';
      const collateral = ethers.utils.parseEther('10');

      await realYield.connect(exporter).createInvoice(
        faceValue,
        tenor,
        riskScore,
        metadata,
        { value: collateral }
      );

      expect(await realYield.getInvoiceCount()).to.equal(1);
    });

    it('Should return active invoices', async function () {
      // Create multiple invoices
      for (let i = 0; i < 3; i++) {
        await realYield.connect(exporter).createInvoice(
          ethers.utils.parseEther('100'),
          90,
          750,
          `QmTestHash${i}`,
          { value: ethers.utils.parseEther('10') }
        );
      }

      const activeInvoices = await realYield.getActiveInvoices();
      expect(activeInvoices.length).to.equal(3);
    });
  });
});
```

### Gas Usage Testing

```javascript
// test/gas-usage.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Gas Usage Tests', function () {
  let realYield, insurancePool;
  let owner, exporter, investor;
  
  beforeEach(async function () {
    [owner, exporter, investor] = await ethers.getSigners();
    
    const InsurancePool = await ethers.getContractFactory('InsurancePool');
    insurancePool = await InsurancePool.deploy();
    await insurancePool.deployed();
    
    const RealYield = await ethers.getContractFactory('RealYieldInvoiceFactoring');
    realYield = await RealYield.deploy(insurancePool.address);
    await realYield.deployed();
  });

  it('Should use reasonable gas for invoice creation', async function () {
    const tx = await realYield.connect(exporter).createInvoice(
      ethers.utils.parseEther('100'),
      90,
      750,
      'QmTestHash',
      { value: ethers.utils.parseEther('10') }
    );
    
    const receipt = await tx.wait();
    console.log('Invoice creation gas used:', receipt.gasUsed.toString());
    
    // Should use less than 200k gas
    expect(receipt.gasUsed).to.be.lt(200000);
  });

  it('Should use reasonable gas for investment', async function () {
    // Create invoice first
    await realYield.connect(exporter).createInvoice(
      ethers.utils.parseEther('100'),
      90,
      750,
      'QmTestHash',
      { value: ethers.utils.parseEther('10') }
    );

    const tx = await realYield.connect(investor).investInInvoice(1, {
      value: ethers.utils.parseEther('80')
    });
    
    const receipt = await tx.wait();
    console.log('Investment gas used:', receipt.gasUsed.toString());
    
    // Should use less than 100k gas
    expect(receipt.gasUsed).to.be.lt(100000);
  });
});
```

## End-to-End Testing

### Playwright Configuration

**playwright.config.ts:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### E2E Test Examples

**e2e/invoice-creation.spec.ts:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Invoice Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create invoice successfully', async ({ page }) => {
    // Navigate to Create tab
    await page.click('[data-testid="create-tab"]');
    
    // Fill invoice form
    await page.fill('[data-testid="exporter-input"]', 'Test Exporter Ltd');
    await page.fill('[data-testid="importer-input"]', 'Test Importer Inc');
    await page.selectOption('[data-testid="commodity-select"]', 'Electronics');
    await page.fill('[data-testid="face-value-input"]', '100000');
    await page.fill('[data-testid="tenor-input"]', '90');
    await page.selectOption('[data-testid="region-select"]', 'Asia-Pacific');
    
    // Upload document
    await page.setInputFiles(
      '[data-testid="document-upload"]', 
      'test-files/sample-invoice.pdf'
    );
    
    // Wait for risk assessment
    await expect(page.locator('[data-testid="risk-score"]')).toBeVisible();
    
    // Connect wallet (mock)
    await page.click('[data-testid="connect-wallet-btn"]');
    await page.click('[data-testid="hashpack-option"]');
    
    // Create invoice
    await page.click('[data-testid="create-invoice-btn"]');
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Invoice created successfully');
    
    // Verify token ID is displayed
    await expect(page.locator('[data-testid="token-id"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="create-tab"]');
    
    // Try to create without filling required fields
    await page.click('[data-testid="create-invoice-btn"]');
    
    // Check validation errors
    await expect(page.locator('[data-testid="exporter-error"]'))
      .toContainText('Exporter is required');
    await expect(page.locator('[data-testid="importer-error"]'))
      .toContainText('Importer is required');
  });

  test('should calculate risk score dynamically', async ({ page }) => {
    await page.click('[data-testid="create-tab"]');
    
    // Fill basic information
    await page.fill('[data-testid="exporter-input"]', 'High Risk Exporter');
    await page.fill('[data-testid="importer-input"]', 'High Risk Importer');
    await page.selectOption('[data-testid="commodity-select"]', 'Raw Materials');
    await page.fill('[data-testid="face-value-input"]', '1000000');
    await page.fill('[data-testid="tenor-input"]', '180');
    await page.selectOption('[data-testid="region-select"]', 'Africa');
    
    // Wait for risk calculation
    await page.waitForTimeout(2000);
    
    // Check that risk score is high
    const riskScore = await page.textContent('[data-testid="risk-score-value"]');
    expect(parseInt(riskScore!)).toBeGreaterThan(700);
    
    // Check risk category
    await expect(page.locator('[data-testid="risk-category"]'))
      .toContainText('High');
  });
});
```

**e2e/marketplace.spec.ts:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Marketplace Flow', () => {
  test('should display available invoices', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="marketplace-tab"]');
    
    // Wait for invoices to load
    await expect(page.locator('[data-testid="invoice-card"]').first())
      .toBeVisible();
    
    // Check invoice details are displayed
    await expect(page.locator('[data-testid="invoice-face-value"]').first())
      .toBeVisible();
    await expect(page.locator('[data-testid="invoice-tenor"]').first())
      .toBeVisible();
    await expect(page.locator('[data-testid="invoice-risk-score"]').first())
      .toBeVisible();
  });

  test('should filter invoices by criteria', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="marketplace-tab"]');
    
    // Apply filters
    await page.selectOption('[data-testid="region-filter"]', 'Asia-Pacific');
    await page.selectOption('[data-testid="risk-filter"]', 'Low');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify filtered results
    const invoiceCards = page.locator('[data-testid="invoice-card"]');
    const count = await invoiceCards.count();
    
    for (let i = 0; i < count; i++) {
      const card = invoiceCards.nth(i);
      await expect(card.locator('[data-testid="invoice-region"]'))
        .toContainText('Asia-Pacific');
    }
  });

  test('should invest in invoice', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="marketplace-tab"]');
    
    // Click on first invoice
    await page.click('[data-testid="invoice-card"]', { first: true });
    
    // Enter investment amount
    await page.fill('[data-testid="investment-amount"]', '50000');
    
    // Connect wallet
    await page.click('[data-testid="connect-wallet-btn"]');
    await page.click('[data-testid="hashpack-option"]');
    
    // Invest
    await page.click('[data-testid="invest-btn"]');
    
    // Wait for transaction confirmation
    await expect(page.locator('[data-testid="investment-success"]'))
      .toContainText('Investment successful');
  });
});
```

## Performance Testing

### Load Testing with Artillery

**artillery.yml:**

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 5
  payload:
    path: 'test-data.csv'
    fields:
      - exporter
      - importer
      - faceValue

scenarios:
  - name: 'API Load Test'
    weight: 70
    flow:
      - get:
          url: '/api/invoices'
      - post:
          url: '/api/invoices'
          json:
            exporter: '{{ exporter }}'
            importer: '{{ importer }}'
            commodity: 'Electronics'
            faceValue: '{{ faceValue }}'
            tenor: 90
            region: 'Asia-Pacific'
      
  - name: 'Frontend Load Test'
    weight: 30
    flow:
      - get:
          url: '/'
      - get:
          url: '/dashboard'
```

### Memory and CPU Profiling

```javascript
// scripts/performance-test.js
const { performance } = require('perf_hooks');
const { HederaTokenService } = require('../lib/hts');

async function performanceTest() {
  const htsService = new HederaTokenService();
  const iterations = 100;
  
  console.log(`Running performance test with ${iterations} iterations...`);
  
  const startTime = performance.now();
  const startMemory = process.memoryUsage();
  
  for (let i = 0; i < iterations; i++) {
    const invoiceData = {
      invoiceId: `PERF-TEST-${i}`,
      exporter: 'Performance Test Exporter',
      importer: 'Performance Test Importer',
      commodity: 'Electronics',
      faceValue: 100000,
      tenor: 90,
      region: 'Asia-Pacific',
      riskScore: 750
    };
    
    try {
      await htsService.createInvoiceToken(invoiceData);
    } catch (error) {
      console.error(`Iteration ${i} failed:`, error.message);
    }
    
    if (i % 10 === 0) {
      console.log(`Completed ${i}/${iterations} iterations`);
    }
  }
  
  const endTime = performance.now();
  const endMemory = process.memoryUsage();
  
  console.log('Performance Results:');
  console.log(`Total time: ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`Average time per operation: ${((endTime - startTime) / iterations).toFixed(2)}ms`);
  console.log(`Memory usage increase: ${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`);
}

performanceTest().catch(console.error);
```

## Security Testing

### Input Validation Testing

```typescript
// __tests__/security/input-validation.test.ts
import { validateInvoiceInput } from '@/utils/validation';

describe('Input Validation Security', () => {
  it('should reject SQL injection attempts', () => {
    const maliciousInput = {
      exporter: "'; DROP TABLE invoices; --",
      importer: 'Normal Importer',
      commodity: 'Electronics',
      faceValue: 100000,
      tenor: 90,
      region: 'Asia-Pacific'
    };
    
    expect(() => validateInvoiceInput(maliciousInput))
      .toThrow('Invalid characters in exporter name');
  });
  
  it('should reject XSS attempts', () => {
    const xssInput = {
      exporter: '<script>alert("xss")</script>',
      importer: 'Normal Importer',
      commodity: 'Electronics',
      faceValue: 100000,
      tenor: 90,
      region: 'Asia-Pacific'
    };
    
    expect(() => validateInvoiceInput(xssInput))
      .toThrow('Invalid characters in exporter name');
  });
  
  it('should reject oversized inputs', () => {
    const oversizedInput = {
      exporter: 'A'.repeat(1001), // Assuming 1000 char limit
      importer: 'Normal Importer',
      commodity: 'Electronics',
      faceValue: 100000,
      tenor: 90,
      region: 'Asia-Pacific'
    };
    
    expect(() => validateInvoiceInput(oversizedInput))
      .toThrow('Exporter name too long');
  });
});
```

### Authentication Testing

```typescript
// __tests__/security/auth.test.ts
import { createMocks } from 'node-mocks-http';
import { authMiddleware } from '@/middleware/auth';

describe('Authentication Security', () => {
  it('should reject requests without valid wallet signature', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {},
      body: { data: 'test' }
    });
    
    await authMiddleware(req, res, () => {});
    
    expect(res._getStatusCode()).toBe(401);
  });
  
  it('should reject expired signatures', async () => {
    const expiredSignature = 'expired-signature-here';
    
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'x-wallet-signature': expiredSignature,
        'x-wallet-account': '0.0.123456'
      },
      body: { data: 'test' }
    });
    
    await authMiddleware(req, res, () => {});
    
    expect(res._getStatusCode()).toBe(401);
  });
});
```

## Test Data Management

### Test Fixtures

```typescript
// __tests__/fixtures/invoice-data.ts
export const validInvoiceData = {
  exporter: 'Global Exports Ltd',
  importer: 'Import Solutions Inc',
  commodity: 'Electronics',
  faceValue: 100000,
  tenor: 90,
  region: 'Asia-Pacific'
};

export const highRiskInvoiceData = {
  exporter: 'High Risk Exporter',
  importer: 'High Risk Importer',
  commodity: 'Raw Materials',
  faceValue: 1000000,
  tenor: 180,
  region: 'Africa'
};

export const lowRiskInvoiceData = {
  exporter: 'AAA Rated Exporter',
  importer: 'AAA Rated Importer',
  commodity: 'Technology',
  faceValue: 50000,
  tenor: 30,
  region: 'North America'
};
```

### Test Database Seeding

```javascript
// scripts/seed-test-db.js
const { PrismaClient } = require('@prisma/client');
const { validInvoiceData, highRiskInvoiceData } = require('../__tests__/fixtures/invoice-data');

const prisma = new PrismaClient();

async function seedTestDatabase() {
  console.log('Seeding test database...');
  
  // Create test invoices
  await prisma.invoice.createMany({
    data: [
      {
        ...validInvoiceData,
        invoiceId: 'TEST-001',
        tokenId: '0.0.123456',
        riskScore: 500,
        status: 'ACTIVE'
      },
      {
        ...highRiskInvoiceData,
        invoiceId: 'TEST-002',
        tokenId: '0.0.123457',
        riskScore: 800,
        status: 'ACTIVE'
      }
    ]
  });
  
  console.log('Test database seeded successfully');
}

seedTestDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## CI/CD Integration

### GitHub Actions Test Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        HEDERA_NETWORK: testnet
        HEDERA_ACCOUNT_ID: ${{ secrets.TEST_HEDERA_ACCOUNT_ID }}
        HEDERA_PRIVATE_KEY: ${{ secrets.TEST_HEDERA_PRIVATE_KEY }}
    
    - name: Run smart contract tests
      run: npm run test:contracts
    
    - name: Generate coverage report
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: Install Playwright
      run: npx playwright install
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        CI: true
    
    - name: Upload E2E test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests independent** and isolated

### 2. Mocking Strategy

- **Mock external dependencies** (Hedera SDK, APIs)
- **Use dependency injection** for easier testing
- **Mock at the right level** (service layer vs. network layer)
- **Verify mock interactions** when necessary

### 3. Test Data

- **Use factories** for generating test data
- **Keep test data minimal** but realistic
- **Clean up after tests** to prevent side effects
- **Use separate test databases**

### 4. Performance

- **Run tests in parallel** when possible
- **Use test timeouts** appropriately
- **Cache dependencies** in CI/CD
- **Optimize test setup/teardown**

### 5. Maintenance

- **Keep tests up to date** with code changes
- **Refactor tests** when refactoring code
- **Monitor test flakiness** and fix unstable tests
- **Review test coverage** regularly

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:contracts
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- __tests__/components/wallet/wallet-connect.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should create invoice"
```

## Troubleshooting

### Common Issues

1. **Hedera SDK mocking issues**
   - Ensure all SDK methods are properly mocked
   - Check for async/await handling in mocks

2. **Test timeouts**
   - Increase timeout for slow operations
   - Check for unresolved promises

3. **Database connection issues**
   - Verify test database configuration
   - Ensure proper cleanup between tests

4. **E2E test flakiness**
   - Add proper wait conditions
   - Use data-testid attributes consistently
   - Handle async operations properly

For additional support, refer to the [Testing Wiki](https://github.com/your-repo/wiki/testing) or create an issue in the repository.