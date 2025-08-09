const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting NFT contracts deployment to Hedera Testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", await deployer.getAddress());
  
  const balance = await ethers.provider.getBalance(await deployer.getAddress());
  console.log("💰 Account balance:", ethers.formatEther(balance), "HBAR");

  // Deploy MyToken (Basic ERC-721)
  console.log("\n📦 Deploying MyToken (Basic ERC-721)...");
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(await deployer.getAddress());
  await myToken.waitForDeployment();
  console.log("✅ MyToken deployed to:", await myToken.getAddress());
  console.log("🔗 Transaction hash:", myToken.deploymentTransaction().hash);

  // Deploy MyTokenAdvanced (Advanced ERC-721 with Access Control)
  console.log("\n📦 Deploying MyTokenAdvanced (Advanced ERC-721)...");
  const MyTokenAdvanced = await ethers.getContractFactory("MyTokenAdvanced");
  const deployerAddress = await deployer.getAddress();
  const myTokenAdvanced = await MyTokenAdvanced.deploy(deployerAddress, deployerAddress, deployerAddress);
  await myTokenAdvanced.waitForDeployment();
  console.log("✅ MyTokenAdvanced deployed to:", await myTokenAdvanced.getAddress());
  console.log("🔗 Transaction hash:", myTokenAdvanced.deploymentTransaction().hash);

  // Deploy MyTokenUpgradeable (Upgradeable ERC-721)
  console.log("\n📦 Deploying MyTokenUpgradeable (Upgradeable ERC-721)...");
  const MyTokenUpgradeable = await ethers.getContractFactory("MyTokenUpgradeable");
  const myTokenUpgradeable = await upgrades.deployProxy(
    MyTokenUpgradeable,
    [await deployer.getAddress()],
    { initializer: "initialize" }
  );
  await myTokenUpgradeable.waitForDeployment();
  console.log("✅ MyTokenUpgradeable deployed to:", await myTokenUpgradeable.getAddress());
  console.log("🔗 Transaction hash:", myTokenUpgradeable.deploymentTransaction().hash);

  // Deploy HederaNFT (Hedera Token Service integration)
  console.log("\n📦 Deploying HederaNFT (HTS Integration)...");
  const HederaNFT = await ethers.getContractFactory("HederaNFT");
  const hederaNFT = await HederaNFT.deploy();
  await hederaNFT.waitForDeployment();
  console.log("✅ HederaNFT deployed to:", await hederaNFT.getAddress());
  console.log("🔗 Transaction hash:", hederaNFT.deploymentTransaction().hash);

  // Test basic functionality
  console.log("\n🧪 Testing Basic Functionality...");
  
  try {
    // Test MyToken
    console.log("Testing MyToken mint...");
    const mintTx1 = await myToken.safeMint(await deployer.getAddress());
    await mintTx1.wait();
    console.log("✅ MyToken: Minted token 1 to", await deployer.getAddress());
    console.log("🔗 Mint transaction:", mintTx1.hash);
    
    // Test MyTokenAdvanced
    console.log("Testing MyTokenAdvanced mint...");
    const mintTx2 = await myTokenAdvanced.safeMint(await deployer.getAddress(), "https://example.com/token/2");
    await mintTx2.wait();
    console.log("✅ MyTokenAdvanced: Minted token 1 to", await deployer.getAddress());
    console.log("🔗 Mint transaction:", mintTx2.hash);
    
    // Test MyTokenUpgradeable
    console.log("Testing MyTokenUpgradeable mint...");
    const mintTx3 = await myTokenUpgradeable.safeMint(await deployer.getAddress());
    await mintTx3.wait();
    console.log("✅ MyTokenUpgradeable: Minted token 1 to", await deployer.getAddress());
    console.log("🔗 Mint transaction:", mintTx3.hash);

    // Test token balances
    const balance1 = await myToken.balanceOf(await deployer.getAddress());
    const balance2 = await myTokenAdvanced.balanceOf(await deployer.getAddress());
    const balance3 = await myTokenUpgradeable.balanceOf(await deployer.getAddress());
    
    console.log("\n📊 Token Balances:");
    console.log("MyToken balance:", balance1.toString());
    console.log("MyTokenAdvanced balance:", balance2.toString());
    console.log("MyTokenUpgradeable balance:", balance3.toString());

  } catch (error) {
    console.log("⚠️ Testing failed:", error.message);
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployer: await deployer.getAddress(),
    timestamp: new Date().toISOString(),
    contracts: {
      MyToken: {
        address: await myToken.getAddress(),
        transactionHash: myToken.deploymentTransaction().hash,
        type: "Basic ERC-721"
      },
      MyTokenAdvanced: {
        address: await myTokenAdvanced.getAddress(),
        transactionHash: myTokenAdvanced.deploymentTransaction().hash,
        type: "Advanced ERC-721 with Access Control"
      },
      MyTokenUpgradeable: {
        address: await myTokenUpgradeable.getAddress(),
        transactionHash: myTokenUpgradeable.deploymentTransaction().hash,
        type: "Upgradeable ERC-721 with UUPS Proxy"
      },
      HederaNFT: {
        address: await hederaNFT.getAddress(),
        transactionHash: hederaNFT.deploymentTransaction().hash,
        type: "Hedera Token Service Integration"
      }
    }
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `nft-deployment-${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📄 Deployment info saved to:", filepath);

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contracts on Hashscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying Contracts on Hashscan...");
    
    const contractsToVerify = [
      { name: "MyToken", address: await myToken.getAddress(), args: [] },
      { name: "MyTokenAdvanced", address: await myTokenAdvanced.getAddress(), args: [] },
      { name: "HederaNFT", address: await hederaNFT.getAddress(), args: [] }
    ];

    for (const contract of contractsToVerify) {
      try {
        console.log(`Verifying ${contract.name}...`);
        await hre.run("verify:verify", {
          address: contract.address,
          constructorArguments: contract.args,
        });
        console.log(`✅ ${contract.name} verified on Hashscan`);
      } catch (error) {
        console.log(`❌ ${contract.name} verification failed:`, error.message);
      }
    }
  }

  console.log("\n🎉 NFT Deployment Complete!");
  console.log("All contracts deployed successfully to Hedera Testnet!");
  console.log("🌐 Transactions are recorded on the Hedera network and can be viewed on Hashscan:");
  console.log(`https://hashscan.io/testnet/`);
  
  console.log("\n📝 Contract Addresses:");
  console.log(`MyToken: ${await myToken.getAddress()}`);
  console.log(`MyTokenAdvanced: ${await myTokenAdvanced.getAddress()}`);
  console.log(`MyTokenUpgradeable: ${await myTokenUpgradeable.getAddress()}`);
  console.log(`HederaNFT: ${await hederaNFT.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });