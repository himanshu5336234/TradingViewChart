

import { TV_INTERVALS } from "./constants.js";
import { SubscriptionManager } from "./subscriptionManager.js";
import { MessageHandler } from "./messageHandler.js";
import { ConnectionManager } from "./connectionManager.js";

import WebSocketManager from "../WebWorkerService/WebSocketManager.js";
import { getBaseURL } from "../baseUrl.js";

const chartWS = () => {
  const { binanceWsBase } = getBaseURL();
  const socketManager = WebSocketManager.getInstance();
  const subscriptionManager = new SubscriptionManager();
  const messageHandler = new MessageHandler(subscriptionManager);
  const connectionManager = new ConnectionManager(socketManager, binanceWsBase);

  // Initialize connection and set up event handlers
  connectionManager.setupEventHandlers(messageHandler, subscriptionManager);
  connectionManager.connect();

  return {
    tvIntervals: TV_INTERVALS,

    subscribeOnStream: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback
    ) => {
      try {
        const paramStr = subscriptionManager.generateSubscriptionParam(subscriberUID, TV_INTERVALS);
        const subscriptionObj = subscriptionManager.getSubscriptionRequest(paramStr);
        
        subscriptionManager.storeLastSub = JSON.stringify(subscriptionObj);
        subscriptionManager.addSubscription(subscriberUID, paramStr, onRealtimeCallback);

        if (connectionManager.isConnected) {
          socketManager.send(subscriptionManager.storeLastSub);
        }
      } catch (e) {
        console.error('Subscription error:', e);
      }
    },

    unsubscribeFromStream: (subscriberUID) => {
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