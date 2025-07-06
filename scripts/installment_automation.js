import { createPublicClient, createWalletClient, http, parseAbi, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// === CONFIGURATION ===
const RPC_URL = process.env.FLOWEVM_RPC || 'https://testnet.flowevm.nodes.onflow.org/'; // Flow EVM testnet
const CONTRACT_ADDRESS = '0xFeDBf40871a7A48a035F43B5B2dB5cDcf2405D40';
const ABI_PATH = './artifacts/contracts/InstallmentLoan.sol/InstallmentLoan.json';
const TEST_ACCOUNT_PRIVATE_KEY = process.env.TEST_ACCOUNT_PRIVATE_KEY;

if (!TEST_ACCOUNT_PRIVATE_KEY) {
  throw new Error('TEST_ACCOUNT_PRIVATE_KEY not set in .env');
}

// Load ABI
const abiJson = JSON.parse(fs.readFileSync(ABI_PATH));
const abi = abiJson.abi;

const publicClient = createPublicClient({
  chain: {
    id: 545,
    name: 'Flow EVM Testnet',
    network: 'flowevmtestnet',
    nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
    blockExplorers: [],
  },
  transport: http(RPC_URL),
});

const account = privateKeyToAccount(TEST_ACCOUNT_PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: publicClient.chain,
  transport: http(RPC_URL),
});

const LOAN_IDS = [1]; // Update as needed

async function checkAndCollect() {
  for (const loanId of LOAN_IDS) {
    try {
      // Read loan details
      const loan = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'loans',
        args: [loanId],
      });
      if (!loan.active) {
        console.log(`Loan ${loanId} is not active.`);
        continue;
      }
      const now = Math.floor(Date.now() / 1000);
      const nextDue = Number(loan.startTimestamp) + Number(loan.installmentInterval) * Number(loan.installmentsPaid);
      const DUE_BUFFER = 10; // seconds
      if (now < nextDue + DUE_BUFFER) {
        console.log(`Loan ${loanId}: Next installment not due yet (buffered).`);
        continue;
      }
      // Call collectInstallment without pre-checks; contract will revert if not allowed
      console.log(`Calling collectInstallment for loan ${loanId}...`);
      try {
        const hash = await walletClient.sendTransaction({
          to: CONTRACT_ADDRESS,
          data: encodeFunctionData({ abi, functionName: 'collectInstallment', args: [loanId] }),
          account,
        });
        console.log(`Tx sent for loan ${loanId}:`, hash);
      } catch (err) {
        console.error(`collectInstallment failed for loan ${loanId}:`, err.shortMessage || err.message);
      }
    } catch (err) {
      console.error(`Error processing loan ${loanId}:`, err.shortMessage || err.message);
    }
  }
}

// Run every 60 seconds
setInterval(checkAndCollect, 60 * 1000);

console.log('Installment automation bot started.');
