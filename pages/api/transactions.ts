import { Alert } from "antd";
import { TransactionDto } from "../types";

export const getTransactions = async (hash?: string) => {
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

  if (response.status === 404 || response.status === 400) {
    alert("No transactions found");
    return [];
  }

  if (!response.ok ) {
    throw new Error("Failed to fetch transactions");
  }

  const { data }: { data: TransactionDto } = await response.json();

  return data.map((entry: any) => ({
    hash: entry.hash,
    feeEth: entry.fee.eth,
    feeUsdt: parseFloat(entry.fee.usdt).toFixed(2),
  }));
};
