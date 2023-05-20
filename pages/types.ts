export type TransactionDto = {
  data: Array<{
    hash: string;
    fee: {
      eth: string; // in wei
      usdt: string;
    };
  }>;
};

export type Transaction = {
  hash: string;
  feeEth: string;
  feeUsdt: string;
};
