import { getBaseURL } from "./baseUrl.js";
const chartWS = () => {
	const RECONNECT_DELAY = 5000; // Delay before attempting to reconnect (in milliseconds)
	let reconnectTimeout;
	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams, prop) => searchParams.get(prop),
	});
	// console.log(params, "params");
	const isLowEnd = params.isLowEnd ?? false;
	const env = params.env ?? "local"
	// console.log('chart ws called')
	const streams = {};
	const activeSubscriptionStr = [];
	const subscriptionMap = new Map();
	let storeLastSub;
	let interval;
	let isWSConnected = false;
	// let lastStickClosingValue;
	const optimHelper = throttleFunction(helperOnMessage, 3000);

	const tvIntervals = {
		'1s': '1s',
		1: "1m",
		3: "3m",
		5: "5m",
		15: "15m",
		30: "30m",
		60: "1h",
		120: "2h",
		240: "4h",
		360: "6h",
		480: "8h",
		720: "12h",
		D: "1d",
		"1D": "1d",
		"3D": "3d",
		W: "1w",
		"1W": "1w",
		M: "1M",
		"1M": "1M"
	}
	const {
		binanceWsBase
	} = getBaseURL();

	let socket
	const connectWebSocket = () => {
		socket = new WebSocket(binanceWsBase)

		socket.onopen = () => {
			console.log('[s] conn');
			isWSConnected = true;
			if(!reconnectTimeout)
				setTimeout(() => {socket.close()}, 10000)
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
			if (storeLastSub) {
				socket.send(storeLastSub)
			}
			interval = setInterval(() => {
				socket.send(JSON.stringify({
					method: "PING",
					params: ["PING"],
					id: 69
				}))
			}, 180000);
		}

		socket.onclose = () => {
			console.log('[s] Disc:');
			isWSConnected = false;
			if (interval) clearInterval(interval)
			// window.location.reload();
			reconnect()
		};

		socket.onerror = (error) => {
			console.log('[s] Error:', error);
			// window.location.reload();

		}

		socket.onmessage = (msg) => {
			// console.log("in messages")
			//throttle 

			if (!msg?.data) {
				return;
			}
			if (env !== "uat") {
				helperOnMessage(msg);
			}
			else if (!isLowEnd) {
				helperOnMessage(msg)
			}
			else {
				console.log("here");
				optimHelper(msg);
			}
		}
	}

	const reconnect = () => {
		console.log('Attempting to reconnect...');
		reconnectTimeout = setTimeout(connectWebSocket, RECONNECT_DELAY);
	};

	connectWebSocket();

	const generateSubscriptionParamFromUID = function (subscriberUID) {
		const id = subscriberUID.split("_#_");
		localStorage.setItem("user_pc_resolution_chart_density", JSON.stringify({ "resolution": id[2] }))
		const paramStr = `${id[0].toLowerCase()}@kline_${tvIntervals[id[2]]}`;
		return paramStr;
	}

	function throttleFunction(cb, delay) {
		let last = 0;
		return (...args) => {
			let now = new Date().getTime();
			if (now - last < delay) {
				return;
			}
			last = now;
			cb(...args);
		}
	}

	function helperOnMessage(msg) {
		console.log('[s] MR');

		const sData = JSON.parse(msg.data);
		const streamId = subscriptionMap.get(sData.stream);
		try {
			if (sData.data && sData.data.k) {
				// const { s } = sData.data;
				const { o, h, l, v, c, T, t } = sData.data.k;
				const lastSocketData = {
					time: t,
					close: parseFloat(c),
					open: parseFloat(o),
					high: parseFloat(h),
					low: parseFloat(l),
					volume: parseFloat(v),
					closeTime: T,
					openTime: t
				};
				if (Object.keys(streams).length) {
					streams[streamId].data = lastSocketData;
					streams[streamId].listener(lastSocketData);
				}
			}
		} catch (e) {
			streamStarted = false;
			console.error(e);
		}

	}



	return {

		tvIntervals,

		subscribeOnStream: function (
			symbolInfo,
			resolution,
			onRealtimeCallback,
			subscribeUID,
			onResetCacheNeededCallback,
			lastDailyBar,
		) {
			try {
				const paramStr = generateSubscriptionParamFromUID(subscribeUID);
				activeSubscriptionStr.push(paramStr);
				const obj = {
					method: "SUBSCRIBE",
					params: [
						paramStr
					],
					id: 1
				};
				let interval1 = setInterval(() => {
					console.log("srs", socket.readyState);
					if (socket.readyState === 1) {
						socket.send(JSON.stringify(obj));
						storeLastSub = JSON.stringify(obj);
						subscriptionMap.set(paramStr, subscribeUID);
						streams[subscribeUID] = {
							paramStr,
							listener: onRealtimeCallback
						};
						clearInterval(interval1);
					}
				}, 100);

			} catch (e) {
				console.error(e);
			}


		},

		unsubscribeFromStream: function (subscriberUID) {
			try {
				const subscriptionParams = generateSubscriptionParamFromUID(subscriberUID);
				const obj = {
					method: "UNSUBSCRIBE",
					params: [
						subscriptionParams
					],
					id: 1
				};
				if (socket.readyState === 1) {
					socket.send(JSON.stringify(obj));
					clearInterval(interval);
					delete streams[subscriberUID];
				}
			} catch (e) {
				console.error(e);
			}
		},
		getWSConnectionStatus: () => {
			return isWSConnected && socket.readyState === 1;
		},
	}

};




export default chartWS
