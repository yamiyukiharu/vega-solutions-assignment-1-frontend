import { useQuery } from "@tanstack/react-query";

export const useExchangeRate = () => {
  const queryKey = ["exchangeRate"];

  return useQuery<number, Error>(
    queryKey,
    async () => {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + "exchange-rate");
      url.searchParams.set("from", 'eth');
      url.searchParams.set("to", 'usdt');

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate");
      }

      const data: number = await response.json();

      return data;
    }
  );
};