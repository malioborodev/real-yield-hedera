import { useEffect, useState } from 'react';

interface AccountInfo {
  accountId: string;
  balance: number;
  stakedBalance: number; // New field for staked HBAR
  walletType: string;
}

interface TransactionResult {
  success: boolean;
  message: string;
  txId?: string;
}

class HederaWalletMock {
  private accountInfo: AccountInfo | null = null;
  private isConnectedState: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Initialize with a disconnected state
    this.accountInfo = {
      accountId: '0.0.000000',
      balance: 0,
      stakedBalance: 0,
      walletType: 'Mock Wallet',
    };
    this.isConnectedState = false;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public isConnected(): boolean {
    return this.isConnectedState;
  }

  public getAccountInfo(): AccountInfo | null {
    return this.accountInfo;
  }

  public async connect(): Promise<AccountInfo> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Simulate connection success
          this.accountInfo = {
            accountId: '0.0.123456',
            balance: 5000, // Initial HBAR balance
            stakedBalance: 0, // Initially no HBAR staked
            walletType: 'Mock Wallet',
          };
          this.isConnectedState = true;
          this.notifyListeners();
          resolve(this.accountInfo);
        } catch (error) {
          reject(new Error('Failed to connect to mock wallet.'));
        }
      }, 1500); // Simulate network delay
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.accountInfo = {
          accountId: '0.0.000000',
          balance: 0,
          stakedBalance: 0,
          walletType: 'Mock Wallet',
        };
        this.isConnectedState = false;
        this.notifyListeners();
        resolve();
      }, 500); // Simulate network delay
    });
  }

  public async stakeHBAR(amount: number): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isConnectedState || !this.accountInfo) {
        return reject({ success: false, message: 'Wallet not connected.' });
      }
      if (this.accountInfo.balance < amount) {
        return reject({ success: false, message: 'Insufficient HBAR balance.' });
      }

      setTimeout(() => {
        if (this.accountInfo) {
          this.accountInfo.balance -= amount;
          this.accountInfo.stakedBalance += amount;
          this.notifyListeners();
          resolve({ success: true, message: `Successfully staked ${amount} HBAR.`, txId: `mock_tx_${Date.now()}` });
        } else {
          reject({ success: false, message: 'Account info not available.' });
        }
      }, 1500);
    });
  }

  public async unstakeHBAR(amount: number): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isConnectedState || !this.accountInfo) {
        return reject({ success: false, message: 'Wallet not connected.' });
      }
      if (this.accountInfo.stakedBalance < amount) {
        return reject({ success: false, message: 'Insufficient staked HBAR balance.' });
      }

      setTimeout(() => {
        if (this.accountInfo) {
          this.accountInfo.stakedBalance -= amount;
          this.accountInfo.balance += amount;
          this.notifyListeners();
          resolve({ success: true, message: `Successfully unstaked ${amount} HBAR.`, txId: `mock_tx_${Date.now()}` });
        } else {
          reject({ success: false, message: 'Account info not available.' });
        }
      }, 1500);
    });
  }

  public async createInvoiceTransaction(
    invoiceDetails: {
      exporterCompany: string;
      importerCompany: string;
      commodity: string;
      faceValue: number;
      tenor: number;
      pd: number;
      htsTokenId: string;
      hcsTopicId: string;
    },
    collateralAmount: number,
    invoiceId: string // Added invoiceId to track locked collateral
  ): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isConnectedState || !this.accountInfo) {
        return reject({ success: false, message: 'Wallet not connected.' });
      }
      if (this.accountInfo.stakedBalance < collateralAmount) {
        return reject({ success: false, message: 'Insufficient staked HBAR for collateral.' });
      }

      setTimeout(() => {
        if (this.accountInfo) {
          this.accountInfo.stakedBalance -= collateralAmount; // Deduct from staked balance
          // In a real scenario, this collateral would be locked in a smart contract
          // For mock, we just reduce the staked balance.
          this.notifyListeners();
          resolve({
            success: true,
            message: `Invoice NFT created and ${collateralAmount} HBAR locked as collateral for ${invoiceId}.`,
            txId: `mock_invoice_tx_${Date.now()}`,
          });
        } else {
          reject({ success: false, message: 'Account info not available.' });
        }
      }, 2000); // Simulate longer transaction time
    });
  }

  public async releaseCollateralTransaction(
    invoiceId: string,
    amount: number
  ): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isConnectedState || !this.accountInfo) {
        return reject({ success: false, message: 'Wallet not connected.' });
      }

      setTimeout(() => {
        if (this.accountInfo) {
          // In a real scenario, this would check if collateral is indeed locked for this invoice
          // For mock, we just add it back to the staked balance.
          this.accountInfo.stakedBalance += amount;
          this.notifyListeners();
          resolve({
            success: true,
            message: `Collateral for invoice ${invoiceId} released successfully.`,
            txId: `mock_release_tx_${Date.now()}`,
          });
        } else {
          reject({ success: false, message: 'Account info not available.' });
        }
      }, 1500);
    });
  }
}

export const hederaWallet = new HederaWalletMock();

// Custom hook to use wallet status in components
export function useHederaWallet() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(hederaWallet.getAccountInfo());
  const [isConnected, setIsConnected] = useState(hederaWallet.isConnected());

  useEffect(() => {
    const updateStatus = () => {
      setAccountInfo(hederaWallet.getAccountInfo());
      setIsConnected(hederaWallet.isConnected());
    };

    const unsubscribe = hederaWallet.subscribe(updateStatus);
    updateStatus(); // Initial update

    return () => unsubscribe();
  }, []);

  return { accountInfo, isConnected, connect: hederaWallet.connect, disconnect: hederaWallet.disconnect };
}
