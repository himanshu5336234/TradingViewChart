const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});
const env = params.env;

export const deploymentEnv = {
  PROD: "production",
  STAGING: "staging",
  SF: "sf",
  UAT: "uat",
  TEST: "test",
  DEV: "development",
  LOCAL: "local"
};

export const getBaseURL = () => {
  let binanceBaseUrl;
  let binanceWsBase;

  switch (env) {
    case deploymentEnv.PROD:
      binanceBaseUrl = "https://fapi.binance.com";
      binanceWsBase = "wss://fstream.binance.com/stream";

      break;
    case deploymentEnv.STAGING:
      case deploymentEnv.UAT:
      binanceBaseUrl = "https://fapi.binance.com";

      binanceWsBase = "wss://fstream.binance.com/stream";
      break;
      
    case deploymentEnv.DEMO:
      binanceBaseUrl = "https://testnet.binancefuture.com";

      binanceWsBase = "wss://stream.binancefuture.com/stream";

      break;
    case deploymentEnv.SF:
      binanceBaseUrl = "https://testnet.binancefuture.com";

      binanceWsBase = "wss://stream.binancefuture.com/stream";

      break;
    case deploymentEnv.TEST:
      binanceBaseUrl = "https://testnet.binancefuture.com";

      binanceWsBase = "wss://stream.binancefuture.com/stream";
      break;
    case deploymentEnv.DEV:
      binanceBaseUrl = "https://testnet.binancefuture.com";
      binanceWsBase = "wss://stream.binancefuture.com/stream";
      break;
    case deploymentEnv.LOCAL:
    default:
      binanceBaseUrl = "https://fapi.binance.com";
      binanceWsBase = "wss://fstream.binance.com/stream";
      break;
    }
    
    return {
      binanceBaseUrl,
      binanceWsBase,
 
    };

}
