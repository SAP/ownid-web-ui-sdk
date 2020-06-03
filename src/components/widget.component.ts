import { BaseComponent } from './base.component';
import LinkButton from './common/link-button.component';
import Qr from './common/qr.component';
import ConfigurationService from '../services/configuration.service';
import { IContextRS } from '../interfaces/i-context.interfaces';
import RequestService from '../services/request.service';
import {
  IPartialConfig,
  IWidgetConfig,
  WidgetType,
} from '../interfaces/i-widget.interfeces';
import TranslationService from '../services/translation.service';

export default class WidgetComponent extends BaseComponent {
  widgetReady: Promise<void>;

  private statusTimeout: NodeJS.Timeout | null = null;

  private data: IContextRS | null = null;

  constructor(
    private config: IWidgetConfig,
    private requestService: RequestService,
  ) {
    super(config);
    this.widgetReady = this.getContext(
      config.URLPrefix || ConfigurationService.URLPrefix,
    );
  }

  private async getContext(contextUrl: string) {
    const contextData = { type: this.config.type || WidgetType.Register };
    this.data = await this.requestService.post(contextUrl, contextData);

    if (!this.data) {
      // eslint-disable-next-line no-console
      console.error('No context data received');
      return;
    }

    this.context = this.data.context;
    this.nonce = this.data.nonce;

    const prefix = (
      this.config.URLPrefix || ConfigurationService.URLPrefix
    ).replace(/\/+$/, '');

    const statusUrl = `${prefix}${ConfigurationService.statusUrl}`.replace(
      ':context',
      this.context,
    );

    this.setCallStatus(statusUrl);

    this.render();
  }

  private render() {
    const lang = this.config.language || ConfigurationService.defaultLanguage;
    if (this.isMobile()) {
      const mobileTitle =
        this.config.mobileTitle ||
        TranslationService.texts[lang][this.config.type].mobileTitle;
      this.addChild(
        new LinkButton({ href: this.data!.url, title: mobileTitle }),
      );
    } else {
      const desktopTitle =
        this.config.desktopTitle ||
        TranslationService.texts[lang][this.config.type].desktopTitle;
      const desktopSubtitle =
        this.config.desktopTitle ||
        TranslationService.texts[lang][this.config.type].desktopSubtitle;
      this.addChild(
        new Qr({
          href: this.data!.url,
          title: desktopTitle,
          subtitle: desktopSubtitle,
        }),
      );
    }
  }

  private setCallStatus(statusUrl: string) {
    this.statusTimeout = setTimeout(
      () => this.callStatus(statusUrl),
      this.config.statusInterval || ConfigurationService.statusTimeout,
    );
  }

  private async callStatus(statusUrl: string) {
    const response = await this.requestService.post(statusUrl, {
      nonce: this.nonce,
    });
    if (response.status) {
      clearTimeout(this.statusTimeout as NodeJS.Timeout);

      return this.config.type === WidgetType.Login
        ? this.config.onLogin && this.config.onLogin(response)
        : this.config.onRegister && this.config.onRegister(response);
    }

    return this.setCallStatus(statusUrl);
  }

  public destroy() {
    clearTimeout(this.statusTimeout as NodeJS.Timeout);
    this.elements.forEach(element => element.destroy());
  }

  public update(config: IPartialConfig) {
    this.elements.forEach(element => element.destroy());
    this.config = { ...this.config, ...config };
    this.render();
  }
}
