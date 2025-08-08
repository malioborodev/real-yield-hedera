// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title InsurancePool
 * @dev Smart contract to manage the insurance pool for Real-Yield platform.
 *      It receives reserve fees from the main factoring contract and
 *      allows authorized parties to initiate payouts for defaulted invoices.
 */
contract InsurancePool {
    // Event to log when a payout for a defaulted invoice is initiated
    event PayoutInitiated(
        bytes32 indexed invoiceId,
        address indexed investor,
        uint256 amount
    );

    // The admin address, typically the platform owner or a multisig
    address public admin;

    // Mapping to track if a payout has already been made for a specific invoice
    mapping(bytes32 => bool) public hasPaidOut;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /**
     * @dev Constructor sets the admin address upon deployment.
     */
    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Fallback function to receive Ether (or native token like HBAR).
     *      This allows the RealYieldInvoiceFactoring contract to send reserve fees here.
     */
    receive() external payable {}
    fallback() external payable {}

    /**
     * @dev Allows the admin to initiate a payout to an investor for a defaulted invoice.
     *      This function assumes the default has been verified off-chain or by the main factoring contract.
     * @param _invoiceId The unique ID of the defaulted invoice.
     * @param _investor The address of the investor to be compensated.
     * @param _amount The amount to be paid out from the insurance pool.
     */
    function payoutDefault(
        bytes32 _invoiceId,
        address payable _investor,
        uint256 _amount
    ) public onlyAdmin {
        require(!hasPaidOut[_invoiceId], "Payout already made for this invoice");
        require(address(this).balance >= _amount, "Insufficient funds in insurance pool");
        require(_investor != address(0), "Invalid investor address");
        require(_amount > 0, "Payout amount must be greater than 0");

        hasPaidOut[_invoiceId] = true; // Mark this invoice as paid out

        // Transfer the compensation amount to the investor
        (bool sent, ) = _investor.call{value: _amount}("");
        require(sent, "Failed to send payout to investor");

        emit PayoutInitiated(_invoiceId, _investor, _amount);
    }

    /**
     * @dev Returns the current balance of the insurance pool.
     * @return The current balance in native token (e.g., HBAR).
     */
    function getPoolBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
