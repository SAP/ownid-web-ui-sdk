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
} from '../interfaces/i-widget.interfaces';
import TranslationService from '../services/translation.service';

export default class WidgetComponent extends BaseComponent {
  widgetReady: Promise<void>;

  private statusTimeout: NodeJS.Timeout | null = null;

  private data: IContextRS | null = null;

  constructor(
    protected config: IWidgetConfig,
    protected requestService: RequestService,
    protected disableDesktop: boolean = false,
    protected disableMobile: boolean = false,
  ) {
    super(config);

    this.widgetReady = this.init(config);
  }

  protected init(config: IWidgetConfig): Promise<void>
  {
    return this.getContext(
      config.URLPrefix || ConfigurationService.URLPrefix,
      config.data,
    );
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  protected async getContext(contextUrl: string, data: any = null) {
    const contextData = { type: this.config.type || WidgetType.Register, data };
    this.data = await this.requestService.post(contextUrl, contextData);

    if (!this.data) {
      // eslint-disable-next-line no-console
      console.error('No context data received');
      return;
    }

    this.context = this.data.context;
    this.nonce = this.data.nonce;

    if (!this.isMobile()) {
      this.setCallStatus(this.getStatusUrl());
    }

    this.render();
  }

  private render() {
    const lang = this.config.language || ConfigurationService.defaultLanguage;
    if (this.isMobile()) {
      if (this.disableMobile) {
        console.warn(
          `Mobile rendering is disabled for ${this.config.type} widget type`,
        );
        return;
      }

      const mobileTitle =
        this.config.mobileTitle ||
        TranslationService.texts[lang][this.config.type].mobileTitle;
      const linkButton = new LinkButton({
        href: this.data!.url,
        title: mobileTitle,
      });

      linkButton.attachHandler('click', () => {
        this.setCallStatus(this.getStatusUrl());
      });

      this.addChild(linkButton);
    } else {
      if (this.disableDesktop) {
        console.warn(
          `Desktop rendering is disabled for ${this.config.type} widget type`,
        );
        return;
      }

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

  private getStatusUrl() {
    const prefix = (
      this.config.URLPrefix || ConfigurationService.URLPrefix
    ).replace(/\/+$/, '');

    const statusUrl = `${prefix}${ConfigurationService.statusUrl}`.replace(
      ':context',
      this.context as string,
    );

    return statusUrl;
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

      switch (this.config.type) {
        case WidgetType.Link:
          return this.config.onLink && this.config.onLink(response);
        case WidgetType.Login:
          return this.config.onLogin && this.config.onLogin(response);
        case WidgetType.Register:
        default:
          return this.config.onRegister && this.config.onRegister(response);
      }
    }

    return this.setCallStatus(statusUrl);
  }

  public destroy(): void {
    clearTimeout(this.statusTimeout as NodeJS.Timeout);
    this.elements.forEach(element => element.destroy());
  }

  public update(config: IPartialConfig): void {
    this.elements.forEach(element => element.destroy());
    this.config = { ...this.config, ...config };
    this.render();
  }
}
