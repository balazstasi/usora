'use client';

import Button from 'components/Button';
import Wrapper from 'components/Wrapper';
import {useEffect, useState} from 'react';
import {parseEther} from 'viem';
import {flowTestnet} from 'viem/chains';
import {useChainId, useSendTransaction} from 'wagmi';
import type {Config} from 'wagmi';
import type {SendTransactionVariables} from 'wagmi/query';

import {usePrivy, useWallets} from '@privy-io/react-auth';
import {useSendTransaction as useSendTransactionPrivy} from '@privy-io/react-auth';
import {useSetActiveWallet} from '@privy-io/wagmi';

const SendTransaction = () => {
  const [to, setTo] = useState<`0x${string}`>('' as `0x${string}`);
  const [amount, setAmount] = useState('');

  const chainId = useChainId();
  const isFlow = chainId === flowTestnet.id;

  const {data, isPending, isSuccess, sendTransaction, error} = useSendTransaction();
  const {sendTransaction: sendPrivy} = useSendTransactionPrivy();

  const handleSend = () => {
    if (!sendTransaction) return;
    try {
      const tx: SendTransactionVariables<Config, number> = {
        to,
        value: BigInt(amount),
        // value: parseEther(amount || '0'),
        // type: 'eip1559',
      };
      // Flow EVM testnet accepts standard EIP-1559 transactions.
      sendTransaction(tx);
    } catch (e) {
      console.error(e);
    }
  };

  const disabled = !sendTransaction || !to || !amount || !/^0x[a-fA-F0-9]{40}$/.test(to);

  return (
    <Wrapper title="useSendTransaction">
      <div className="rounded bg-blue-400 px-2 py-1 text-sm text-white">
        {isFlow ? 'Sending FLOW on Flow Testnet' : 'Sending ETH on EVM chain'}
      </div>
      <input
        className="mt-2 w-full rounded border px-2 py-1"
        placeholder="Recipient (0x...)"
        value={to}
        onChange={(e) => setTo(e.target.value as `0x${string}`)}
      />
      <input
        className="mt-2 w-full rounded border px-2 py-1"
        placeholder={isFlow ? 'Amount in FLOW' : 'Amount in ETH'}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button cta="Send" onClick_={handleSend} disabled={disabled} />
      {isPending && <div>Check wallet</div>}
      {isSuccess && <div>Txn hash: {data}</div>}
      {error && <div className="text-red-600">Error: {error.message}</div>}
    </Wrapper>
  );
};

export default SendTransaction;
