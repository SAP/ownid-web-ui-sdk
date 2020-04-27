import {BaseComponent} from "./base.component";
import LinkButton from "./common/link-button.component";
import Qr from "./common/qr.component";
import ConfigurationService from "../services/configuration.service";
import {IContextRS} from "../interfaces/i-context.interfaces";
import RequestService from "../services/request.service";
import {IWidgetConfig} from "../interfaces/i-widget.interfeces";


export default class WidgetComponent extends BaseComponent{
  widgetReady: Promise<void>;

  constructor(private config: IWidgetConfig, private requestService: RequestService) {
    super(config);
    this.widgetReady = this.getContext(config.getContextURL || ConfigurationService.contextUrl);
  }

  private async getContext(contextUrl: string) {
    const data: IContextRS | null = await this.requestService.post(contextUrl);

    if (!data) {
      // eslint-disable-next-line no-console
      console.error('No context data received');
      return;
    }

    this.context = data.context;

    this.render(data.url);
  }

  private render(href: string): void {
    if (this.isMobile()) {
      const mobileTitle = this.config.mobileTitle || ConfigurationService.defaultTexts[this.config.type].mobileTitle;
      this.addChild(new LinkButton({href, title: mobileTitle}));
    } else {
      const desktopTitle = this.config.desktopTitle || ConfigurationService.defaultTexts[this.config.type].desktopTitle;
      const desktopSubtitle = this.config.desktopTitle || ConfigurationService.defaultTexts[this.config.type].desktopSubtitle;
      this.addChild(new Qr({href, title: desktopTitle, subtitle: desktopSubtitle}));
    }
  }

  // logged in Handle & logic
}
