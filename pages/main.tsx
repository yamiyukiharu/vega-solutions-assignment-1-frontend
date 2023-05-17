import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Cascader,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  TreeSelect,
  Upload,

} from "antd";
import type { RangePickerProps } from 'antd/es/date-picker';
import React, { useState } from "react";
import DataTable from "./table";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const Main: React.FC = () => {
  const onChange = (
    value: RangePickerProps['value'],
    dateString: [string, string] | string,
  ) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
  };

  return (
    <>
      <Form
        labelCol={{ flex: '200px' }}
        labelAlign="left"
        wrapperCol={{ flex: 1 }}
        colon={false}
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="Transaction Hash">
          <Input />
        </Form.Item>
        <Form.Item label="Time Range">
          <RangePicker
            showTime={{ format: 'HH:mm' }}
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

      <DataTable/>
    </>
  );
};

export default Main;
