// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";

contract HederaNFT is HederaTokenService {
    address public tokenAddress;
    address public owner;
    
    event NFTCreated(address tokenAddress);
    event NFTMinted(address to, uint256 serialNumber);
    event NFTTransferred(address to, uint256 serialNumber);
    event NFTBurned(uint256 serialNumber);
    event KYCGranted(address account);
    event KYCRevoked(address account);
    event TokenPaused();
    event TokenUnpaused();
    event AccountFrozen(address account);
    event AccountUnfrozen(address account);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function createNFT(
        string memory name,
        string memory symbol,
        string memory memo
    ) external payable onlyOwner {
        // Create the royalty fee
        IHederaTokenService.RoyaltyFee[] memory royaltyFees =
            new IHederaTokenService.RoyaltyFee[](1);
        royaltyFees[0] = IHederaTokenService.RoyaltyFee({
            numerator: 1,
            denominator: 10,
            amount: 100000000,  // Fallback fee of 1 HBAR in tinybars
            tokenId: address(0),
            useHbarsForPayment: true,
            feeCollector: owner
        });

        // Create fixed fees array (empty for this example)
        IHederaTokenService.FixedFee[] memory fixedFees =
            new IHederaTokenService.FixedFee[](0);

        // Create the token definition
        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.memo = memo;
        token.treasury = address(this);

        // Set the supply key (the contract itself)
        IHederaTokenService.TokenKey[] memory keys =
            new IHederaTokenService.TokenKey[](3);
        keys[0] = getSingleKey(
            IHederaTokenService.KeyType.SUPPLY,
            IHederaTokenService.KeyValueType.CONTRACT_ID,
            address(this)
        );
        keys[1] = getSingleKey(
            IHederaTokenService.KeyType.KYC,
            IHederaTokenService.KeyValueType.CONTRACT_ID,
            address(this)
        );
        keys[2] = getSingleKey(
            IHederaTokenService.KeyType.PAUSE,
            IHederaTokenService.KeyValueType.CONTRACT_ID,
            address(this)
        );
        token.tokenKeys = keys;

        (int responseCode, address createdToken) =
            createNonFungibleTokenWithCustomFees(token, fixedFees, royaltyFees);

        require(
            responseCode == HederaResponseCodes.SUCCESS,
            "Failed to create NFT"
        );

        tokenAddress = createdToken;
        emit NFTCreated(createdToken);
    }
    
    function mintNFT(bytes[] memory metadata) external onlyOwner returns (uint256[] memory) {
        require(tokenAddress != address(0), "Token not created yet");
        
        (int response, , uint256[] memory serialNumbers) = mintToken(tokenAddress, 0, metadata);
        require(response == HederaResponseCodes.SUCCESS, "Failed to mint NFT");
        
        for (uint i = 0; i < serialNumbers.length; i++) {
            emit NFTMinted(address(this), serialNumbers[i]);
        }
        
        return serialNumbers;
    }
    
    function transferNFT(address receiver, uint256 serialNumber) external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        
        int response = transferNFT(tokenAddress, address(this), receiver, serialNumber);
        require(response == HederaResponseCodes.SUCCESS, "Failed to transfer NFT");
        
        emit NFTTransferred(receiver, serialNumber);
    }
    
    function burnNFT(uint256 serialNumber) external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        
        uint256[] memory serialNumbers = new uint256[](1);
        serialNumbers[0] = serialNumber;
        
        (int response, uint256 newTotalSupply) = burnToken(tokenAddress, 0, serialNumbers);
        require(response == HederaResponseCodes.SUCCESS, "Failed to burn NFT");
        
        emit NFTBurned(serialNumber);
    }
    
    function grantKYC(address account) external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        int response = grantTokenKyc(tokenAddress, account);
        require(response == HederaResponseCodes.SUCCESS, "Failed to grant KYC");
        emit KYCGranted(account);
    }
    
    function revokeKYC(address account) external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        int response = revokeTokenKyc(tokenAddress, account);
        require(response == HederaResponseCodes.SUCCESS, "Failed to revoke KYC");
        emit KYCRevoked(account);
    }
    
    function pauseToken() external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        int response = pauseToken(tokenAddress);
        require(response == HederaResponseCodes.SUCCESS, "Failed to pause token");
        emit TokenPaused();
    }
    
    function unpauseToken() external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        int response = unpauseToken(tokenAddress);
        require(response == HederaResponseCodes.SUCCESS, "Failed to unpause token");
        emit TokenUnpaused();
    }
    
    function freezeAccount(address account) external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        int response = freezeToken(tokenAddress, account);
        require(response == HederaResponseCodes.SUCCESS, "Failed to freeze account");
        emit AccountFrozen(account);
    }
    
    function unfreezeAccount(address account) external onlyOwner {
        require(tokenAddress != address(0), "Token not created yet");
        int response = unfreezeToken(tokenAddress, account);
        require(response == HederaResponseCodes.SUCCESS, "Failed to unfreeze account");
        emit AccountUnfrozen(account);
    }
    
    function getSingleKey(
        IHederaTokenService.KeyType keyType,
        IHederaTokenService.KeyValueType keyValueType,
        address keyValue
    ) internal pure returns (IHederaTokenService.TokenKey memory) {
        IHederaTokenService.KeyValue memory keyValueObj = IHederaTokenService.KeyValue({
            inheritAccountKey: false,
            contractId: keyValue,
            ed25519: new bytes(0),
            ECDSA_secp256k1: new bytes(0),
            delegatableContractId: address(0)
        });
        
        return IHederaTokenService.TokenKey({
            keyType: keyType,
            key: keyValueObj
        });
    }
}