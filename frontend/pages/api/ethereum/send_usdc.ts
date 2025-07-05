import type { NextApiRequest, NextApiResponse } from "next";
import { encodeFunctionData, erc20Abi } from "viem";
import {
  APIError,
  fetchAndVerifyAuthorization,
  createPrivyClient,
  getUserByEmail,
} from "../../../lib/utils";
import { useSendTransaction } from "@privy-io/react-auth";

const client = createPrivyClient();

/**
 * POST /api/ethereum/send_usdc
 *
 * Body params:
 * - sender_wallet_id: string (wallet ID of authenticated user)
 * - recipient_email: string (email of recipient user)
 * - amount: number (human readable USDC amount, e.g. 12.34)
 * - chain_id: number (EIP-155 chain ID, e.g. 42161 for Arbitrum)
 * - usdc_contract: string (optional – defaults will be used per chain)
 */
export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<{ txHash: string } | APIError>
) {
  const errorOrVerifiedClaims = await fetchAndVerifyAuthorization(
    req,
    res,
    client
  );
  const authorized = errorOrVerifiedClaims && "appId" in errorOrVerifiedClaims;
  if (!authorized) return errorOrVerifiedClaims;

  const { sender_wallet_id, recipient_email, amount, chain_id, usdc_contract } =
    req.body || {};

  if (!sender_wallet_id || !recipient_email || !amount || !chain_id) {
    return res.status(400).json({
      error:
        "sender_wallet_id, recipient_email, amount and chain_id are required",
    });
  }

  try {
    // 1. Resolve recipient wallet address
    const recipientUser = await getUserByEmail(recipient_email);

    if (!recipientUser) {
      return res.status(404).json({ error: "Recipient user not found" });
    }

    const recipientAddress: string | undefined = recipientUser?.wallet?.address;

    if (!recipientAddress) {
      return res.status(400).json({
        error: "Recipient does not have an Ethereum wallet linked",
      });
    }

    // 2. Build transaction data for USDC transfer
    const amountBigInt = BigInt(Math.round(amount * 10 ** 6));

    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipientAddress as `0x${string}`, amountBigInt],
    });

    // Determine USDC contract address
    const contractAddress = getDefaultUsdcAddress(chain_id);

    const { sendTransaction } = useSendTransaction();

    sendTransaction({
      from: sender_wallet_id,
      to: contractAddress,
      data,
    });

    return res.status(200).json({ txHash: hash });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: (error as Error).message,
      cause: (error as Error).stack,
    });
  }
}

// Basic mapping of common chain IDs to USDC contract addresses.
const USDC_ADDRESSES: Record<number, string> = {
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum mainnet
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum one
  8453: "0xd9aa4c441c5ad534A07182b26263d61Ee2F31D33", // Base mainnet
  137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon
  545: "0x7e60df042a9c0868",
};

function getDefaultUsdcAddress(chainId: number): string {
  const addr = USDC_ADDRESSES[chainId];
  if (!addr) {
    throw new Error(
      `No default USDC address configured for chain ${chainId}. Please specify usdc_contract explicitly.`
    );
  }
  return addr;
}
