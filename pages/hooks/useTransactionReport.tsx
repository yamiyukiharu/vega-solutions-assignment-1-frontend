import { useQuery } from "@tanstack/react-query";
import { ReportDataDto } from "../types";
import { useState } from "react";

interface ReportStatus {
  status: string;
  location: string;
}

export const useTransactionReport = (
  startTime: string,
  endTime: string,
  generate: boolean
) => {
  const [location, setLocation] = useState<string>("");

  const { data, isLoading: isStatusLoading } = useQuery<string>(
    ["transactionReportStatus", startTime, endTime],
    async () => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
          `v1/transactions/reports?protocol=uniswapv3&pool=eth_usdt&startTime=${startTime}&endTime=${endTime}`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transaction report status");
      }
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Location header not found");
      }
      return location;
    },
    {
      enabled: generate,
    }
  );

  const { data: reportData, isLoading: isDataLoading } = useQuery<ReportDataDto>(
    ["transactionReportData", location],
    async () => {
      if (!location || !generate) {
        return
      }
      while (true) {
        const response = await fetch(location);
        if (!response.ok) {
          throw new Error("Failed to fetch transaction report status");
        }
        const data = await response.json();
        if (data && data.status === "completed") {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
      }
      const response = await fetch(`${location}?page=0&limit=1000`);
      if (!response.ok) {
        throw new Error("Failed to fetch transaction report data");
      }
      return response.json();
    },
    {
      retry: false, // Disable automatic retries
    }
  );

  return { data: reportData, isLoading: isStatusLoading || isDataLoading };
};
