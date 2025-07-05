// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract InstallmentLoan {
    using SafeERC20 for IERC20;

    struct Loan {
        address lender;
        address borrower;
        uint256 principal;
        uint256 installmentAmount;
        uint256 totalInstallments;
        uint256 installmentsPaid;
        uint256 startTimestamp;
        uint256 installmentInterval;
        address token;
        bool active;
    }

    uint256 public loanCounter;
    mapping(uint256 => Loan) public loans;

    event LoanCreated(
        uint256 indexed loanId,
        address indexed lender,
        address indexed borrower,
        uint256 principal,
        uint256 installmentAmount,
        uint256 totalInstallments,
        uint256 startTimestamp,
        uint256 installmentInterval,
        address token
    );

    event InstallmentCollected(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 installmentNumber,
        uint256 amount,
        uint256 timestamp
    );

    event LoanCompleted(uint256 indexed loanId);

    event InstallmentFailed(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 installmentNumber,
        string reason
    );

    /**
     * @notice Create a new loan agreement
     * @param borrower The address of the borrower
     * @param principal The total amount to be lent (e.g. 1000 USDC)
     * @param installmentAmount The amount for each installment (e.g. 100 USDC)
     * @param totalInstallments The total number of installments (e.g. 10)
     * @param installmentInterval The interval between installments in seconds (e.g. 1 week = 604800)
     * @param token The ERC20 token address (USDC)
     */
    function createLoan(
        address borrower,
        uint256 principal,
        uint256 installmentAmount,
        uint256 totalInstallments,
        uint256 installmentInterval,
        address token
    ) external returns (uint256) {
        require(borrower != address(0), "Invalid borrower");
        require(principal > 0, "Principal must be > 0");
        require(installmentAmount > 0, "Installment must be > 0");
        require(totalInstallments > 0, "Installments must be > 0");
        require(principal == installmentAmount * totalInstallments, "Principal must equal total installments");
        require(token != address(0), "Invalid token address");

        // Transfer principal from lender to borrower
        IERC20 usdc = IERC20(token);
        uint256 allowance = usdc.allowance(msg.sender, address(this));
        require(allowance >= principal, "Insufficient allowance for principal");
        uint256 balance = usdc.balanceOf(msg.sender);
        require(balance >= principal, "Lender has insufficient balance");
        usdc.safeTransferFrom(msg.sender, borrower, principal);

        require(borrower != address(0), "Invalid borrower");
        require(principal > 0, "Principal must be > 0");
        require(installmentAmount > 0, "Installment must be > 0");
        require(totalInstallments > 0, "Installments must be > 0");
        require(principal == installmentAmount * totalInstallments, "Principal must equal total installments");
        require(token != address(0), "Invalid token address");

        loanCounter++;
        loans[loanCounter] = Loan({
            lender: msg.sender,
            borrower: borrower,
            principal: principal,
            installmentAmount: installmentAmount,
            totalInstallments: totalInstallments,
            installmentsPaid: 0,
            startTimestamp: block.timestamp,
            installmentInterval: installmentInterval,
            token: token,
            active: true
        });

        emit LoanCreated(
            loanCounter,
            msg.sender,
            borrower,
            principal,
            installmentAmount,
            totalInstallments,
            block.timestamp,
            installmentInterval,
            token
        );
        return loanCounter;
    }

    /**
     * @notice Collect the next installment for a loan if due
     * @param loanId The ID of the loan
     */
    function collectInstallment(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.installmentsPaid < loan.totalInstallments, "All installments paid");

        uint256 nextDue = loan.startTimestamp + loan.installmentInterval * loan.installmentsPaid;
        require(block.timestamp >= nextDue, "Installment not due yet");

        IERC20 usdc = IERC20(loan.token);
        uint256 allowance = usdc.allowance(loan.borrower, address(this));
        uint256 balance = usdc.balanceOf(loan.borrower);

        if (allowance < loan.installmentAmount) {
            emit InstallmentFailed(loanId, loan.borrower, loan.installmentsPaid + 1, "Insufficient allowance");
            revert("Insufficient allowance");
        }
        if (balance < loan.installmentAmount) {
            emit InstallmentFailed(loanId, loan.borrower, loan.installmentsPaid + 1, "Insufficient balance");
            revert("Insufficient balance");
        }

        // Transfer funds from borrower to lender
        usdc.safeTransferFrom(loan.borrower, loan.lender, loan.installmentAmount);
        loan.installmentsPaid++;

        emit InstallmentCollected(
            loanId,
            loan.borrower,
            loan.installmentsPaid,
            loan.installmentAmount,
            block.timestamp
        );

        if (loan.installmentsPaid == loan.totalInstallments) {
            loan.active = false;
            emit LoanCompleted(loanId);
        }
    }
}

