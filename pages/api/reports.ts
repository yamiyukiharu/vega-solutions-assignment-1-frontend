// startTime and endTime are ISO 8601 strings
export const triggerReport = async (startTime: string, endTime: string) => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_API_URL + `v1/transactions/reports`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        protocol: "uniswapv3",
        pool: "eth_usdc",
        startTime: startTime,
        endTime: endTime,
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to trigger transaction report");
  }
  const { location } = await response.json();
  if (!location) {
    throw new Error("Location header not found");
  }
  return location;
};

// location is the endpoint to check the status of the report
export const getReportStatus = async (location: string) => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + location, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch transaction report status");
  }
  const data = await response.json();
  return data.status;
};

// location is the endpoint to get the report
export const getReport = async (id: string, page: number, limit: number) => {
  const url = new URL(
    process.env.NEXT_PUBLIC_API_URL + `v1/transactions/reports/${id}`
  );
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());

  const response = await fetch(
    process.env.NEXT_PUBLIC_API_URL + `v1/transactions/reports/${id}`,
    {
      method: "GET",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch transaction report status");
  }
  const data = await response.json();
  return data;
};