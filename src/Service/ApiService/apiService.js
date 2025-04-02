import axios from 'axios';
import { getBaseURL } from '../baseUrl.js';

const { binanceBaseUrl } = getBaseURL();
const CancelToken = axios.CancelToken;

export class ApiService {
  constructor() {
    this.source = CancelToken.source();
    this.symbolsCache = null;
    this.lastBarsCache = new Map();
  }

  async getSymbols() {
    if (this.symbolsCache) return this.symbolsCache;
    
    try {
      const { data } = await axios.get(`${binanceBaseUrl}/fapi/v1/exchangeInfo`, {
        cancelToken: this.source.token
      });
      this.symbolsCache = data.symbols || [];
      return this.symbolsCache;
    } catch (error) {
      console.error("Error fetching symbols:", error);
      throw error;
    }
  }

  async getKlines(symbol, interval, startTime, endTime, limit = 1500) {
    try {
      const url = `${binanceBaseUrl}/fapi/v1/continuousKlines?pair=${symbol}&contractType=PERPETUAL&interval=${interval}` +
        `${startTime ? `&startTime=${startTime}` : ""}` +
        `${endTime ? `&endTime=${endTime}` : ""}` +
        `&limit=${limit}`;

      const { data } = await axios.get(url, { cancelToken: this.source.token });
      return data.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));
    } catch (error) {
      console.error("Error fetching klines:", error);
      throw error;
    }
  }

  getPriceScale(symbol) {
    const filter = symbol?.filters?.find(f => f.filterType === "PRICE_FILTER");
    return filter ? Math.round(1 / parseFloat(filter.tickSize)) : 1;
  }

  cancelAllRequests() {
    this.source.cancel("Operation canceled by user");
    this.source = CancelToken.source();
  }
}

export const apiService = new ApiService();
