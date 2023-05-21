import { DatePicker, Form, Input, Button } from "antd";
import type { RangePickerProps } from "antd/lib/date-picker";
import React from "react";

interface InputFormProps {
  inputValue: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (
    value: RangePickerProps["value"],
    dateString: [string, string] | string
  ) => void;
  onSubmit: () => Promise<void>;
  disabled: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  inputValue,
  onInputChange,
  onDateChange,
  onSubmit,
  disabled
}) => {
  return (
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
        <Button type="primary" htmlType="submit" onClick={onSubmit} disabled={disabled}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default InputForm;