import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type { Chain } from 'viem';
import * as dotenv from 'dotenv';
dotenv.config();

// --- CONFIG ---
const FLOW_EVM_RPC_URL = process.env.FLOWEVM_RPC || 'https://testnet.evm.nodes.onflow.org/';
const PRIVATE_KEY = process.env.DEPLOY_WALLET as `0x${string}`; // Set your deployer private key in .env
const CONTRACT_ADDRESS = '0x79C167404fA6CBDe1f23BE565355723136a8C4c1';
const RECIPIENT = process.env.TEST_ACCOUNT;
const MINT_AMOUNT = '1000000'; // 1 USDC (6 decimals)

// --- ABI ---
const abi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
];

// --- Chain ---
const flowTestnet: Chain = {
  id: 545, // Flow EVM testnet chainId
  name: 'Flow EVM Testnet',
  nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: { http: [FLOW_EVM_RPC_URL] },
    public: { http: [FLOW_EVM_RPC_URL] },
  },
};

async function main() {
  if (!PRIVATE_KEY) throw new Error('DEPLOY_WALLET is not set in .env');

  const account = privateKeyToAccount(PRIVATE_KEY);
  const walletClient = createWalletClient({
    account,
    chain: flowTestnet,
    transport: http(),
  });

  // Amount in 6 decimals (e.g., 1 USDC = 1_000_000)
  const amount = parseUnits(MINT_AMOUNT, 6);

  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: 'mint',
    args: [RECIPIENT, amount],
  });
  console.log('Mint tx sent! Hash:', hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
