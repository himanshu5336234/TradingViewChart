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
    console.log( stream, data )
    try {
        if (stream === paramStr && data.k) {
            const { o, h, l, v, c, T, t } = data.k;
            const lastSocketData = {
                time: t,
                close: Number(c),
                open: Number(o),
                high: Number(h),
                low: Number(l),
                volume: Number(v),
                closeTime: T,
                openTime: t,
            };
            onRealtimeCallback(lastSocketData);
        }
    } catch (e) {
        console.error(e);
    }
};