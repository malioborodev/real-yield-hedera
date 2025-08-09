const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("NFT Contracts Test Suite", function () {
  let deployer, user1, user2;
  let myToken, myTokenAdvanced, myTokenUpgradeable, hederaNFT;
  
  beforeEach(async function () {
    // Get signers
    [deployer, user1, user2] = await ethers.getSigners();
    
    // Deploy MyToken (Basic ERC-721)
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(deployer.address);
    await myToken.waitForDeployment();
    
    // Deploy MyTokenAdvanced (Advanced ERC-721)
    const MyTokenAdvanced = await ethers.getContractFactory("MyTokenAdvanced");
    myTokenAdvanced = await MyTokenAdvanced.deploy(
      deployer.address, // defaultAdmin
      deployer.address, // pauser
      deployer.address  // minter
    );
    await myTokenAdvanced.waitForDeployment();
    
    // Deploy MyTokenUpgradeable (Upgradeable ERC-721)
    const MyTokenUpgradeable = await ethers.getContractFactory("MyTokenUpgradeable");
    myTokenUpgradeable = await upgrades.deployProxy(
      MyTokenUpgradeable,
      [deployer.address],
      { initializer: "initialize" }
    );
    await myTokenUpgradeable.waitForDeployment();
    
    // Deploy HederaNFT
    const HederaNFT = await ethers.getContractFactory("HederaNFT");
    hederaNFT = await HederaNFT.deploy();
    await hederaNFT.waitForDeployment();
  });
  
  describe("MyToken (Basic ERC-721)", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MTK");
    });
    
    it("Should set the deployer as owner", async function () {
      expect(await myToken.owner()).to.equal(deployer.address);
    });
    
    it("Should mint tokens to specified address", async function () {
      const tokenId = await myToken.safeMint(user1.address);
      await tokenId.wait();
      
      expect(await myToken.balanceOf(user1.address)).to.equal(1);
      expect(await myToken.ownerOf(0)).to.equal(user1.address);
    });
    
    it("Should only allow owner to mint", async function () {
      await expect(
        myToken.connect(user1).safeMint(user2.address)
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });
    
    it("Should allow token burning by owner or approved", async function () {
      // Mint token
      await myToken.safeMint(user1.address);
      
      // User1 should be able to burn their own token
      await myToken.connect(user1).burn(0);
      
      // Token should no longer exist
      await expect(myToken.ownerOf(0)).to.be.revertedWithCustomError(
        myToken,
        "ERC721NonexistentToken"
      );
    });
    
    it("Should track total supply correctly", async function () {
      expect(await myToken.totalSupply()).to.equal(0);
      
      await myToken.safeMint(user1.address);
      expect(await myToken.totalSupply()).to.equal(1);
      
      await myToken.safeMint(user2.address);
      expect(await myToken.totalSupply()).to.equal(2);
    });
  });
  
  describe("MyTokenAdvanced (Advanced ERC-721)", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await myTokenAdvanced.name()).to.equal("MyTokenAdvanced");
      expect(await myTokenAdvanced.symbol()).to.equal("MTK");
    });
    
    it("Should set up roles correctly", async function () {
      const DEFAULT_ADMIN_ROLE = await myTokenAdvanced.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await myTokenAdvanced.MINTER_ROLE();
      const PAUSER_ROLE = await myTokenAdvanced.PAUSER_ROLE();
      
      expect(await myTokenAdvanced.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
      expect(await myTokenAdvanced.hasRole(MINTER_ROLE, deployer.address)).to.be.true;
      expect(await myTokenAdvanced.hasRole(PAUSER_ROLE, deployer.address)).to.be.true;
    });
    
    it("Should mint tokens with URI", async function () {
      const uri = "https://example.com/token/1";
      const tokenId = await myTokenAdvanced.safeMint(user1.address, uri);
      await tokenId.wait();
      
      expect(await myTokenAdvanced.balanceOf(user1.address)).to.equal(1);
      expect(await myTokenAdvanced.ownerOf(0)).to.equal(user1.address);
      expect(await myTokenAdvanced.tokenURI(0)).to.equal(uri);
    });
    
    it("Should only allow minters to mint", async function () {
      await expect(
        myTokenAdvanced.connect(user1).safeMint(user2.address, "https://example.com/token/1")
      ).to.be.revertedWithCustomError(myTokenAdvanced, "AccessControlUnauthorizedAccount");
    });
    
    it("Should allow pausing and unpausing", async function () {
      // Pause the contract
      await myTokenAdvanced.pause();
      expect(await myTokenAdvanced.paused()).to.be.true;
      
      // Should not be able to mint when paused
      await expect(
        myTokenAdvanced.safeMint(user1.address, "https://example.com/token/1")
      ).to.be.revertedWithCustomError(myTokenAdvanced, "EnforcedPause");
      
      // Unpause the contract
      await myTokenAdvanced.unpause();
      expect(await myTokenAdvanced.paused()).to.be.false;
      
      // Should be able to mint after unpausing
      await myTokenAdvanced.safeMint(user1.address, "https://example.com/token/1");
      expect(await myTokenAdvanced.balanceOf(user1.address)).to.equal(1);
    });
    
    it("Should grant and revoke roles", async function () {
      const MINTER_ROLE = await myTokenAdvanced.MINTER_ROLE();
      
      // Grant minter role to user1
      await myTokenAdvanced.grantRole(MINTER_ROLE, user1.address);
      expect(await myTokenAdvanced.hasRole(MINTER_ROLE, user1.address)).to.be.true;
      
      // User1 should now be able to mint
      await myTokenAdvanced.connect(user1).safeMint(user2.address, "https://example.com/token/1");
      expect(await myTokenAdvanced.balanceOf(user2.address)).to.equal(1);
      
      // Revoke minter role from user1
      await myTokenAdvanced.revokeRole(MINTER_ROLE, user1.address);
      expect(await myTokenAdvanced.hasRole(MINTER_ROLE, user1.address)).to.be.false;
      
      // User1 should no longer be able to mint
      await expect(
        myTokenAdvanced.connect(user1).safeMint(user2.address, "https://example.com/token/2")
      ).to.be.revertedWithCustomError(myTokenAdvanced, "AccessControlUnauthorizedAccount");
    });
  });
  
  describe("MyTokenUpgradeable (Upgradeable ERC-721)", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await myTokenUpgradeable.name()).to.equal("MyTokenUpgradeable");
      expect(await myTokenUpgradeable.symbol()).to.equal("MTU");
    });
    
    it("Should set the deployer as owner", async function () {
      expect(await myTokenUpgradeable.owner()).to.equal(deployer.address);
    });
    
    it("Should mint tokens to specified address", async function () {
      const tokenId = await myTokenUpgradeable.safeMint(user1.address);
      await tokenId.wait();
      
      expect(await myTokenUpgradeable.balanceOf(user1.address)).to.equal(1);
      expect(await myTokenUpgradeable.ownerOf(0)).to.equal(user1.address);
    });
    
    it("Should only allow owner to mint", async function () {
      await expect(
        myTokenUpgradeable.connect(user1).safeMint(user2.address)
      ).to.be.revertedWithCustomError(myTokenUpgradeable, "OwnableUnauthorizedAccount");
    });
    
    it("Should return implementation address", async function () {
      const implementation = await myTokenUpgradeable.getImplementation();
      expect(implementation).to.not.equal(ethers.ZeroAddress);
    });
    
    it("Should only allow owner to authorize upgrades", async function () {
      // This test verifies the upgrade authorization mechanism
      // In a real scenario, you would deploy a new implementation
      const newImplementation = ethers.ZeroAddress; // Placeholder
      
      await expect(
        myTokenUpgradeable.connect(user1).upgradeToAndCall(newImplementation, "0x")
      ).to.be.revertedWithCustomError(myTokenUpgradeable, "OwnableUnauthorizedAccount");
    });
  });
  
  describe("HederaNFT (Hedera Token Service)", function () {
    it("Should deploy successfully", async function () {
      expect(await hederaNFT.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
    
    // Note: HederaNFT tests would require Hedera-specific testing environment
    // These tests are placeholders for the actual HTS integration tests
    
    it("Should have Hedera-specific functionality", async function () {
      // This would test HTS-specific features when running on Hedera network
      // For now, we just verify the contract deployed successfully
      expect(await hederaNFT.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
  });
  
  describe("Cross-Contract Interactions", function () {
    it("Should handle multiple contract deployments", async function () {
      // Verify all contracts are deployed and have different addresses
      const addresses = [
        await myToken.getAddress(),
        await myTokenAdvanced.getAddress(),
        await myTokenUpgradeable.getAddress(),
        await hederaNFT.getAddress()
      ];
      
      // All addresses should be unique
      const uniqueAddresses = [...new Set(addresses)];
      expect(uniqueAddresses.length).to.equal(4);
      
      // All addresses should be valid
      addresses.forEach(address => {
        expect(address).to.not.equal(ethers.ZeroAddress);
      });
    });
    
    it("Should maintain independent state across contracts", async function () {
      // Mint tokens in different contracts
      await myToken.safeMint(user1.address);
      await myTokenAdvanced.safeMint(user1.address, "https://example.com/token/1");
      await myTokenUpgradeable.safeMint(user1.address);
      
      // Each contract should have independent balances
      expect(await myToken.balanceOf(user1.address)).to.equal(1);
      expect(await myTokenAdvanced.balanceOf(user1.address)).to.equal(1);
      expect(await myTokenUpgradeable.balanceOf(user1.address)).to.equal(1);
      
      // Total supplies should be independent
      expect(await myToken.totalSupply()).to.equal(1);
      expect(await myTokenAdvanced.totalSupply()).to.equal(1);
      expect(await myTokenUpgradeable.totalSupply()).to.equal(1);
    });
  });
  
  describe("Gas Optimization Tests", function () {
    it("Should have reasonable gas costs for minting", async function () {
      // Test gas costs for different contract types
      const tx1 = await myToken.safeMint(user1.address);
      const receipt1 = await tx1.wait();
      
      const tx2 = await myTokenAdvanced.safeMint(user1.address, "https://example.com/token/1");
      const receipt2 = await tx2.wait();
      
      const tx3 = await myTokenUpgradeable.safeMint(user1.address);
      const receipt3 = await tx3.wait();
      
      // Log gas usage for analysis
      console.log(`MyToken mint gas: ${receipt1.gasUsed}`);
      console.log(`MyTokenAdvanced mint gas: ${receipt2.gasUsed}`);
      console.log(`MyTokenUpgradeable mint gas: ${receipt3.gasUsed}`);
      
      // Basic sanity checks - gas should be reasonable
      expect(receipt1.gasUsed).to.be.lessThan(200000);
      expect(receipt2.gasUsed).to.be.lessThan(300000);
      expect(receipt3.gasUsed).to.be.lessThan(250000);
    });
  });
});