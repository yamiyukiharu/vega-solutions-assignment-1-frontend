import { Table, TablePaginationConfig } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { DataType } from "../../types";

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

interface Props {
  data: DataType[];
  tableParams: TablePaginationConfig;
  loading: boolean;
  handleTableChange: (
    pagination: TablePaginationConfig,
    filters: Record<string, any>,
    sorter: any
  ) => void;
}

const TransactionsTable = ({
  data,
  tableParams,
  loading,
  handleTableChange,
}: Props) => {
  return (
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
  );
};

export default TransactionsTable;
