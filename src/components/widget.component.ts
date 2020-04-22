import {BaseComponent} from "./base.component";
import LinkButton from "./common/link-button.component";
import Qr from "./common/qr.component";
import ConfigurationService from "../services/configuration.service";
import {IContextRS} from "../interfaces/i-context.interfaces";
import RequestService from "../services/request.service";
import {IWidgetConfig} from "../interfaces/i-widget.interfeces";


export default class WidgetComponent extends BaseComponent{
  widgetReady: Promise<void>;

  constructor(config: IWidgetConfig, private requestService: RequestService) {
    super(config);
    this.widgetReady = this.getContext(config.getContextURL || ConfigurationService.contextUrl);
  }

  private async getContext(contextUrl: string) {
    const data: IContextRS | null = await this.requestService.post(contextUrl);

    if (!data) {
      console.error('No context data received');
      return;
    }

    this.context = data.context;
    this.challengeUrl = data.url;

    this.render();
  }

  private render(): void {
    const href = `${ConfigurationService.webApplicationUrl}/sign?q=${this.challengeUrl}`;

    if (this.isMobile()) {
      this.addChild(new LinkButton({href, textContent: 'Instant Sign In'}));
    } else {
      this.addChild(new Qr({href}));
    }
  }

  // logged in Handle & logic
}
