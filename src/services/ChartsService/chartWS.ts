

import WebSocketManager from "../../managers/WebSocketManager.js";

import { generateSubscriptionParam, getSubscriptionRequest } from "@helpers/chart-helpers.js";

const chartWS = () => {
  const socketManager = WebSocketManager.getInstance();
  // connectionManager.connect();

  return {
  

    subscribeOnStream: (
      symbolInfo: any,
      resolution: any,
      onRealtimeCallback: (arg0: { time: any; close: number; open: number; high: number; low: number; volume: number; }) => void,
      subscriberUID: string,
      onResetCacheNeededCallback: any
    ) => {
      try {

        const paramStr = (generateSubscriptionParam(subscriberUID));
        const subscriptionObj = getSubscriptionRequest(paramStr);
        socketManager.send(JSON.stringify(subscriptionObj))
        socketManager.addEventListener(paramStr, (data) => {
          debugger
         console.log(data, 'data');
          const parsedData = JSON.parse(data);
          if (parsedData && parsedData.s) {
            const bar = {
              time: parsedData.k.t,
              close: parseFloat(parsedData.k.c),
              open: parseFloat(parsedData.k.o),
              high: parseFloat(parsedData.k.h),
              low: parseFloat(parsedData.k.l),
              volume: parseFloat(parsedData.k.v)
            };
            onRealtimeCallback(bar);
          }
        });
   
      } catch (e) {
        console.error('Subscription error:', e);
      }
    },

    unsubscribeFromStream: (subscriberUID: any) => {
      try {
        const paramStr = subscriptionManager.generateSubscriptionParam(subscriberUID, TV_INTERVALS);
        const unsubObj = subscriptionManager.getSubscriptionRequest(paramStr, 'UNSUBSCRIBE');

        if (connectionManager.isConnected) {
          socketManager.send(JSON.stringify(unsubObj));
        }

        subscriptionManager.removeSubscription(subscriberUID, paramStr);
      } catch (e) {
        console.error('Unsubscription error:', e);
      }
    },

    getWSConnectionStatus: () => {
      return connectionManager.isConnected;
    }
  };
};

export default chartWS;