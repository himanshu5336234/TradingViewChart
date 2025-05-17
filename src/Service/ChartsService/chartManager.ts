import { eventBus } from './eventBus.js';
import { ResolutionHelper, WidgetConfigHelper, UrlHelper } from './helpers.js';

export class ChartManager {
  constructor() {
    this.widget = null;
    this.params = UrlHelper.getParams();
    this.initEventListeners();
  }

  initEventListeners() {
    eventBus.subscribe('symbolChange', this.handleSymbolChange.bind(this));
    eventBus.subscribe('resolutionChange', this.handleResolutionChange.bind(this));
    // eventBus.subscribe('windowResize', this.handleWindowResize.bind(this));
    
    window.addEventListener('message', this.handleWindowMessage.bind(this));
    window.addEventListener('resize', () => eventBus.publish('windowResize'));
  }

  handleWindowMessage(event) {
    if (event.data && event.data.action === 'updateSymbol') {
      eventBus.publish('symbolChange', event.data.symbol);
    }
  }

  handleSymbolChange(newSymbol) {
    if (this.widget && newSymbol) {
      const symbol = newSymbol.toUpperCase();
      this.widget.setSymbol(symbol, "1D", () => {
        console.log("Symbol updated to", symbol);
      });
    }
  }

  handleResolutionChange(interval) {
    ResolutionHelper.saveResolution(interval);
  }

  handleWindowResize() {
    // if (this.widget) {
    //   this.widget.resize();
    // }
  }

  initChart() {
    ResolutionHelper.cleanInvalidResolutions();
    const config = WidgetConfigHelper.getDefaultConfig(this.params);
    
    this.widget = new TradingView.widget(config);
    
    this.widget.onChartReady(() => {
      const chart = this.widget.chart();
      chart.onIntervalChanged().subscribe(null, (interval) => {
        eventBus.publish('resolutionChange', interval);
      });
    });
  }
}
