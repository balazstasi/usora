"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import SendTransaction from "../../components/send-transaction";
import SwitchNetwork from "../../components/switch-network";
import ContractWrite from "../../components/contract-write";

async function verifyToken() {
  const url = "/api/verify";
  const accessToken = await getAccessToken();
  const result = await fetch(url, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    },
  });

  return await result.json();
}

export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState();
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    linkPhone,
    unlinkPhone,
    unlinkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
  } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const phone = user?.phone;
  const wallet = user?.wallet;

  const googleSubject = user?.google?.subject || null;
  const twitterSubject = user?.twitter?.subject || null;
  const discordSubject = user?.discord?.subject || null;

  const [recipientInput, setRecipientInput] = useState("");
  const [amountInput, setAmountInput] = useState("0");
  const [resolvedWallet, setResolvedWallet] = useState<string>("");
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isWalletAddress(str: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(str);
  }

  async function handleResolve() {
    setError(null);
    setResolving(true);
    // If plain wallet address, no need to call API
    if (isWalletAddress(recipientInput)) {
      setResolvedWallet(recipientInput);
      setResolving(false);
      return;
    }

    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: recipientInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resolve wallet");
      }
      setResolvedWallet(data.walletAddress);
    } catch (e: any) {
      setError(e.message);
      setResolvedWallet("");
    } finally {
      setResolving(false);
    }
  }

  const canSend = !!resolvedWallet && parseFloat(amountInput) > 0;

  return (
    <>
      <Head>
        <title>USORA</title>
      </Head>
      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between mb-6">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>

            {/* Email & amount form */}
            <div className="flex flex-col gap-4 w-full max-w-md mb-8">
              <input
                type="text"
                placeholder="Recipient (email or wallet address)"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                className="p-2 border rounded-md"
              />
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Amount (ETH)"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="p-2 border rounded-md"
              />
              <button
                onClick={handleResolve}
                disabled={resolving || !recipientInput}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
              >
                {resolving ? "Resolving..." : "Resolve Wallet"}
              </button>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {resolvedWallet && (
                <div className="text-green-700 text-sm break-all">
                  Resolved wallet: {resolvedWallet}
                </div>
              )}
            </div>

            {/* Send Transaction */}
            {canSend && (
              <SendTransaction to={resolvedWallet} value={amountInput} />
            )}

            <ContractWrite value={amountInput} />
          </>
        ) : null}
      </main>
    </>
  );
}
