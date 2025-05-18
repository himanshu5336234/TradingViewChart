import { ResolutionHelper, UrlHelper, WidgetConfigHelper } from "@helpers/chart-helpers.js";
declare global {
  interface Window {
    TradingView: any;
  }
}

type WidgetConfig = any; // Adjust this to the actual config type if known


class ChartManager {
  private widget: any | null;
  private params:any;

  constructor() {
    this.widget = null;
    this.params = UrlHelper.getParams();
    this.initEventListeners();
  }

  /**
   * Initialize event listeners for handling
   * symbol changes, resolution changes,
   * window messages, and window resize events.
   */
  private initEventListeners(): void {
    // eventBus.subscribe('symbolChange', this.handleSymbolChange.bind(this));
    // eventBus.subscribe('resolutionChange', this.handleResolutionChange.bind(this));
    // Optionally listen to windowResize event:
    // eventBus.subscribe('windowResize', this.handleWindowResize.bind(this));

    // Listen for messages sent to the window (e.g. postMessage)
    window.addEventListener('message', this.handleWindowMessage.bind(this));
    // Publish windowResize event on window resize
    // window.addEventListener('resize', () => eventBus.publish('windowResize'));
  }

  /**
   * Handles window 'message' event.
   * If message action is 'updateSymbol',
   * publishes 'symbolChange' event with new symbol.
   */
  private handleWindowMessage(event: MessageEvent): void {
    if (event.data && event.data.action === 'updateSymbol') {
      // eventBus.publish('symbolChange', event.data.symbol);
    }
  }

  /**
   * Handles symbol change event.
   * Updates the chart widget's symbol if initialized.
   * @param newSymbol The new symbol to set.
   */
  private handleSymbolChange(newSymbol: string): void {
    if (this.widget && newSymbol) {
      const symbol = newSymbol.toUpperCase();
      this.widget.setSymbol(symbol, "1D", () => {
        console.log("Symbol updated to", symbol);
      });
    }
  }

  /**
   * Handles resolution change event.
   * Saves the new resolution using helper.
   * @param interval The new resolution interval.
   */
  private handleResolutionChange(interval: string): void {
    ResolutionHelper.saveResolution(interval);
  }

  public initChart(): void {
    ResolutionHelper.cleanInvalidResolutions();

    // Get default widget config based on URL parameters
    const config: WidgetConfig = WidgetConfigHelper.getDefaultConfig(this.params);

    // Create the TradingView widget instance
    this.widget = new (window as any).TradingView.widget(config);

    // When the chart is ready, subscribe to interval changes
    this.widget.onChartReady(() => {
      const chart = this.widget!.chart();
      chart.onIntervalChanged().subscribe(null, (interval: string) => {
        // eventBus.publish('resolutionChange', interval);
      });
    });
  }
}

export default new ChartManager();
