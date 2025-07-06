import { createPublicClient, createWalletClient, http, parseUnits, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import InstallmentLoanArtifact from '../artifacts/contracts/InstallmentLoan.sol/InstallmentLoan.json';
import MockUSDCArtifact from '../artifacts/contracts/MockUSDC.sol/MockUSDC.json';
dotenv.config();

const flow = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  network: 'flowevmtestnet',
  nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.FLOWEVM_RPC || ''] },
    public: { http: [process.env.FLOWEVM_RPC || ''] },
  },
});

const INSTALLMENT_LOAN_ADDRESS = '0xFeDBf40871a7A48a035F43B5B2dB5cDcf2405D40';
const MOCK_USDC_ADDRESS = '0x79C167404fA6CBDe1f23BE565355723136a8C4c1';

const BORROWER_PRIVATE_KEY = process.env.BORROWER_WALLET as `0x${string}`;
const LENDER_PRIVATE_KEY = process.env.LENDER_WALLET as `0x${string}`;

const rpcUrl = process.env.FLOWEVM_RPC;

if (!rpcUrl || !BORROWER_PRIVATE_KEY || !LENDER_PRIVATE_KEY) {
  throw new Error('FLOWEVM_RPC, BORROWER_WALLET, or LENDER_WALLET not set in environment');
}

describe('InstallmentLoan', function () {
  this.timeout(120000); // 2 minutes

  let borrowerAccount: any;
  let lenderAccount: any;
  let publicClient: any;
  let borrowerClient: any;
  let lenderClient: any;
  let installmentLoan: any;
  let mockUSDC: any;

  before(async () => {
    borrowerAccount = privateKeyToAccount(BORROWER_PRIVATE_KEY);
    lenderAccount = privateKeyToAccount(LENDER_PRIVATE_KEY);
    publicClient = createPublicClient({ chain: flow, transport: http(rpcUrl) });
    borrowerClient = createWalletClient({ account: borrowerAccount, chain: flow, transport: http(rpcUrl) });
    lenderClient = createWalletClient({ account: lenderAccount, chain: flow, transport: http(rpcUrl) });
    installmentLoan = { address: INSTALLMENT_LOAN_ADDRESS, abi: InstallmentLoanArtifact.abi };
    mockUSDC = { address: MOCK_USDC_ADDRESS, abi: MockUSDCArtifact.abi };
  });

  it('should create a loan and pay installments', async () => {
    // Mint 1000 USDC to borrower if not already minted
    // Approve InstallmentLoan contract to spend borrower's USDC
    const approveHash = await borrowerClient.writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: MockUSDCArtifact.abi,
      functionName: 'approve',
      args: [INSTALLMENT_LOAN_ADDRESS, parseUnits('1000', 6)],
      chain: flow,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    // Lender approves InstallmentLoan contract to spend principal (100 USDC)
    const principal = parseUnits('100', 6); // 100 USDC
    const approveLenderHash = await lenderClient.writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: MockUSDCArtifact.abi,
      functionName: 'approve',
      args: [INSTALLMENT_LOAN_ADDRESS, principal],
      chain: flow,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveLenderHash });

    const totalInstallments = 10;
    const installmentInterval = 5; // 5 seconds for faster testing

    const createLoanHash = await lenderClient.writeContract({
      address: INSTALLMENT_LOAN_ADDRESS,
      abi: InstallmentLoanArtifact.abi,
      functionName: 'createLoan',
      args: [
        borrowerAccount.address,
        principal,
        totalInstallments,
        installmentInterval,
        MOCK_USDC_ADDRESS,
      ],
      chain: flow,
    });
    const createLoanReceipt = await publicClient.waitForTransactionReceipt({ hash: createLoanHash });
    // For this test, we assume the first loan has ID 1
    // TODO: Parse event logs for dynamic loanId extraction if running multiple tests
    const loanId = 1;

    // Borrower pays first installment
    const payHash = await borrowerClient.writeContract({
      address: INSTALLMENT_LOAN_ADDRESS,
      abi: InstallmentLoanArtifact.abi,
      functionName: 'collectInstallment',
      args: [loanId],
      chain: flow,
    });
    await publicClient.waitForTransactionReceipt({ hash: payHash });

    // Wait 5 seconds and pay another installment
    await new Promise((resolve) => setTimeout(resolve, 6000)); // Wait just over 5 seconds
    const payHash2 = await borrowerClient.writeContract({
      address: INSTALLMENT_LOAN_ADDRESS,
      abi: InstallmentLoanArtifact.abi,
      functionName: 'collectInstallment',
      args: [loanId],
      chain: flow,
    });
    await publicClient.waitForTransactionReceipt({ hash: payHash2 });

    // Check borrower's and lender's USDC balances
    const borrowerBalance = await publicClient.readContract({
      address: MOCK_USDC_ADDRESS,
      abi: MockUSDCArtifact.abi,
      functionName: 'balanceOf',
      args: [borrowerAccount.address],
      chain: flow,
    });
    const lenderBalance = await publicClient.readContract({
      address: MOCK_USDC_ADDRESS,
      abi: MockUSDCArtifact.abi,
      functionName: 'balanceOf',
      args: [lenderAccount.address],
      chain: flow,
    });

    expect(borrowerBalance).to.be.a('bigint');
    expect(lenderBalance).to.be.a('bigint');
    // Optionally, check event logs for InstallmentCollected
  });
});
