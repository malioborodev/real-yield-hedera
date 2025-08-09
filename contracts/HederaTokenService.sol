// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./HederaResponseCodes.sol";

abstract contract HederaTokenService {
    address constant precompileAddress = address(0x167);
    // 90 days in seconds
    int32 constant defaultAutoRenewPeriod = 7776000;

    modifier nonEmptyExpiry(IHederaTokenService.Expiry memory expiry) {
        require(
            expiry.second != 0 || expiry.autoRenewPeriod != 0,
            "Expiry cannot be empty"
        );
        _;
    }

    enum KeyType {
        ADMIN,
        KYC,
        FREEZE,
        WIPE,
        SUPPLY,
        FEE,
        PAUSE
    }

    enum KeyValueType {
        INHERIT_ACCOUNT_KEY,
        CONTRACT_ID,
        ED25519,
        SECP256K1,
        DELEGATABLE_CONTRACT_ID
    }

    function createFungibleToken(
        IHederaTokenService.HederaToken memory token,
        uint256 initialTotalSupply,
        uint256 decimals
    ) internal returns (int256 responseCode, address tokenAddress) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.createFungibleToken.selector,
                token,
                initialTotalSupply,
                decimals
            )
        );
        (responseCode, tokenAddress) = success
            ? abi.decode(result, (int256, address))
            : (int256(HederaResponseCodes.FAIL_INVALID), address(0));
    }

    function createNonFungibleToken(
        IHederaTokenService.HederaToken memory token
    ) internal returns (int256 responseCode, address tokenAddress) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.createNonFungibleToken.selector,
                token
            )
        );
        (responseCode, tokenAddress) = success
            ? abi.decode(result, (int256, address))
            : (int256(HederaResponseCodes.FAIL_INVALID), address(0));
    }

    function createNonFungibleTokenWithCustomFees(
        IHederaTokenService.HederaToken memory token,
        IHederaTokenService.FixedFee[] memory fixedFees,
        IHederaTokenService.RoyaltyFee[] memory royaltyFees
    ) internal returns (int256 responseCode, address tokenAddress) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.createNonFungibleTokenWithCustomFees.selector,
                token,
                fixedFees,
                royaltyFees
            )
        );
        (responseCode, tokenAddress) = success
            ? abi.decode(result, (int256, address))
            : (int256(HederaResponseCodes.FAIL_INVALID), address(0));
    }

    function mintToken(
        address token,
        uint256 amount,
        bytes[] memory metadata
    ) internal returns (int256 responseCode, uint256 newTotalSupply, uint256[] memory serialNumbers) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.mintToken.selector,
                token,
                amount,
                metadata
            )
        );
        (responseCode, newTotalSupply, serialNumbers) = success
            ? abi.decode(result, (int256, uint256, uint256[]))
            : (int256(HederaResponseCodes.FAIL_INVALID), 0, new uint256[](0));
    }

    function burnToken(
        address token,
        uint256 amount,
        uint256[] memory serialNumbers
    ) internal returns (int256 responseCode, uint256 newTotalSupply) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.burnToken.selector,
                token,
                amount,
                serialNumbers
            )
        );
        (responseCode, newTotalSupply) = success
            ? abi.decode(result, (int256, uint256))
            : (int256(HederaResponseCodes.FAIL_INVALID), 0);
    }

    function transferNFT(
        address token,
        address sender,
        address receiver,
        uint256 serialNumber
    ) internal returns (int256 responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.transferNFT.selector,
                token,
                sender,
                receiver,
                serialNumber
            )
        );
        responseCode = success
            ? abi.decode(result, (int256))
            : int256(HederaResponseCodes.FAIL_INVALID);
    }

    function grantTokenKyc(
        address token,
        address account
    ) internal returns (int256 responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.grantTokenKyc.selector,
                token,
                account
            )
        );
        responseCode = success
            ? abi.decode(result, (int256))
            : int256(HederaResponseCodes.FAIL_INVALID);
    }

    function revokeTokenKyc(
        address token,
        address account
    ) internal returns (int256 responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.revokeTokenKyc.selector,
                token,
                account
            )
        );
        responseCode = success
            ? abi.decode(result, (int256))
            : int256(HederaResponseCodes.FAIL_INVALID);
    }

    function pauseToken(
        address token
    ) internal returns (int256 responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.pauseToken.selector,
                token
            )
        );
        responseCode = success
            ? abi.decode(result, (int256))
            : int256(HederaResponseCodes.FAIL_INVALID);
    }

    function unpauseToken(
        address token
    ) internal returns (int256 responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.unpauseToken.selector,
                token
            )
        );
        responseCode = success
            ? abi.decode(result, (int256))
            : int256(HederaResponseCodes.FAIL_INVALID);
    }

    function freezeToken(
        address token,
        address account
    ) internal returns (int256 responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.freezeToken.selector,
                token,
                account
            )
        );
        responseCode = success
            ? abi.decode(result, (int256))
            : int256(HederaResponseCodes.FAIL_INVALID);
    }

    function unfreezeToken(
        address token,
        address account
    ) internal returns (int256 responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.unfreezeToken.selector,
                token,
                account
            )
        );
        responseCode = success
            ? abi.decode(result, (int256))
            : int256(HederaResponseCodes.FAIL_INVALID);
    }
}

interface IHederaTokenService {
    enum KeyType {
        ADMIN,
        KYC,
        FREEZE,
        WIPE,
        SUPPLY,
        FEE,
        PAUSE
    }

    enum KeyValueType {
        INHERIT_ACCOUNT_KEY,
        CONTRACT_ID,
        ED25519,
        SECP256K1,
        DELEGATABLE_CONTRACT_ID
    }

    struct TokenKey {
        KeyType keyType;
        KeyValue key;
    }

    struct KeyValue {
        bool inheritAccountKey;
        address contractId;
        bytes ed25519;
        bytes ECDSA_secp256k1;
        address delegatableContractId;
    }

    struct Expiry {
        uint256 second;
        address autoRenewAccount;
        uint256 autoRenewPeriod;
    }

    struct HederaToken {
        string name;
        string symbol;
        address treasury;
        string memo;
        bool tokenSupplyType;
        uint256 maxSupply;
        bool freezeDefault;
        TokenKey[] tokenKeys;
        Expiry expiry;
    }

    struct FixedFee {
        uint256 amount;
        address tokenId;
        bool useHbarsForPayment;
        bool useCurrentTokenForPayment;
        address feeCollector;
    }

    struct FractionalFee {
        uint256 numerator;
        uint256 denominator;
        uint256 minimumAmount;
        uint256 maximumAmount;
        bool netOfTransfers;
        address feeCollector;
    }

    struct RoyaltyFee {
        uint256 numerator;
        uint256 denominator;
        uint256 amount;
        address tokenId;
        bool useHbarsForPayment;
        address feeCollector;
    }

    function createFungibleToken(
        HederaToken memory token,
        uint256 initialTotalSupply,
        uint256 decimals
    ) external returns (int256 responseCode, address tokenAddress);

    function createNonFungibleToken(
        HederaToken memory token
    ) external returns (int256 responseCode, address tokenAddress);

    function createNonFungibleTokenWithCustomFees(
        HederaToken memory token,
        FixedFee[] memory fixedFees,
        RoyaltyFee[] memory royaltyFees
    ) external returns (int256 responseCode, address tokenAddress);

    function mintToken(
        address token,
        uint256 amount,
        bytes[] memory metadata
    ) external returns (int256 responseCode, uint256 newTotalSupply, uint256[] memory serialNumbers);

    function burnToken(
        address token,
        uint256 amount,
        uint256[] memory serialNumbers
    ) external returns (int256 responseCode, uint256 newTotalSupply);

    function transferNFT(
        address token,
        address sender,
        address receiver,
        uint256 serialNumber
    ) external returns (int256 responseCode);

    function grantTokenKyc(
        address token,
        address account
    ) external returns (int256 responseCode);

    function revokeTokenKyc(
        address token,
        address account
    ) external returns (int256 responseCode);

    function pauseToken(
        address token
    ) external returns (int256 responseCode);

    function unpauseToken(
        address token
    ) external returns (int256 responseCode);

    function freezeToken(
        address token,
        address account
    ) external returns (int256 responseCode);

    function unfreezeToken(
        address token,
        address account
    ) external returns (int256 responseCode);
}