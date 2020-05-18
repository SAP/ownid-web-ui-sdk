import {BaseComponent} from "./base.component";
import LinkButton from "./common/link-button.component";
import Qr from "./common/qr.component";
import ConfigurationService from "../services/configuration.service";
import {IContextRS} from "../interfaces/i-context.interfaces";
import RequestService from "../services/request.service";
import {IWidgetConfig, WidgetType} from "../interfaces/i-widget.interfeces";

export default class WidgetComponent extends BaseComponent {
  widgetReady: Promise<void>;

  private statusTimeout: NodeJS.Timeout | null = null;

  constructor(private config: IWidgetConfig, private requestService: RequestService) {
    super(config);
    this.widgetReady = this.getContext(config.getContextURL || ConfigurationService.contextUrl);
  }

  private async getContext(contextUrl: string) {
    const contextData = {type: this.config.type || WidgetType.Register};
    const data: IContextRS | null = await this.requestService.post(contextUrl, contextData);

    if (!data) {
      // eslint-disable-next-line no-console
      console.error('No context data received');
      return;
    }

    this.context = data.context;
    this.nonce = data.nonce;

    const statusUrl = (this.config.getStatusURL || ConfigurationService.statusUrl).replace(':context', this.context);

    this.setCallStatus(statusUrl);

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

  private setCallStatus(statusUrl: string) {
    this.statusTimeout = setTimeout(() => this.callStatus(statusUrl), this.config.statusInterval || ConfigurationService.statusTimeout);
  }

  private async callStatus(statusUrl: string) {
    const response = await this.requestService.post(statusUrl, {nonce: this.nonce});
    if (response.status) {
      clearTimeout(this.statusTimeout as NodeJS.Timeout);

      return this.config.type === WidgetType.Login
        ? this.config.onLogin && this.config.onLogin(response)
        : this.config.onRegister && this.config.onRegister(response);
    }

    return this.setCallStatus(statusUrl);
  }

}
