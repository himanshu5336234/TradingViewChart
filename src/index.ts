import ChartManager from "@managers/ChartManager";
import WebSocketManager from "@managers/WebSocketManager";

document.addEventListener('DOMContentLoaded', () => {

  ChartManager.initChart();
  WebSocketManager.getInstance();
});
