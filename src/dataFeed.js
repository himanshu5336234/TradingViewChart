import chartWS from './streaming.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.min.js'
import { getBaseURL } from './baseUrl.js'

const {
	binanceBaseUrl,
	densityBaseUrl
} = getBaseURL();

const CancelToken = axios.CancelToken;
const source = CancelToken.source();
const lastBarsCache = new Map();
let allSymbols;
const getBinanceSymbols= () => {
    return axios.get(`${densityBaseUrl}/tradeable-symbol`).then(({data}) => {
      return data.symbols;
    }).catch(() => { throw new Error("Error getting symbol data"); })

  }
let lastStartTime ;
const  getBinanceKlines = (symbol, interval, startTime, endTime, limit) => {
		if (lastStartTime && startTime === lastStartTime){
			return [];
		}
		lastStartTime = startTime;
    const url = `${binanceBaseUrl}/fapi/v1/continuousKlines?pair=${symbol}&contractType=PERPETUAL&interval=${interval}${startTime ? `&startTime=${startTime}` : ""}${endTime ? `&endTime=${endTime}` : ""}${limit ? `&limit=${limit}` : ""}`;
    return axios.get(url,{CancelToken: source}).then(res => {
      return res.data
    }).then(json => {
      return json;
    });
  }
function pricescale(symbol) {
	for (const filter of symbol.filters) {
	  if (filter.filterType === "PRICE_FILTER") {
		return Math.round(1 / parseFloat(filter.tickSize));
	  }
	}
	return 1;
  }

async function getKlines(from,to,symbolInfo,interval){
	let totalKlines =[];
	const kLinesLimit = 1500;
	try{
		let data = await getBinanceKlines(symbolInfo.name, interval, from, to, kLinesLimit);
		totalKlines = [...totalKlines, ...data];
		while(data.length === kLinesLimit){
			data = await getBinanceKlines(symbolInfo.name, interval, from, to, kLinesLimit);
			totalKlines = [...totalKlines, ...data];
		}
		const historyCBArray = totalKlines.map(kline => ({
			  time: kline[0],
			  open: parseFloat(kline[1]),
			  high: parseFloat(kline[2]),
			  low: parseFloat(kline[3]),
			  close: parseFloat(kline[4]),
			  volume: parseFloat(kline[5])
			}));
		
		return historyCBArray
	}
	catch(err){
		console.log("error yah")
		throw new Error('Error in getting klines')
	}
}
const {
	subscribeOnStream,
	unsubscribeFromStream,
	tvIntervals,
	getWSConnectionStatus
} = chartWS()

const dataFeed =  {
	onReady: (callback) => {
		getBinanceSymbols().then(symbs => {
			allSymbols = symbs;
			callback({
				supports_marks: false,
				supports_timescale_marks: false,
				supports_time: true,
				supported_resolutions: [
				  "1", "3", "5", "15", "30", "60", "120", "240", "360", "480", "720", "1D", "3D", "1W", "1M"
				]
			  })
		})
		.catch(er=> {
			setErrorState(true);
			return;
		});
	},

	
	resolveSymbol: async (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback,
		extension
	) => {
		
		const comp = symbolName.split(":");
		symbolName = (comp.length > 1 ? comp[1] : symbolName).toUpperCase();
		for(const symb of allSymbols){
			if(symb.symbol === symbolName){
				setTimeout(() => {
					onSymbolResolvedCallback({
					  name: symb.symbol,
					  description: symb.baseAsset + " / " + symb.quoteAsset,
					  ticker: symb.symbol,
					  exchange: "Density",
					  listed_exchange: "Density",
					  type: "crypto",
					  session: "24x7",
					  minmov: 1,
					  pricescale: pricescale(symb),
					  has_intraday: true,
					  has_daily: true,
					  has_weekly_and_monthly: true,
					  currency_code: symb.quoteAsset
					});
				  }, 0);
				  return;
			}
		}
		onResolveErrorCallback("not Found");
		
	},


	getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
		let {from, to} = periodParams;
		const interval  = tvIntervals[resolution];
		if(!interval) onErrorCallback("Invalid Interval");
		from *= 1000;
		to *= 1000;
		getKlines(from,to,symbolInfo,interval).then(res=> {
				if(res.length === 0){
					onHistoryCallback([],{ noData: true })
				}
				else{
					onHistoryCallback(res,{ noData: false });
				}
			}).catch(()=> onErrorCallback(`Error in 'getKlines' func`))
	},
	subscribeBars: (
		symbolInfo,
		resolution,
		onRealtimeCallback,
		subscriberUID,
		onResetCacheNeededCallback,
	) => {
		// console.log(onRealtimeCallback)
		 subscribeOnStream(
			symbolInfo,
			resolution,
			onRealtimeCallback,
			subscriberUID,
			onResetCacheNeededCallback,
			lastBarsCache.get(symbolInfo.full_name),
		);
	},

	unsubscribeBars: (subscriberUID) => {
		unsubscribeFromStream(subscriberUID);
	},
};

window.addEventListener('visibilitychange', () => {
	if(!getWSConnectionStatus()) window.location.reload();
})

export { dataFeed};

