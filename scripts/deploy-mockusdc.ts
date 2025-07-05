import { createPublicClient, createWalletClient, http, parseUnits, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import MockUSDCArtifact from '../artifacts/contracts/MockUSDC.sol/MockUSDC.json';
dotenv.config();

// Define FlowEVM chain (update chainId if needed)
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

async function main() {
  // 1,000,000 USDC with 6 decimals
  const initialSupply = parseUnits('1000000', 6);

  const rpcUrl = process.env.FLOWEVM_RPC;
  const privateKey = process.env.DEPLOY_WALLET;
  if (!rpcUrl || !privateKey) {
    throw new Error('FLOWEVM_RPC or DEPLOY_WALLET not set in environment');
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const publicClient = createPublicClient({
    chain: flow,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain: flow,
    transport: http(rpcUrl),
  });

  const { abi, bytecode } = MockUSDCArtifact;

  // Deploy contract
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args: [initialSupply],
    chain: flow,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('MockUSDC deployed to:', receipt.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});