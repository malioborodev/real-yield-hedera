// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Removed Counters and SafeMath imports as they're deprecated/unnecessary in OpenZeppelin v5

// Mock HTS Token Interface (simplified for demonstration)
interface IHederaTokenService {
    function transferToken(address token, address sender, address receiver, int64 amount) external returns (int32);
    function transferNFT(address token, address sender, address receiver, int64 serialNumber) external returns (int32);
    function associateTokens(address account, address[] memory tokens) external returns (int32);
    function dissociateTokens(address account, address[] memory tokens) external returns (int32);
    function mintToken(address token, uint64 amount, bytes[] memory metadata) external returns (int32, int64[] memory);
    function burnToken(address token, uint64 amount, int64[] memory serialNumbers) external returns (int32);
    function wipeTokenAccount(address token, address account, uint64 amount) external returns (int32);
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function setApprovalForAll(address operator, bool approved) external;
    function approve(address to, uint256 tokenId) external;
}

// Mock Hedera Smart Contract Service (simplified for demonstration)
interface IHederaSmartContractService {
    function getContractInfo(address contractAddress) external view returns (bytes memory);
    function callContract(address contractAddress, uint64 gas, uint256 value, bytes memory functionParameters) external returns (bytes memory);
}

contract RealYieldInvoiceFactoring is ERC721, Ownable {
    uint256 private _invoiceIds;

    struct Invoice {
        uint256 id;
        address exporter;
        address importer; // Represents the buyer of the goods/services
        string commodity;
        uint256 faceValue; // Total value of the invoice in USDC (or equivalent stablecoin)
        uint256 tenor; // Payment term in days
        uint256 pd; // Probability of Default (0-100, representing 0-100%)
        uint256 collateralAmount; // HBAR collateral provided by the exporter
        address htsTokenId; // HTS Token ID for the NFT representing the invoice
        int64 htsSerialNumber; // Serial number of the minted NFT
        address hcsTopicId; // Hedera Consensus Service Topic ID for data feeds
        uint256 createdAt;
        uint256 fundedAt;
        uint256 settledAt;
        bool isFunded;
        bool isSettled;
        bool collateralReleased;
    }

    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public exporterInvoices; // Exporter's list of invoices
    mapping(address => uint256) public stakedCollateral; // Tracks HBAR staked by exporters

    // Hedera services addresses (mock for now)
    address public HTS_CONTRACT_ID;
    address public HCS_CONTRACT_ID;
    address public INSURANCE_POOL_CONTRACT_ID; // Address of the InsurancePool contract

    // Fees
    uint256 public constant RESERVE_FEE_BASIS_POINTS = 20; // 0.2%
    uint256 public constant PLATFORM_FEE_BASIS_POINTS = 20; // 0.2%
    uint256 public constant COLLATERAL_PERCENTAGE_BASIS_POINTS = 500; // 5%

    event InvoiceCreated(uint256 indexed invoiceId, address indexed exporter, uint256 faceValue, uint256 tenor, uint256 collateralAmount, address htsTokenId, int64 htsSerialNumber);
    event InvoiceFunded(uint256 indexed invoiceId, address indexed funder, uint256 amount);
    event InvoiceSettled(uint256 indexed invoiceId, uint256 actualPayout);
    event CollateralReleased(uint256 indexed invoiceId, address indexed exporter, uint256 amount);
    event HBARStaked(address indexed account, uint256 amount);
    event HBARUnstaked(address indexed account, uint256 amount);

    constructor(address _htsContractId, address _hcsContractId, address _insurancePoolContractId) ERC721("RealYieldInvoiceNFT", "RYIN") Ownable(msg.sender) {
        require(_htsContractId != address(0), "HTS contract address cannot be zero");
        require(_hcsContractId != address(0), "HCS contract address cannot be zero");
        require(_insurancePoolContractId != address(0), "Insurance Pool contract address cannot be zero");
        HTS_CONTRACT_ID = _htsContractId;
        HCS_CONTRACT_ID = _hcsContractId;
        INSURANCE_POOL_CONTRACT_ID = _insurancePoolContractId;
    }

    // Admin function to update HTS/HCS/Insurance Pool contract IDs
    function setHederaServiceContracts(address _htsContractId, address _hcsContractId, address _insurancePoolContractId) public onlyOwner {
        require(_htsContractId != address(0), "HTS contract address cannot be zero");
        require(_hcsContractId != address(0), "HCS contract address cannot be zero");
        require(_insurancePoolContractId != address(0), "Insurance Pool contract address cannot be zero");
        HTS_CONTRACT_ID = _htsContractId;
        HCS_CONTRACT_ID = _hcsContractId;
        INSURANCE_POOL_CONTRACT_ID = _insurancePoolContractId;
    }

    /**
     * @dev Allows an exporter to stake HBAR as collateral.
     * This HBAR is held by the contract and can be used for invoice collateral.
     */
    function stakeHBAR() public payable {
        require(msg.value > 0, "Amount to stake must be greater than zero");
        stakedCollateral[msg.sender] = stakedCollateral[msg.sender] + msg.value;
        emit HBARStaked(msg.sender, msg.value);
    }

    /**
     * @dev Allows an exporter to unstake HBAR that is not currently locked as collateral.
     */
    function unstakeHBAR(uint256 amount) public {
        require(stakedCollateral[msg.sender] >= amount, "Insufficient staked HBAR");
        // In a real system, we'd need to ensure this amount isn't part of active collateral
        // For this mock, we assume any unstake request is for free HBAR.
        stakedCollateral[msg.sender] = stakedCollateral[msg.sender] - amount;
        payable(msg.sender).transfer(amount);
        emit HBARUnstaked(msg.sender, amount);
    }

    /**
     * @dev Creates a new invoice and mints an HTS NFT for it.
     * Exporter must have sufficient HBAR staked to cover the collateral.
     */
    function createInvoice(
        address _importer,
        string memory _commodity,
        uint256 _faceValue,
        uint256 _tenor,
        uint256 _pd,
        address _htsTokenId,
        address _hcsTopicId
    ) public returns (uint256) {
        require(_faceValue > 0, "Face value must be greater than zero");
        require(_tenor > 0, "Tenor must be greater than zero");
        require(_pd <= 100, "PD must be between 0 and 100");
        require(_htsTokenId != address(0), "HTS Token ID cannot be zero");
        require(_hcsTopicId != address(0), "HCS Topic ID cannot be zero");

        uint256 requiredCollateral = _faceValue * COLLATERAL_PERCENTAGE_BASIS_POINTS / 10000;
        require(stakedCollateral[msg.sender] >= requiredCollateral, "Insufficient staked HBAR for collateral");

        _invoiceIds++;
        uint256 newInvoiceId = _invoiceIds;

        // Simulate locking collateral from staked balance
        stakedCollateral[msg.sender] = stakedCollateral[msg.sender] - requiredCollateral;

        // Simulate HTS NFT minting
        // In a real scenario, this would interact with the Hedera Token Service precompile
        // For now, we just assign a mock serial number.
        int64 mintedSerialNumber = int64(uint64(newInvoiceId)); // Mock serial number

        Invoice storage newInvoice = invoices[newInvoiceId];
        newInvoice.id = newInvoiceId;
        newInvoice.exporter = msg.sender;
        newInvoice.importer = _importer;
        newInvoice.commodity = _commodity;
        newInvoice.faceValue = _faceValue;
        newInvoice.tenor = _tenor;
        newInvoice.pd = _pd;
        newInvoice.collateralAmount = requiredCollateral;
        newInvoice.htsTokenId = _htsTokenId;
        newInvoice.htsSerialNumber = mintedSerialNumber;
        newInvoice.hcsTopicId = _hcsTopicId;
        newInvoice.createdAt = block.timestamp;
        newInvoice.isFunded = false;
        newInvoice.isSettled = false;
        newInvoice.collateralReleased = false;

        _mint(msg.sender, newInvoiceId); // Mint ERC721 to the exporter

        exporterInvoices[msg.sender].push(newInvoiceId);

        emit InvoiceCreated(newInvoiceId, msg.sender, _faceValue, _tenor, requiredCollateral, _htsTokenId, mintedSerialNumber);

        return newInvoiceId;
    }

    /**
     * @dev Allows an investor to fund an invoice.
     * The investor sends the buy price in USDC (or equivalent stablecoin).
     * The exporter receives the buy price.
     * Reserve and platform fees are sent to respective pools.
     */
    function fundInvoice(uint256 _invoiceId, uint256 _amountUSDC) public {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.id != 0, "Invoice does not exist");
        require(!invoice.isFunded, "Invoice already funded");
        require(msg.sender != invoice.exporter, "Exporter cannot fund their own invoice");

        // Calculate fees and buy price based on the formula
        uint256 discountRate = calculateDiscountRate(invoice.pd, invoice.tenor); // Assuming this function exists or is in JS
        uint256 reserveFeeAmount = invoice.faceValue * RESERVE_FEE_BASIS_POINTS / 10000;
        uint256 platformFeeAmount = invoice.faceValue * PLATFORM_FEE_BASIS_POINTS / 10000;
        uint256 expectedBuyPrice = invoice.faceValue - (invoice.faceValue * discountRate / 10000) - reserveFeeAmount - platformFeeAmount;

        require(_amountUSDC >= expectedBuyPrice, "Amount sent is less than the required buy price");

        // Simulate USDC transfer (in a real scenario, this would be an actual token transfer)
        // For now, we assume _amountUSDC is transferred to this contract, and then distributed.
        // Transfer buy price to exporter
        // payable(invoice.exporter).transfer(expectedBuyPrice); // This would be USDC transfer

        // Transfer reserve fee to Insurance Pool
        // payable(INSURANCE_POOL_CONTRACT_ID).transfer(reserveFeeAmount); // This would be USDC transfer

        // Transfer platform fee to platform owner
        // payable(owner()).transfer(platformFeeAmount); // This would be USDC transfer

        invoice.isFunded = true;
        invoice.fundedAt = block.timestamp;

        // Transfer NFT ownership to the funder
        _transfer(invoice.exporter, msg.sender, _invoiceId);

        emit InvoiceFunded(_invoiceId, msg.sender, _amountUSDC);
    }

    /**
     * @dev Allows the platform admin to release exporter collateral after invoice settlement.
     * This is a simplified version for demonstration. In a real system, settlement would be automated.
     */
    function releaseCollateral(uint256 _invoiceId) public onlyOwner {
        Invoice storage invoice = invoices[_invoiceId];
        require(invoice.id != 0, "Invoice does not exist");
        require(invoice.isFunded, "Invoice not yet funded");
        require(!invoice.collateralReleased, "Collateral already released");
        // In a real system, this would check if the invoice is actually settled on-chain
        // For mock, we assume it's settled if this function is called by owner.

        require(stakedCollateral[invoice.exporter] + invoice.collateralAmount <= type(uint256).max, "Overflow in collateral release");
        stakedCollateral[invoice.exporter] = stakedCollateral[invoice.exporter] + invoice.collateralAmount;
        invoice.collateralReleased = true;

        emit CollateralReleased(_invoiceId, invoice.exporter, invoice.collateralAmount);
    }

    // Helper function to calculate discount rate (simplified for Solidity)
    // In a real scenario, PD would come from an oracle or a more complex AI model.
    function calculateDiscountRate(uint256 _pd, uint256 _tenor) internal pure returns (uint256) {
        uint256 d_min = 60; // 0.6% * 10000
        uint256 d_max = 800; // 8.0% * 10000
        
        // Scale PD from 0-100 to 0-10000 for basis points calculation
        uint256 scaledPd = _pd * 100; // PD is 0-100, scale to 0-10000

        // d = d_min + (d_max - d_min) * PD / 10000 (since PD is scaled to 10000)
        uint256 discountRate = d_min + ((d_max - d_min) * scaledPd / 10000);
        
        return discountRate; // Returns in basis points (e.g., 100 = 1%)
    }

    // Fallback function to receive HBAR
    receive() external payable {}
    fallback() external payable {}
}
