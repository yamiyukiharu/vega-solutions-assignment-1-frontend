export type TransactionDto = Array<{
  hash: string;
  fee: {
    eth: string; // in wei
    usdt: string;
  };
}>;

export type Transaction = {
  hash: string;
  feeEth: string;
  feeUsdt: string;
};

export type ReportDataDto = {
  total: number;
  totalFee: {
    eth: string;
    usdt: string;
  },
  data: TransactionDto;
}

export type DataType = {
  hash: string;
  feeUsdt: string;
}