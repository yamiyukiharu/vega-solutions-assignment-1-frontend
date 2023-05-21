import type { RangePickerProps } from "antd/lib/date-picker";
import React, { useEffect, useState } from "react";
import { TablePaginationConfig } from "antd/lib/table";
import { FilterValue, SorterResult } from "antd/lib/table/interface";
import BigNumber from "bignumber.js";
import { useExchangeRate } from "../hooks/useExchangeRate";
import dayjs from "dayjs";
import { DataType, ReportDataDto, Transaction } from "../types";
import { ETH_DECIMALS } from "../constants";
import { getTransactions } from "./api/transactions";
import { getReport, getReportStatus, triggerReport } from "./api/reports";
import InputForm from "./components/InputForm";
import ReportSummary from "./components/ReportSummary";
import TransactionsTable from "./components/TransactionsTable";

const Main: React.FC = () => {

  const { data: ethPrice } = useExchangeRate();

  const [data, setData] = useState<Transaction[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [hasTimeRange, setHasTimeRange] = useState(false);
  const [totalEthFees, setTotalEthFees] = useState("0");
  const [totalUsdtFees, setTotalUsdtFees] = useState("0");
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 50,
    total: 50,
  });

  const setTotalFeesForCurrentPage = (data: Transaction[]) => {
    const currentView = data.slice(
      (tableParams.current! - 1) * tableParams.pageSize!,
      tableParams.current! * tableParams.pageSize!
    );
    const totalEth = currentView
      .slice()
      .reduce((acc, item) => acc.plus(item.feeEth), BigNumber(0))
      .dividedBy(1e18); // convert wei to ETH

    const totalUsdt = currentView
      .slice()
      .reduce((acc, item) => acc + parseFloat(item.feeUsdt), 0);

    setTotalEthFees(totalEth.toFixed(ETH_DECIMALS));
    setTotalUsdtFees(totalUsdt.toFixed(2));
  };

  useEffect(() => {
    getTransactions().then((data) => {
      setData(data);
      setTotalFeesForCurrentPage(data);
    });
  }, []);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<DataType> | SorterResult<DataType>[]
  ) => {
    setTableParams(pagination);
  };

  const onDateChange = (
    value: RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    if (!value) {
      setHasTimeRange(false);
      return;
    }

    const start = dayjs(dateString[0]).toISOString();
    const end = dayjs(dateString[1]).toISOString();

    setStartTime(start);
    setEndTime(end);
    setHasTimeRange(true);
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const onSubmit = async () => {
    if (hasTimeRange) {
      setLoading(true);
      const location = await triggerReport(startTime, endTime);
      let status = await getReportStatus(location);
      while (status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        status = await getReportStatus(location);
      }
      const reportId = location.split("/").pop();

      const data: ReportDataDto = await getReport(
        reportId,
        tableParams.current!,
        tableParams.pageSize!
      );
      const { total, totalFee, data: reportData } = data;
      const formattedData = reportData.map((item) => ({
        hash: item.hash,
        feeEth: BigNumber(item.fee.eth).dividedBy(1e18).toFixed(2),
        feeUsdt: parseFloat(item.fee.usdt).toFixed(2),
      }));
      setTableParams({
        ...tableParams,
        total,
      });
      setData(formattedData);
      setTotalEthFees(
        BigNumber(totalFee.eth).dividedBy(1e18).toFixed(ETH_DECIMALS)
      );
      setTotalUsdtFees(parseFloat(totalFee.usdt).toFixed(2));
      setLoading(false);
    } else {
      const data = await getTransactions(inputValue);
      setData(data);
      setTotalFeesForCurrentPage(data);
      setTableParams({
        ...tableParams,
        total: data.length,
      });
    }
  };

  return (
    <>
      <InputForm
        onSubmit={onSubmit}
        onInputChange={onInputChange}
        onDateChange={onDateChange}
        inputValue={inputValue}
      />

      <ReportSummary
        totalEthFees={totalEthFees}
        totalUsdtFees={totalUsdtFees}
        ethPrice={ethPrice?.toString() || "NA"}
      />

      <TransactionsTable
        data={data}
        tableParams={tableParams}
        loading={loading}
        handleTableChange={handleTableChange}
      />
    </>
  );
};

export default Main;
