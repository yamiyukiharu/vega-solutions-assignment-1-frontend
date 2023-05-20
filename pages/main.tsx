import { Button, DatePicker, Form, Input, Pagination } from "antd";
import type { RangePickerProps } from "antd/lib/date-picker";
import React, { use, useEffect, useState } from "react";
import Paragraph from "antd/lib/typography/Paragraph";
import Table, { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { FilterValue, SorterResult } from "antd/lib/table/interface";
import { useTransactions } from "./hooks/useTransactions";
import BigNumber from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";
import { useExchangeRate } from "./hooks/useExchangeRate";
import dayjs from "dayjs";

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

  const [inputValue, setInputValue] = useState<string>("");
  const [inputHash, setInputHash] = useState<string>("");
  const { data, isLoading, isError, error } = useTransactions(inputHash);
  const { data: ethPrice } = useExchangeRate();

  const [startTimestamp, setStartTimestamp] = useState<string>('');
  const [endTimestamp, setEndTimestamp] = useState<string>('');
  const [isReportMode, setIsReportMode] = useState(false);
  const [totalEthFees, setTotalEthFees] = useState("0");
  const [totalUsdtFees, setTotalUsdtFees] = useState("0");
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: data ? data.length : 0,
  });

  // useEffect(() => {
  //   inputHash === "" ? setIsDefaultQuery(true) : setIsDefaultQuery(false);
  // }, [inputHash]);

  useEffect(() => {
    if (!isReportMode && data) {
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

      setTotalEthFees(totalEth.toFixed(2));
      setTotalUsdtFees(totalUsdt.toFixed(2));
    }
  }, [data, isReportMode, tableParams]);

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
      setIsReportMode(false);
      return;
    }

    const start = new Date(dateString[0]).toISOString();
    const end = new Date(dateString[1]).toISOString();

    setStartTimestamp(start);
    setEndTimestamp(end);
    setIsReportMode(true);
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const onSubmit = () => {
    if (!isReportMode) {
      setInputHash(inputValue);
      queryClient.invalidateQueries(["transactions", inputValue]);
    } else {
      setLoading(true);
      // queryClient.invalidateQueries(["transactions", inputValue]);
      setLoading(false);
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
            format="YYYY-MM-DD HH:mm"
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
          defaultPageSize: 20,
        }}
        loading={loading}
        onChange={handleTableChange}
      />
    </>
  );
};

export default Main;
