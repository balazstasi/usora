import { useState, useMemo, useEffect } from "react";
import { getAccessToken, useUser, WalletWithMetadata } from "@privy-io/react-auth";

interface Props {}

export default function SendUsdcForm({}: Props) {
  const { user } = useUser();
  const [walletId, setWalletId] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [chainId, setChainId] = useState<number>(8453); // Base mainnet default
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const wallets = useMemo<WalletWithMetadata[]>(() => {
    return (
      user?.linkedAccounts.filter(
        (a) => a.type === "wallet" && a.walletClientType === "privy" && a.chainType === "ethereum"
      ) as WalletWithMetadata[]) ?? [];
  }, [user]);

  // Auto-select first wallet when wallets load
  useEffect(() => {
    if (!walletId && wallets.length > 0) {
      setWalletId(wallets[0]?.id ?? "");
    }
  }, [wallets, walletId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || !recipientEmail || !amount) return;

    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/ethereum/send_usdc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sender_wallet_id: walletId,
          recipient_email: recipientEmail,
          amount: Number(amount),
          chain_id: chainId,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setTxHash(json.txHash);
      } else {
        setError(json.error || "Unknown error");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md max-w-xl">
      <h3 className="text-lg font-semibold mb-4">Send USDC (test)</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sender Wallet</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md"
            value={walletId || ""}
            onChange={(e) => setWalletId(e.target.value || "")}
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.address.slice(0, 6)}…{w.address.slice(-4)} ({w.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Recipient Email</label>
          <input
            type="email"
            required
            className="mt-1 block w-full border-gray-300 rounded-md"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (USDC)</label>
          <input
            type="number"
            step="0.000001"
            required
            className="mt-1 block w-full border-gray-300 rounded-md"
            value={amount || ""}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Chain ID</label>
          <input
            type="number"
            className="mt-1 block w-full border-gray-300 rounded-md"
            value={chainId}
            onChange={(e) => setChainId(Number(e.target.value || chainId))}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !walletId}
          className={`w-full py-2 px-4 rounded-md text-white ${
            loading ? "bg-violet-400" : "bg-violet-600 hover:bg-violet-700"
          }`}
        >
          {loading ? "Sending..." : "Send USDC"}
        </button>
      </form>

      {txHash && (
        <p className="mt-4 text-green-700 break-all">Tx Hash: {txHash}</p>
      )}
      {error && (
        <p className="mt-4 text-red-700">Error: {error}</p>
      )}
    </div>
  );
}
