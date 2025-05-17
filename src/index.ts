
import { ChartManager } from './Service/ChartsService/chartManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const chartManager = new ChartManager();
  chartManager.initChart();
});
