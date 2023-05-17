import Head from "next/head";
import Main from "./main";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main/>
    </div>
  );
}
