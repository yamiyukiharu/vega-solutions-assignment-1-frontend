import { Button, DatePicker, Form, Input, Pagination } from "antd";
import type { RangePickerProps } from "antd/lib/date-picker";
import React, { useEffect, useState } from "react";
import DataTable from "./DataTable";
import Paragraph from "antd/lib/typography/Paragraph";
import Table, { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { FilterValue, SorterResult } from "antd/lib/table/interface";
import { Transaction, TransactionDto } from "./types";
import BigNumber from "bignumber.js";

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
  const [data, setData] = useState<Transaction[]>([]);
  const [isDefaultQuery, setIsDefaultQuery] = useState(true);
  const [totalEthFees, setTotalEthFees] = useState("0");
  const [totalUsdtFees, setTotalUsdtFees] = useState("0");
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: data.length,
  });

  useEffect(() => {
    if (isDefaultQuery) {
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
  }, [data, isDefaultQuery, tableParams]);

  useEffect(() => {
    fetch(
      process.env.NEXT_PUBLIC_API_URL +
        "transactions?protocol=uniswapv3&pool=eth_usdc&page=0&limit=50",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data: TransactionDto) => {
        const formattedData = data.data.map((entry: any) => ({
          hash: entry.hash,
          feeEth: entry.fee.eth,
          feeUsdt: parseFloat(entry.fee.usdt).toFixed(2),
        }));
        setData(formattedData);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<DataType> | SorterResult<DataType>[]
  ) => {
    setTableParams(pagination);
  };

  const onChange = (
    value: RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    console.log("Selected Time: ", value);
    console.log("Formatted Selected Time: ", dateString);
  };

  return (
    <>
      <Form
        labelCol={{ flex: "200px" }}
        labelAlign="left"
        wrapperCol={{ flex: 1 }}
        colon={false}
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="Transaction Hash">
          <Input />
        </Form.Item>
        <Form.Item label="Time Range">
          <DatePicker.RangePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            onChange={onChange}
          />
        </Form.Item>

        <Form.Item label=" ">
          <Button type="primary" htmlType="submit">
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
          <Paragraph>0</Paragraph>
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
