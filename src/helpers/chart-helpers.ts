import { TV_INTERVALS } from "@constants/charts-constant";

export function generateSubscriptionParam(subscriberUID: string): string {
    const id = subscriberUID.split("_#_");
    localStorage.setItem("user_pc_resolution_chart_x", JSON.stringify({ "resolution": id[2] }));
    return `${id[0].toLowerCase()}@kline_${TV_INTERVALS[id[2]]}`;
}
export function getSubscriptionRequest(paramStr: string, type = 'SUBSCRIBE') {
    return {
        method: type,
        params: [paramStr],
        id: Date.now()
    };
}
export const helperOnMessage = (
    msg: string,
    paramStr: any,
    onRealtimeCallback: any
) => {
    const { stream, data } = JSON.parse(msg);
    try {
        if (stream === paramStr && data.k) {
            const { o, h, l, v, c, T, t } = data.k;
            const lastSocketData = {
                time: t,
                close: +(c),
                open: +(o),
                high: +(h),
                low: +(l),
                volume: +(v),
                closeTime: T,
                openTime: t,
            };
            onRealtimeCallback(lastSocketData);
        }
    } catch (e) {
        console.error(e);
    }
};
import { dataFeed } from "../services/ChartsService/dataFeed";

export const ResolutionHelper = {
  supportedResolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'],

  cleanInvalidResolutions() {
    try {
      const resolutionData = JSON.parse((window as any).localStorage.getItem("chart_resolution"));
      if (resolutionData && !this.supportedResolutions.includes(resolutionData.resolution)) {
        localStorage.removeItem("chart_resolution");
      }
    } catch (e) {
      localStorage.removeItem("chart_resolution");
    }
  },

  getValidResolution() {
    try {
      const resolutionData = JSON.parse((window as any).localStorage.getItem("chart_resolution"));
      const resolution = resolutionData?.resolution;
      return this.supportedResolutions.includes(resolution) ? resolution : '15';
    } catch (e) {
      return '15';
    }
  },

  saveResolution(interval: string) {
    localStorage.setItem("chart_resolution", JSON.stringify({ resolution: interval }));
  }
};
export const UrlHelper = {
  getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      symbol: (params.get('symbol') || 'BTCUSDT').toUpperCase(),
      b: params.get('b'),
      l: params.get('l')
    };
  }
};

// Widget Config Helper
export const WidgetConfigHelper = {
  getDefaultConfig(params: { symbol: any; }) {
    return {
      datafeed: dataFeed,
      symbol: params.symbol,
      interval: ResolutionHelper.getValidResolution(),
      container: 'TVChartContainer',
      library_path: "../chart/",
      custom_css_url: "css/style.css",
      locale: 'en',
      disabled_features: [
        'use_localstorage_for_settings',
        'header_widget_dom_node',
      ],
      enabled_features: [
        'study_templates',
        'hide_left_toolbar_by_default'
      ],
      charts_storage_api_version: "1.1",
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      fullscreen: true,
      autosize: true,
      theme: 'dark',
      toolbar_bg: "#101019",
      custom_font_family: '"Lato", sans-serif',
      loading_screen: {
        backgroundColor: "#101019",
        foregroundColor: "#101019",
      },
      overrides: this.getChartOverrides(params),
     
    
    };
  },

  getChartOverrides(params: { symbol?: any; b?: any; l?: any; }) {
    return {
      "paneProperties.backgroundType": "solid",
      "paneProperties.background": params.b ? `#${params.b}` : "#101019",
      "paneProperties.textColor": "#ffffff",
      "paneProperties.vertGridProperties.color": params.l ? `#${params.l}` : "#222225",
      "paneProperties.horzGridProperties.color": params.l ? `#${params.l}` : "#222225",
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
    };
  }
};
