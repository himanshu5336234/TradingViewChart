import chartWS from './streaming.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js';
import { getBaseURL } from './baseUrl.js';

const { binanceBaseUrl } = getBaseURL();
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
const lastBarsCache = new Map();
let allSymbols = [];

/**
 * Fetches the available trading symbols from Binance.
 */
const getBinanceSymbols = async () => {
    try {
        const { data } = await axios.get(`${binanceBaseUrl}/fapi/v1/exchangeInfo`);
        allSymbols = data.symbols || [];
        return allSymbols;
    } catch (error) {
        console.error("Error fetching Binance symbols:", error);
        throw new Error("Failed to load Binance symbols");
    }
};

/**
 * Fetches Binance Klines (candlestick) data.
 */
const getBinanceKlines = async (symbol, interval, startTime, endTime, limit = 1500) => {
    try {
        const url = `${binanceBaseUrl}/fapi/v1/continuousKlines?pair=${symbol}&contractType=PERPETUAL&interval=${interval}`
            + `${startTime ? `&startTime=${startTime}` : ""}`
            + `${endTime ? `&endTime=${endTime}` : ""}`
            + `&limit=${limit}`;

        const { data } = await axios.get(url, { CancelToken: source });
        return data || [];
    } catch (error) {
        console.error("Error fetching Klines:", error);
        throw new Error("Failed to fetch Klines data");
    }
};

/**
 * Determines the price scale based on Binance filters.
 */
const getPriceScale = (symbol) => {
    const filter = symbol.filters.find(f => f.filterType === "PRICE_FILTER");
    return filter ? Math.round(1 / parseFloat(filter.tickSize)) : 1;
};

/**
 * Fetches historical candlestick data.
 */
const getKlines = async (from, to, symbolInfo, interval) => {
    try {
        let klines = await getBinanceKlines(symbolInfo.name, interval, from, to);
        return klines.map(kline => ({
            time: kline[0],
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5])
        }));
    } catch (error) {
        console.error("Error retrieving Klines:", error);
        throw new Error("Failed to fetch historical data");
    }
};

const { subscribeOnStream, unsubscribeFromStream, tvIntervals, getWSConnectionStatus } = chartWS();

const dataFeed = {
    onReady: async (callback) => {
        try {
            if (!allSymbols.length) {
                await getBinanceSymbols();
            }
            callback({
                supports_marks: false,
                supports_timescale_marks: false,
                supports_time: true,
                supported_resolutions: [
                    "1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "1D", "3D", "1W", "1M"
                ]
            });
        } catch (error) {
            console.error("Error in onReady:", error);
        }
    },

    resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
        try {
            if (!allSymbols.length) {
                await getBinanceSymbols();
            }

            const symbol = allSymbols.find(symb => symb.symbol === symbolName.toUpperCase());

            // if (symbol) {
                onSymbolResolvedCallback({
                    name: symbolName,
                   description: `${symbolName} / ${symbolName}`,
                    ticker: symbolName,
                    exchange: "Binance",
                    type: "crypto",
                    session: "24x7",
                    minmov: 1,
                    pricescale: getPriceScale(symbol),
                    has_intraday: true,
                    has_daily: true,
                    has_weekly_and_monthly: true,
                    currency_code: symbolName
                });
            // } else {
            //     throw new Error(`Symbol ${symbolName} not found`);
            // }
        } catch (error) {
            console.error("resolveSymbol error:", error);
            onResolveErrorCallback("Symbol Not Found");
        }
    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        try {
            const { from, to } = periodParams;
            const interval = tvIntervals[resolution];

            if (!interval) {
                return onErrorCallback("Invalid interval");
            }

            const bars = await getKlines(from * 1000, to * 1000, symbolInfo, interval);
            onHistoryCallback(bars, { noData: bars.length === 0 });
        } catch (error) {
            console.error("getBars error:", error);
            onErrorCallback("Failed to fetch historical data");
        }
    },

    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
        subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback, lastBarsCache.get(symbolInfo.full_name));
    },

    unsubscribeBars: (subscriberUID) => {
        unsubscribeFromStream(subscriberUID);
    }
};

// Auto-reconnect on visibility change
window.addEventListener('visibilitychange', () => {
    if (!getWSConnectionStatus()) {
        window.location.reload();
    }
});

export { dataFeed };
