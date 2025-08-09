const { Client, AccountCreateTransaction, Hbar, PrivateKey } = require('@hashgraph/sdk');
require('dotenv').config();

async function fundAccount() {
  try {
    // Create client for testnet
    const client = Client.forTestnet();
    
    // Use ECDSA private key
    const privateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
    
    console.log('🔑 Private Key:', privateKey.toString());
    console.log('📍 Public Key:', privateKey.publicKey.toString());
    console.log('🏦 EVM Address:', privateKey.publicKey.toEvmAddress());
    
    // Try to get account balance
    const accountId = privateKey.publicKey.toAccountId(0, 0);
    console.log('🆔 Derived Account ID:', accountId.toString());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fundAccount();