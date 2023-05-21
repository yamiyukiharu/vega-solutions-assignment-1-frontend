import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import React, { useEffect, useState } from "react";
import { TablePaginationConfig } from "antd/lib/table";
import { FilterValue, SorterResult } from "antd/lib/table/interface";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { DataType, ReportDataDto, Transaction, TransactionDto } from "../types";
import { ETH_DECIMALS, REPORT_TX_TO_FETCH, WEI_DECIMALS } from "../constants";
import { getTransactions } from "./api/transactions";
import { getReport, getReportStatus, triggerReport } from "./api/reports";
import InputForm from "./components/InputForm";
import ReportSummary from "./components/ReportSummary";
import TransactionsTable from "./components/TransactionsTable";

import type { RangePickerProps } from "antd/lib/date-picker";

const Main: React.FC = () => {
  const { data: ethPrice } = useExchangeRate();

  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState("");
  const [reportDataPage, setReportDataPage] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [totalEthFees, setTotalEthFees] = useState("0");
  const [totalUsdtFees, setTotalUsdtFees] = useState("0");
  const [hasTimeRange, setHasTimeRange] = useState(false);
  const [data, setData] = useState<Transaction[]>([]);
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
      .dividedBy(WEI_DECIMALS); // convert wei to ETH

    const totalUsdt = currentView
      .slice()
      .reduce((acc, item) => acc + parseFloat(item.feeUsdt), 0);

    setTotalEthFees(totalEth.toFixed(ETH_DECIMALS));
    setTotalUsdtFees(totalUsdt.toFixed(2));
  };

  const formatData = (reportData: TransactionDto): Transaction[] => {
    return reportData.map((item) => ({
      hash: item.hash,
      feeEth: BigNumber(item.fee.eth)
        .dividedBy(WEI_DECIMALS)
        .toFixed(ETH_DECIMALS),
      feeUsdt: parseFloat(item.fee.usdt).toFixed(2),
    }));
  };

  useEffect(() => {
    getTransactions().then((data) => {
      setData(data);
      setTotalFeesForCurrentPage(data);
    });
  }, []);

  useEffect(() => {
    if (!reportId) return;

    const { current, pageSize } = tableParams;
    if (current! * pageSize! < data.length) return;

    getReport(reportId, reportDataPage + 1, REPORT_TX_TO_FETCH).then(
      (tx: ReportDataDto) => {
        const formattedData = formatData(tx.data);
        setData((prev) => [...prev, ...formattedData]);
        setReportDataPage((prev) => prev + 1);
      }
    );
  }, [tableParams, reportId]);

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
    // Getting transactions with time period is considered as a report
    if (hasTimeRange) {
      setLoading(true);

      const location = await triggerReport(startTime, endTime);

      // Poll for report status until it's completed
      let status = await getReportStatus(location);
      while (status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        status = await getReportStatus(location);
      }
      
      // Fetch report data
      const reportId = location.split("/").pop();
      const data: ReportDataDto = await getReport(
        reportId,
        0,
        REPORT_TX_TO_FETCH // fetch as much data as possible
      );

      // Format data
      const { total, totalFee, data: reportData } = data;
      const formattedData = formatData(reportData);

      // Update states
      setData(formattedData);
      setTotalEthFees(
        BigNumber(totalFee.eth).dividedBy(WEI_DECIMALS).toFixed(ETH_DECIMALS)
      );
      setTotalUsdtFees(parseFloat(totalFee.usdt).toFixed(2));
      setTableParams({
        ...tableParams,
        total,
      });
      setReportId(reportId);
      setReportDataPage(0);
      setLoading(false);
    } else {
      // When there's no time range, summary data is based on current page of table

      const data = await getTransactions(inputValue);
      setData(data);
      setTotalFeesForCurrentPage(data);
      setTableParams({
        ...tableParams,
        total: data.length,
      });
      setReportId("");
      setReportDataPage(0);
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
