const webSocketWorkerScript = `
let socket = null;
let messageQueue = [];
let isAppInBackground = false;
let retryCount = 0;
const maxRetries = 5;
let url = '';

onmessage = function(e) {
  const { type, payload } = e.data;
  switch (type) {
    case 'INIT':
      url = payload;
      connect(url);
      break;
    case 'SEND':
      sendMessage(payload);
      break;
    case 'APP_STATE_CHANGE':
      handleAppStateChange(payload);
      break;
    case 'DISCONNECT':
      disconnect();
      break;
    default:
      break;
  }
};
function connect(url) {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket(url);

    socket.onopen = () => {
      retryCount = 0;
      if (!isAppInBackground) {
        postMessage({ type: 'open' });
      }
    };

    socket.onmessage = (message) => {
      messageQueue.push(message.data);
      if (!isAppInBackground) {
        processMessageQueue();
      }
    };

    socket.onclose = () => {
      if (!isAppInBackground) {
        postMessage({ type: 'WebSocketClosed' });
        attemptReconnect();
      }
    };

    socket.onerror = (error) => {
      if (!isAppInBackground) {
        postMessage({ type: 'WebSocketError', payload: error });
        attemptReconnect();
      }
    };
  }
}

function attemptReconnect() {
  if (retryCount < maxRetries) {
    setTimeout(
      () => {
        retryCount += 1;
        connect(url);
      },
      Math.pow(2, retryCount) * 1000
    );
  } else {
    postMessage({ type: 'WebSocketFailure', payload: 'Max retries exceeded' });
  }
}

function processMessageQueue() {
  if (messageQueue.length > 0) {
    const message = messageQueue.shift();
      postMessage({ type: 'WebSocketMessage', payload: message });
      processMessageQueue();
  }
}

function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  }
}

function handleAppStateChange(nextAppState) {

  if (nextAppState === 'inactive') {
    isAppInBackground = true;
    messageQueue=[];
    disconnect()
  } else if (nextAppState === 'active') {
    attemptReconnect()
    isAppInBackground = false;
    processMessageQueue();
  }
}

function disconnect() {
  if (socket) {
    socket.close();
    messageQueue = [];
  }
}
`;

const webSocketWorkerBlob = new Blob([webSocketWorkerScript], { type: 'application/javascript' });
export const webSocketWorkerURL = URL.createObjectURL(webSocketWorkerBlob);
