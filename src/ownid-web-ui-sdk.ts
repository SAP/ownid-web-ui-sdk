import WidgetComponent from "./components/widget.component";
import RequestService from "./services/request.service";
import { IInitConfig, IWidgetConfig } from "./interfaces/i-widget.interfeces";

export default class OwnIDUiSdk {
  config = {} as IInitConfig;

  init(config: IInitConfig = {}) {
    this.config = config;
  }

  render(config: IWidgetConfig): WidgetComponent | null {
    if (!config.element) {
      // eslint-disable-next-line no-console
      console.error(`Parent element wasn't found on the page`);
      return null
    }

    return new WidgetComponent({ ...this.config, ...config  }, new RequestService());
  }
}
