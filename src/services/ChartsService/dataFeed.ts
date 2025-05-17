import axios, { CancelTokenSource } from 'axios';
import { getBaseURL } from '../ApiService/baseUrl.js';
import { generateSubscriptionParam, getSubscriptionRequest, helperOnMessage } from '@helpers/chart-helpers.js';
import WebSocketManager from '@managers/WebSocketManager.js';
// Make sure to uncomment and fix this import path accordingly


interface SymbolInfo {
    symbol: string;
    filters: Array<{ filterType: string; tickSize: string }>;
    name?: string; // Optional, used in your getKlines call
    full_name?: string;
}

interface Bar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface PeriodParams {
    from: number; // Unix timestamp in seconds
    to: number;   // Unix timestamp in seconds
}

interface OnHistoryCallback {
    (bars: Bar[], meta: { noData: boolean }): void;
}

interface OnErrorCallback {
    (reason: string): void;
}

const { binanceBaseUrl } = getBaseURL();

let cancelSource: CancelTokenSource | null = null;
const lastBarsCache = new Map<string, Bar[]>();
let allSymbols: SymbolInfo[] = [];

/**
 * Fetch all Binance symbols.
 */
async function getBinanceSymbols(): Promise<SymbolInfo[]> {
    try {
        const { data } = await axios.get(`${binanceBaseUrl}/fapi/v1/exchangeInfo`);
        allSymbols = data.symbols || [];
        return allSymbols;
    } catch (error) {
        console.error("Error fetching Binance symbols:", error);
        throw new Error("Failed to load Binance symbols");
    }
}

/**
 * Fetch Klines data from Binance API.
 */
async function getBinanceKlines(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit = 1500
): Promise<any[]> {
    try {
        // Cancel previous request if any
        if (cancelSource) {
            cancelSource.cancel("Operation canceled due to new request.");
        }
        cancelSource = axios.CancelToken.source();

        const url = `${binanceBaseUrl}/fapi/v1/continuousKlines?pair=${symbol}&contractType=PERPETUAL&interval=${interval}`
            + (startTime ? `&startTime=${startTime}` : "")
            + (endTime ? `&endTime=${endTime}` : "")
            + `&limit=${limit}`;

        const { data } = await axios.get(url, { cancelToken: cancelSource.token });
        return data || [];
    } catch (error) {
        if (axios.isCancel(error)) {
            console.warn("Previous request canceled", error.message);
            return [];
        }
        console.error("Error fetching Klines:", error);
        throw new Error("Failed to fetch Klines data");
    }
}

/**
 * Calculate price scale from symbol filters.
 */
function getPriceScale(symbol: SymbolInfo): number {
    const filter = symbol.filters.find(f => f.filterType === "PRICE_FILTER");
    if (!filter) return 1;
    return Math.round(1 / parseFloat(filter.tickSize));
}

/**
 * Convert raw klines array to structured Bar array.
 */
async function getKlines(
    from: number,
    to: number,
    symbolInfo: SymbolInfo,
    interval: string
): Promise<Bar[]> {
    try {
        const rawKlines = await getBinanceKlines(symbolInfo.name || symbolInfo.symbol, interval, from, to);
        return rawKlines.map(kline => ({
            time: kline[0],
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5]),
        }));
    } catch (error) {
        console.error("Error retrieving Klines:", error);
        throw new Error("Failed to fetch historical data");
    }
}

// Uncomment and fix the import path

const tvIntervals: Record<string, string> = {
    "1": "1m",
    "3": "3m",
    "5": "5m",
    "15": "15m",
    "30": "30m",
    "60": "1h",
    "120": "2h",
    "240": "4h",
    "360": "6h",
    "480": "8h",
    "720": "12h",
    "1D": "1d",
    "3D": "3d",
    "1W": "1w",
    "1M": "1M",
};

export const dataFeed = {
    onReady: async (callback: (config: object) => void) => {
        try {
            if (!allSymbols.length) {
                await getBinanceSymbols();
            }
            callback({
                supports_marks: false,
                supports_timescale_marks: false,
                supports_time: true,
                supported_resolutions: Object.keys(tvIntervals),
            });
        } catch (error) {
            console.error("Error in onReady:", error);
        }
    },

    resolveSymbol: async (
        symbolName: string,
        onSymbolResolvedCallback: (symbolData: object) => void,
        onResolveErrorCallback: (errorMessage: string) => void
    ) => {
        try {
            if (!allSymbols.length) {
                await getBinanceSymbols();
            }

            const symbol = allSymbols.find(s => s.symbol === symbolName.toUpperCase());

            setTimeout(() => {
                if (!symbol) {
                    onResolveErrorCallback("Symbol Not Found");
                    return;
                }
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
                    currency_code: symbolName,
                });
            }, 0);
        } catch (error) {
            console.error("resolveSymbol error:", error);
            setTimeout(() => onResolveErrorCallback("Symbol Not Found"), 0);
        }
    },

    getBars: async (
        symbolInfo: SymbolInfo,
        resolution: string,
        periodParams: PeriodParams,
        onHistoryCallback: OnHistoryCallback,
        onErrorCallback: OnErrorCallback
    ) => {
        try {
            const { from, to } = periodParams;
            const interval = tvIntervals[resolution];

            if (!interval) {
                onErrorCallback("Invalid interval");
                return;
            }

            const bars = await getKlines(from * 1000, to * 1000, symbolInfo, interval);
            onHistoryCallback(bars, { noData: bars.length === 0 });
        } catch (error) {
            console.error("getBars error:", error);
            onErrorCallback("Failed to fetch historical data");
        }
    },

    subscribeBars: (
        _symbolInfo: SymbolInfo,
        _resolution: string,
        onRealtimeCallback: (bar: Bar) => void,
        subscriberUID: string,
        _onResetCacheNeededCallback: () => void
    ) => {
        try {
            const socketManager = WebSocketManager.getInstance();
            const paramStr = (generateSubscriptionParam(subscriberUID));
            const subscriptionObj = getSubscriptionRequest(paramStr);
            socketManager.send(JSON.stringify(subscriptionObj))



            // Add listener and keep reference for later removal
            socketManager.addListener("WebSocketMessage", (message: any) => {
                helperOnMessage(message, paramStr, onRealtimeCallback);
            });

        } catch (e) {
            console.error('Subscription error:', e);
        }
    },

    unsubscribeBars: (subscriberUID: string) => {
        try {
            const socketManager = WebSocketManager.getInstance();
            const paramStr = generateSubscriptionParam(subscriberUID);
            const unsubObj = getSubscriptionRequest(paramStr, 'UNSUBSCRIBE');
            if (socketManager.connectionStatus) {
                socketManager.send(JSON.stringify(unsubObj));
            }
        } catch (e) {
            console.error('Unsubscription error:', e);
        }
    },

};
