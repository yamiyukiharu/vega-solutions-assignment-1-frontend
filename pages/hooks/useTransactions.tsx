import { useQuery } from "@tanstack/react-query";
import { Transaction, TransactionDto } from "../types";

export const useTransactions = (hash?: string) => {
  const queryKey = ["transactions", hash];

  return useQuery<Transaction[], Error>(queryKey, async () => {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL + "v1/transactions");
    url.searchParams.set("protocol", "uniswapv3");
    url.searchParams.set("pool", "eth_usdc");
    url.searchParams.set("page", "0");
    url.searchParams.set("limit", "50");

    if (hash) {
      url.searchParams.set("hash", hash);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const { data }: { data: TransactionDto } = await response.json();

    return data.map((entry: any) => ({
      hash: entry.hash,
      feeEth: entry.fee.eth,
      feeUsdt: parseFloat(entry.fee.usdt).toFixed(2),
    }));
  });
};
