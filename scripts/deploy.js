const { ethers } = require('hardhat');
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Starting deployment to Hedera...');
  
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'HBAR');

  // Deploy InsurancePool first
  console.log('\n📦 Deploying InsurancePool...');
  const InsurancePool = await ethers.getContractFactory('InsurancePool');
  const insurancePool = await InsurancePool.deploy();
  await insurancePool.waitForDeployment();
  console.log('✅ InsurancePool deployed to:', await insurancePool.getAddress());

  // Deploy RealYieldInvoiceFactoring
  console.log('\n📦 Deploying RealYieldInvoiceFactoring...');
  const RealYieldInvoiceFactoring = await ethers.getContractFactory('RealYieldInvoiceFactoring');
  const invoiceFactoring = await RealYieldInvoiceFactoring.deploy(await insurancePool.getAddress());
  await invoiceFactoring.waitForDeployment();
  console.log('✅ RealYieldInvoiceFactoring deployed to:', await invoiceFactoring.getAddress());

  // Set up insurance pool with factoring contract
  console.log('\n🔗 Setting up contract relationships...');
  const tx = await insurancePool.setFactoringContract(await invoiceFactoring.getAddress());
  await tx.wait();
  console.log('✅ Insurance pool configured with factoring contract');

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      InsurancePool: {
        address: await insurancePool.getAddress(),
        transactionHash: insurancePool.deploymentTransaction().hash,
      },
      RealYieldInvoiceFactoring: {
        address: await invoiceFactoring.getAddress(),
        transactionHash: invoiceFactoring.deploymentTransaction().hash,
      },
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log('\n💾 Deployment info saved to:', deploymentFile);

  // Generate environment variables
  const envVars = `
# Smart Contract Addresses (${hre.network.name})
NEXT_PUBLIC_INVOICE_FACTORING_CONTRACT=${invoiceFactoring.address}
NEXT_PUBLIC_INSURANCE_POOL_CONTRACT=${insurancePool.address}
`;
  
  const envFile = path.join(__dirname, '..', '.env.contracts');
  fs.writeFileSync(envFile, envVars);
  console.log('📝 Contract addresses saved to .env.contracts');

  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📋 Summary:');
  console.log('├── InsurancePool:', insurancePool.address);
  console.log('├── RealYieldInvoiceFactoring:', invoiceFactoring.address);
  console.log('├── Network:', hre.network.name);
  console.log('└── Deployer:', deployer.address);
  
  console.log('\n🔧 Next steps:');
  console.log('1. Update your .env.local with the contract addresses');
  console.log('2. Verify contracts on Hashscan (optional)');
  console.log('3. Test contract interactions');
  console.log('4. Deploy to mainnet when ready');
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });