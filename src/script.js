import { dataFeed } from "./dataFeed.js";
import save_load_adapter from "./saveLoadAdapter.js";
import { getBaseURL } from "./baseUrl.js";

function load() {
  let resolution = JSON.parse(
    localStorage.getItem("user_pc_resolution_chart_density")
  )?.resolution;

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const selectedSymbol = params?.symbol?.toUpperCase() || "BTCUSDT";

  const b = params.b;
  const l = params.l;
  window.tvWidget = new TradingView.widget({
    datafeed: dataFeed,
    container: "TVChartContainer",
    locale: navigator.language.split("-")[0] || "en-IN",
    theme: "dark",
    disabled_features: [
      "context_menus",
      "use_localstorage_for_settings",
      "header_saveload",
      "header_symbol_search",
      "symbol_search_hot_key",
    ],
    enabled_features: [
      "study_templates",
      "hide_left_toolbar_by_default",
      "header_chart_type",
      "show_symbol_logos",
      "hide_right_toolbar",
    ],
    client_id: "density.exchange",
    autosize: true,
    custom_css_url: "css/style.css",
    auto_save_delay: 1,
    save_load_adapter: save_load_adapter,
    symbol: selectedSymbol, // default symbol
    interval: resolution, // default interval
    fullscreen: true, // displays the chart in the fullscreen mode
    library_path: "../chart/",
    load_last_chart: true,
    allow_symbol_change: true,
    timezone: "Asia/Kolkata",
    loading_screen: {
      backgroundColor:  b ? `#${b}` : "#101019",
      foregroundColor:  b ? `#${b}` : "#101019",
    },
    toolbar_bg: b ? `#${b}` : "#101019",
    custom_font_family:'"Lato", sans-serif',
    overrides: {

      "paneProperties.backgroundType": "solid",
      "paneProperties.background": b ? `#${b}` : "#101019",
      "paneProperties.textColor": "#ffffff",
      "paneProperties.vertGridProperties.color": l ? `#${l}` : "#222225",
      "paneProperties.horzGridProperties.color": l ? `#${l}` : "#222225",
      "paneProperties.crossHairProperties.color": "#A9A9A9",
      "mainSeriesProperties.candleStyle.borderUpColor": "#29B57E",
      "mainSeriesProperties.candleStyle.borderDownColor": "#F46151",
      "mainSeriesProperties.candleStyle.borderColor": "#29B57E",
      "mainSeriesProperties.candleStyle.upColor": "#29B57E",
      "mainSeriesProperties.candleStyle.downColor": "#F46151",
      "mainSeriesProperties.candleStyle.wickColor": "#29B57E",
      "mainSeriesProperties.candleStyle.wickUpColor": "#29B57E",
      "mainSeriesProperties.candleStyle.wickDownColor": "#F46151",
      "scalesProperties.textColor": "white",
      "scalesProperties.backgroundColor": "#171717",
      "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0.00)",
      "symbolWatermarkProperties.visibility": false,
    },
  });

  tvWidget.onChartReady(() => {
    const reloadChart = tvWidget.createButton();
    reloadChart.style = "cursor:pointer";
    reloadChart.addEventListener("click", () => window.location.reload());
    reloadChart.innerHTML = "Reload";
    tvWidget.subscribe("onAutoSaveNeeded", () => {
      let options = {
        defaultChartName: "unnamed",
      };
      tvWidget.saveChartToServer(
        () => console.log("Saved"),
        () => console.log("failed to save"),
        options
      );
    });
    tvWidget.chart();
  });
}

load();

var lastTime = new Date().getTime();

setInterval(function () {
  var currentTime = new Date().getTime();
  if (currentTime > lastTime + 2000 * 2) {
    // ignore small delays
    window.location.reload();
  }
  lastTime = currentTime;
}, 2000);
