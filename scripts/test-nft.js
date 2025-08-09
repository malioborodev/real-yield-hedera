const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("🧪 Starting NFT Contract Testing on Hedera Testnet...");
  
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("👤 Testing with accounts:");
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);

  // Deploy contracts for testing
  console.log("\n📦 Deploying contracts for testing...");
  
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();
  await myToken.deployed();
  console.log("✅ MyToken deployed to:", myToken.address);

  const MyTokenAdvanced = await ethers.getContractFactory("MyTokenAdvanced");
  const myTokenAdvanced = await MyTokenAdvanced.deploy();
  await myTokenAdvanced.deployed();
  console.log("✅ MyTokenAdvanced deployed to:", myTokenAdvanced.address);

  const HederaNFT = await ethers.getContractFactory("HederaNFT");
  const hederaNFT = await HederaNFT.deploy();
  await hederaNFT.deployed();
  console.log("✅ HederaNFT deployed to:", hederaNFT.address);

  // Test MyToken (Basic ERC-721)
  console.log("\n🔬 Testing MyToken (Basic ERC-721)...");
  
  try {
    // Test minting
    console.log("Testing mint functionality...");
    const mintTx1 = await myToken.safeMint(user1.address, "https://example.com/token/1");
    await mintTx1.wait();
    console.log("✅ Minted token 1 to user1");
    console.log("🔗 Transaction:", mintTx1.hash);

    const mintTx2 = await myToken.safeMint(user2.address, "https://example.com/token/2");
    await mintTx2.wait();
    console.log("✅ Minted token 2 to user2");
    console.log("🔗 Transaction:", mintTx2.hash);

    // Test balances
    const balance1 = await myToken.balanceOf(user1.address);
    const balance2 = await myToken.balanceOf(user2.address);
    const totalSupply = await myToken.totalSupply();
    console.log(`📊 User1 balance: ${balance1}, User2 balance: ${balance2}, Total supply: ${totalSupply}`);

    // Test token URI
    const tokenURI = await myToken.tokenURI(1);
    console.log("🔗 Token 1 URI:", tokenURI);

    // Test ownership
    const owner1 = await myToken.ownerOf(1);
    const owner2 = await myToken.ownerOf(2);
    console.log(`👤 Token 1 owner: ${owner1}, Token 2 owner: ${owner2}`);

    // Test burning
    console.log("Testing burn functionality...");
    const burnTx = await myToken.burn(1);
    await burnTx.wait();
    console.log("✅ Burned token 1");
    console.log("🔗 Transaction:", burnTx.hash);

    const newTotalSupply = await myToken.totalSupply();
    console.log(`📊 New total supply after burn: ${newTotalSupply}`);

  } catch (error) {
    console.log("❌ MyToken test failed:", error.message);
  }

  // Test MyTokenAdvanced (Advanced ERC-721)
  console.log("\n🔬 Testing MyTokenAdvanced (Advanced ERC-721)...");
  
  try {
    // Test role-based minting
    console.log("Testing role-based minting...");
    const MINTER_ROLE = await myTokenAdvanced.MINTER_ROLE();
    
    // Grant minter role to user1
    const grantTx = await myTokenAdvanced.grantRole(MINTER_ROLE, user1.address);
    await grantTx.wait();
    console.log("✅ Granted MINTER_ROLE to user1");
    console.log("🔗 Transaction:", grantTx.hash);

    // Mint as user1 (with minter role)
    const mintTx3 = await myTokenAdvanced.connect(user1).safeMint(user2.address, "https://example.com/advanced/1");
    await mintTx3.wait();
    console.log("✅ User1 minted token 1 to user2");
    console.log("🔗 Transaction:", mintTx3.hash);

    // Test pausing
    console.log("Testing pause functionality...");
    const pauseTx = await myTokenAdvanced.pause();
    await pauseTx.wait();
    console.log("✅ Contract paused");
    console.log("🔗 Transaction:", pauseTx.hash);

    // Try to mint while paused (should fail)
    try {
      await myTokenAdvanced.connect(user1).safeMint(user2.address, "https://example.com/advanced/2");
      console.log("❌ Minting while paused should have failed");
    } catch (error) {
      console.log("✅ Minting correctly failed while paused:", error.message.split('\n')[0]);
    }

    // Unpause
    const unpauseTx = await myTokenAdvanced.unpause();
    await unpauseTx.wait();
    console.log("✅ Contract unpaused");
    console.log("🔗 Transaction:", unpauseTx.hash);

    // Test burning
    const burnTx2 = await myTokenAdvanced.burn(1);
    await burnTx2.wait();
    console.log("✅ Burned token 1");
    console.log("🔗 Transaction:", burnTx2.hash);

  } catch (error) {
    console.log("❌ MyTokenAdvanced test failed:", error.message);
  }

  // Test HederaNFT (HTS Integration)
  console.log("\n🔬 Testing HederaNFT (HTS Integration)...");
  
  try {
    console.log("✅ HederaNFT contract deployed and ready for HTS operations");
    console.log("ℹ️ HTS operations require specific Hedera network setup and may need additional configuration");
    console.log("📝 Contract address for HTS operations:", hederaNFT.address);
    
    // Note: Actual HTS operations would require:
    // 1. Proper Hedera account setup
    // 2. HBAR for transaction fees
    // 3. Specific HTS token creation and management
    // These are demonstrated in the contract but require live Hedera network interaction
    
  } catch (error) {
    console.log("❌ HederaNFT test failed:", error.message);
  }

  // Test access control failures
  console.log("\n🔒 Testing Access Control...");
  
  try {
    // Try to mint MyToken as non-owner (should fail)
    try {
      await myToken.connect(user1).safeMint(user1.address, "https://example.com/unauthorized");
      console.log("❌ Non-owner minting should have failed");
    } catch (error) {
      console.log("✅ Non-owner minting correctly failed:", error.message.split('\n')[0]);
    }

    // Try to pause MyTokenAdvanced as non-admin (should fail)
    try {
      await myTokenAdvanced.connect(user2).pause();
      console.log("❌ Non-admin pausing should have failed");
    } catch (error) {
      console.log("✅ Non-admin pausing correctly failed:", error.message.split('\n')[0]);
    }

  } catch (error) {
    console.log("❌ Access control test failed:", error.message);
  }

  // Final summary
  console.log("\n📊 Testing Summary:");
  
  try {
    const myTokenSupply = await myToken.totalSupply();
    const myTokenAdvancedSupply = await myTokenAdvanced.totalSupply();
    
    console.log(`MyToken total supply: ${myTokenSupply}`);
    console.log(`MyTokenAdvanced total supply: ${myTokenAdvancedSupply}`);
    console.log(`HederaNFT deployed at: ${hederaNFT.address}`);
    
  } catch (error) {
    console.log("❌ Summary generation failed:", error.message);
  }

  console.log("\n🎉 NFT Testing Complete!");
  console.log("All tests executed on Hedera Testnet!");
  console.log("🌐 All transactions are recorded on the Hedera network and can be viewed on Hashscan.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  });