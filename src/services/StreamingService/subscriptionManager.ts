export class SubscriptionManager {
    constructor() {
      this.streams = {};
      this.subscriptionMap = new Map();
      this.storeLastSub = null;
    }
  
 
  
    addSubscription(subscriberUID, paramStr, callback) {
      this.subscriptionMap.set(paramStr, subscriberUID);
      this.streams[subscriberUID] = { paramStr, listener: callback };
    }
  
    removeSubscription(subscriberUID, paramStr) {
      this.subscriptionMap.delete(paramStr);
      delete this.streams[subscriberUID];
    }
  

  }