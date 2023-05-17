import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

interface DataType {
    hash: string;
    fee: number;
}

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Record<string, FilterValue>;
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Hash',
        dataIndex: 'hash',
        sorter: true,
        width: '40%',
    },
    {
        title: 'Fee (USDT)',
        dataIndex: 'fee',
        width: '20%',
    },
];

const DataTable: React.FC<{ data: DataType[] }> = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<DataType> | SorterResult<DataType>[],
    ) => {

    };

    return (
        <Table
            columns={columns}
            rowKey={(entry) => entry.hash}
            dataSource={data}
            pagination={tableParams.pagination}
            loading={loading}
            onChange={handleTableChange}
        />
    );
};

export default DataTable;