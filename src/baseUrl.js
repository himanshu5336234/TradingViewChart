const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

const token  = params.token
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
  let densityBaseUrl;
  let binanceWsBase;
  let appUrl;
  switch (env) {
    case deploymentEnv.PROD:
      binanceBaseUrl = "https://fapi.binance.com";
      densityBaseUrl = "https://api-prod.density.exchange";
      binanceWsBase = "wss://fstream.binance.com/stream";
      appUrl = "https://app.density.exchange";
      break;
    case deploymentEnv.STAGING:
      case deploymentEnv.UAT:
      binanceBaseUrl = "https://fapi.binance.com";
      densityBaseUrl = "https://api-prod.density.exchange";
      binanceWsBase = "wss://fstream.binance.com/stream";
      appUrl = "https://staging.density.exchange";
      break;
      
    case deploymentEnv.DEMO:
      binanceBaseUrl = "https://testnet.binancefuture.com";
      densityBaseUrl = "https://dev-api.densityexchange.org";
      binanceWsBase = "wss://stream.binancefuture.com/stream";
      appUrl = "https://demo.density.exchange";
      break;
    case deploymentEnv.SF:
      binanceBaseUrl = "https://testnet.binancefuture.com";
      densityBaseUrl = "https://dev-api.densityexchange.org";
      binanceWsBase = "wss://stream.binancefuture.com/stream";
      appUrl = "https://sf-app.pahal.cloud";
      break;
    case deploymentEnv.TEST:
      binanceBaseUrl = "https://testnet.binancefuture.com";
      densityBaseUrl = "https://dev-api.densityexchange.org";
      binanceWsBase = "wss://stream.binancefuture.com/stream";
      appUrl = "https://test-app.pahal.cloud";
      break;
    // case deploymentEnv.UAT:
    //   binanceBaseUrl = "https://testnet.binancefuture.com";
    //   densityBaseUrl = "https://dev-api.densityexchange.org";
    //   binanceWsBase = "wss://stream.binancefuture.com/stream";
    //   appUrl = "https://uat-app.pahal.cloud";
    //   break;
    case deploymentEnv.DEV:
      binanceBaseUrl = "https://testnet.binancefuture.com";
      densityBaseUrl = "https://dev-api.densityexchange.org";
      binanceWsBase = "wss://stream.binancefuture.com/stream";
      appUrl = "https://dev-app.pahal.cloud";
      break;
    case deploymentEnv.LOCAL:
    default:
      binanceBaseUrl = "https://testnet.binancefuture.com";
      densityBaseUrl = "https://dev-api.densityexchange.org";
      binanceWsBase = "wss://stream.binancefuture.com/stream";
      appUrl = "https://sf-app.pahal.cloud";
      break;
    }
    return {
      binanceBaseUrl,
      densityBaseUrl,
      binanceWsBase,
      appUrl
    };

}