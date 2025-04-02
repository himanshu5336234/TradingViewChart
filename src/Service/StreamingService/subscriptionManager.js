export class SubscriptionManager {
    constructor() {
      this.streams = {};
      this.subscriptionMap = new Map();
      this.storeLastSub = null;
    }
  
    generateSubscriptionParam(subscriberUID, intervals) {
      const id = subscriberUID.split("_#_");
      localStorage.setItem("user_pc_resolution_chart_x", JSON.stringify({ "resolution": id[2] }));
      return `${id[0].toLowerCase()}@kline_${intervals[id[2]]}`;
    }
  
    addSubscription(subscriberUID, paramStr, callback) {
      this.subscriptionMap.set(paramStr, subscriberUID);
      this.streams[subscriberUID] = { paramStr, listener: callback };
    }
  
    removeSubscription(subscriberUID, paramStr) {
      this.subscriptionMap.delete(paramStr);
      delete this.streams[subscriberUID];
    }
  
    getSubscriptionRequest(paramStr, type = 'SUBSCRIBE') {
      return {
        method: type,
        params: [paramStr],
        id: Date.now()
      };
    }
  }