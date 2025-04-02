export class MessageHandler {
    constructor(subscriptionManager) {
      this.subscriptionManager = subscriptionManager;
    }
  
    processMessage(msg) {
      const rawData = msg.data || msg;
      
      try {
        const message = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        
        if (message.stream && message.data) {
          this.handleKlineData(message);
        } else {
          console.log("Non-kline message received:", message);
        }
      } catch (e) {
        console.error("Message processing failed:", e);
        console.error("Original message:", msg);
      }
    }
  
    handleKlineData(message) {
      const streamId = this.subscriptionManager.subscriptionMap.get(message.stream);
      const streamData = this.subscriptionManager.streams[streamId];
      
      if (streamId && streamData) {
        const kline = message.data.k;
        if (kline) {
          const barData = this.formatBarData(kline);
          streamData.listener(barData);
        }
      }
    }
  
    formatBarData(kline) {
      return {
        time: kline.t,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
        closeTime: kline.T
      };
    }
  }