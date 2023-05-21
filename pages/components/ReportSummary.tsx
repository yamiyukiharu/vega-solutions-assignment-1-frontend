import { Form, Typography } from "antd";

const { Paragraph } = Typography;

interface ReportSummaryProps {
  totalEthFees: string;
  totalUsdtFees: string;
  ethPrice: string;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({
  totalEthFees,
  totalUsdtFees,
  ethPrice,
}) => {
  return (
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
  );
};

export default ReportSummary;