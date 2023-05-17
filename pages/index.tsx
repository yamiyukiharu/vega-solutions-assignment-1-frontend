import Head from "next/head";
import Main from "./main";
import Title from "antd/lib/typography/Title";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col p-10">
        <Title>UniswapV3 USDC/ETH Pool Transactions</Title>
        <Main />

      </div>
    </div>
  );
}
