// Define the only allowed environment value
export const Enviroment = {
  PROD: "production" as const,
};


// Create a proxy around URLSearchParams to allow property-style access (e.g., params.env)
const params :any = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams: URLSearchParams, prop: string): string | null => searchParams.get(prop),
}) as URLSearchParams & {query: string};
const env: any = params.env 

/**
 * Returns base URLs for Binance API and WebSocket
 * based on the environment (currently tightly coupled to 'production')
 */
export const getBaseURL = (): {
  binanceBaseUrl: string;
  binanceWsBase: string;
} => {
  // Default to production values (since it's the only environment handled)
  let binanceBaseUrl = "https://fapi.binance.com";
  let binanceWsBase = "wss://fstream.binance.com/stream";

  // Check if we are in a specific environment (here only 'production' is recognized)
  if (env === Enviroment.PROD) {
    // You could override base URLs here in the future
  }

  return {
    binanceBaseUrl,
    binanceWsBase,
  };
};
