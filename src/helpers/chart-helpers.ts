import { TV_INTERVALS } from "@constants/charts-constant";

export function generateSubscriptionParam(subscriberUID: string):string {
    const id = subscriberUID.split("_#_");
    localStorage.setItem("user_pc_resolution_chart_x", JSON.stringify({ "resolution": id[2] }));
    return `${id[0].toLowerCase()}@kline_${TV_INTERVALS[id[2]]}`;
}
export  function   getSubscriptionRequest(paramStr:string, type = 'SUBSCRIBE') {
    return {
      method: type,
      params: [paramStr],
      id: Date.now()
    };
  }