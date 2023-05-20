import { Button, DatePicker, Form, Input, Pagination } from "antd";
import type { RangePickerProps } from "antd/lib/date-picker";
import React, { use, useEffect, useState } from "react";
import Paragraph from "antd/lib/typography/Paragraph";
import Table, { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { FilterValue, SorterResult } from "antd/lib/table/interface";
import { useTransactions } from "./hooks/useTransactions";
import BigNumber from "bignumber.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useExchangeRate } from "./hooks/useExchangeRate";
import dayjs from "dayjs";
import { ReportDataDto, Transaction, TransactionDto } from "./types";
import { ETH_DECIMALS } from "./constants";
import { get } from "http";
import { getTransactions } from "./api/transactions";
import { getReport, getReportStatus, triggerReport } from "./api/reports";

interface DataType {
  hash: string;
  feeUsdt: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: "Hash",
    dataIndex: "hash",
    sorter: true,
    width: "40%",
  },
  {
    title: "Fee (USDT)",
    dataIndex: "feeUsdt",
    width: "20%",
  },
];

const Main: React.FC = () => {
  const queryClient = useQueryClient();

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
      <Form
        labelCol={{ flex: "200px" }}
        labelAlign="left"
        wrapperCol={{ flex: 1 }}
        colon={false}
        style={{ maxWidth: 800 }}
      >
        <Form.Item label="Transaction Hash">
          <Input value={inputValue} onChange={onInputChange} />
        </Form.Item>
        <Form.Item label="Time Range">
          <DatePicker.RangePicker
            showTime={{ format: "HH:mm" }}
            onChange={onDateChange}
          />
        </Form.Item>

        <Form.Item label=" ">
          <Button type="primary" htmlType="submit" onClick={onSubmit}>
            Submit
          </Button>
        </Form.Item>
      </Form>

      <Form
        labelCol={{ flex: "200px" }}
        labelAlign="left"
        wrapperCol={{ flex: 1 }}
        colon={false}
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="Total Fees (ETH)">
          <Paragraph>{totalEthFees}</Paragraph>
        </Form.Item>
        <Form.Item label="Total Fees (USDT)">
          <Paragraph>{totalUsdtFees}</Paragraph>
        </Form.Item>
        <Form.Item label="Current ETH/USDT price">
          <Paragraph>{ethPrice}</Paragraph>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        rowKey={(entry) => entry.hash}
        dataSource={data}
        pagination={{
          ...tableParams,
          showSizeChanger: true,
          pageSizeOptions: ["20", "50", "100"],
        }}
        loading={loading}
        onChange={handleTableChange}
      />
    </>
  );
};

export default Main;
