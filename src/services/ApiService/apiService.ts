import axios from 'axios';
import { getBaseURL } from './baseUrl';

const { binanceBaseUrl } = getBaseURL();

interface SymbolFilter {
  filterType: string;
  tickSize: string;
}

interface SymbolInfo {
  symbol: string;
  filters: SymbolFilter[];
  [key: string]: any; // for extra properties
}

interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class ApiService {

  private symbolsCache: SymbolInfo[] | null;
  private lastBarsCache: Map<string, Kline[]>;

  constructor() {
    this.symbolsCache = null;
    this.lastBarsCache = new Map();
  }

  async getSymbols(): Promise<SymbolInfo[]> {
    if (this.symbolsCache) return this.symbolsCache;

    try {
      const { data } = await axios.get<{ symbols: SymbolInfo[] }>(`${binanceBaseUrl}/fapi/v1/exchangeInfo`);
      this.symbolsCache = data.symbols || [];
      return this.symbolsCache;
    } catch (error) {
      console.error('Error fetching symbols:', error);
      throw error;
    }
  }

  async getKlines(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit = 1500
  ): Promise<Kline[]> {
    try {
      const url =
        `${binanceBaseUrl}/fapi/v1/continuousKlines?pair=${symbol}&contractType=PERPETUAL&interval=${interval}` +
        (startTime ? `&startTime=${startTime}` : '') +
        (endTime ? `&endTime=${endTime}` : '') +
        `&limit=${limit}`;

      const { data } = await axios.get<any[][]>(url);
      return data.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
    } catch (error) {
      console.error('Error fetching klines:', error);
      throw error;
    }
  }

  getPriceScale(symbol: SymbolInfo): number {
    const filter = symbol.filters.find(f => f.filterType === 'PRICE_FILTER');
    return filter ? Math.round(1 / parseFloat(filter.tickSize)) : 1;
  }
  getLastBars(symbol: string): Kline[] {
    if (this.lastBarsCache.has(symbol)) {
      return this.lastBarsCache.get(symbol) || [];
    }
    return [];
  }
  setLastBars(symbol: string, bars: Kline[]): void {
    this.lastBarsCache.set(symbol, bars);
  }
  clearLastBars(symbol: string): void {
    this.lastBarsCache.delete(symbol);
  }
  clearAllLastBars(): void {
    this.lastBarsCache.clear();
  }
}

export const apiService = new ApiService();
