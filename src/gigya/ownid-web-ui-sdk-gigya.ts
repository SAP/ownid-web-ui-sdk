import { IWidgetConfig } from '../interfaces/i-widget.interfaces';
import RequestService from '../services/request.service';
import OwnIDUiSdk from '../ownid-web-ui-sdk';
import WidgetComponent from '../components/widget.component';
import GigyaWidgetComponent from './components/gigya-widget.component';

export default class OwnIDUiSdkGigya extends OwnIDUiSdk {
  render(config: IWidgetConfig): WidgetComponent | null {
    if (!config.element) {
      // eslint-disable-next-line no-console
      console.error(`Parent element wasn't found on the page`);
      return null;
    }

    const desktopDisable = false;
    const mobileDisable = !!config.inline || !!config.tooltip;

    return new GigyaWidgetComponent(
      { ...this.config, ...config },
      new RequestService(this.config.logger),
      this.magicLinkHandler,
      desktopDisable,
      mobileDisable,
    );
  }
}
