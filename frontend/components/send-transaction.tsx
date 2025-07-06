"use client";

import { parseEther } from "viem";
import type { Config } from "wagmi";
import { useSendTransaction } from "wagmi";
import type { SendTransactionVariables } from "wagmi/query";

type SendTransactionProps = {
  to: string;
  value: string;
};

const SendTransaction = (props: SendTransactionProps) => {
  const transactionRequest: SendTransactionVariables<Config, number> = {
    to: props.to as `0x${string}`,
    value: parseEther(props.value || "0"),
    type: "eip1559",
  };

  const { data, isPending, isSuccess, sendTransaction } = useSendTransaction();

  return (
    <div>
      <button
        onClick={() => sendTransaction(transactionRequest)}
        disabled={!sendTransaction}
      >
        Send
      </button>
      {isPending && <div>Loading...</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
    </div>
  );
};

export default SendTransaction;
