import WidgetComponent from "./components/widget.component";
import RequestService from "./services/request.service";
import {IWidgetConfig} from "./interfaces/i-widget.interfeces";

export default class OwnIDUiSdk {
  init(config: IWidgetConfig): WidgetComponent | null {
    if (!config.element) {
      // eslint-disable-next-line no-console
      console.error(`Parent element wasn't found on the page`);
      return null
    }

    return new WidgetComponent(config, new RequestService());
  }
}
