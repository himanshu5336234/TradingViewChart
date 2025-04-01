import { dataFeed } from './dataFeed.js';
import { ChartManager } from './chartManager.js';

// Make dataFeed available globally (required by TradingView)
window.dataFeed = dataFeed;

document.addEventListener('DOMContentLoaded', () => {
  const chartManager = new ChartManager();
  chartManager.initChart();
});
