import { BaseComponent } from './base.component';
import LinkButton from './common/link-button.component';
import Qr from './common/qr.component';
import ConfigurationService from '../services/configuration.service';
import { IContextRS } from '../interfaces/i-context.interfaces';
import RequestService from '../services/request.service';
import { IPartialConfig, IWidgetConfig, WidgetType, } from '../interfaces/i-widget.interfaces';
import TranslationService from '../services/translation.service';
import StatusResponse, { ContextStatus } from './status-response';

export default class WidgetComponent extends BaseComponent {
  widgetReady: Promise<void>;

  private statusTimeout: number | undefined;

  private refreshLinkTimeout: number | undefined;

  private qr: Qr | undefined;

  private link: LinkButton | undefined;

  private cacheExpiration: number | undefined;

  private contexts: IContextRS[] = [];

  constructor(
    protected config: IWidgetConfig,
    protected requestService: RequestService,
    protected disableDesktop: boolean = false,
    protected disableMobile: boolean = false,
  ) {
    super(config);

    this.widgetReady = this.init(config).then(() => {
      this.render();

      this.setRefreshLinkOrQR();

      if (!this.isMobile()) {
        this.setCallStatus();
      }
    }, (error: Error) => {
      // eslint-disable-next-line no-console
      console.error(error.message);
    });
  }

  protected init(config: IWidgetConfig): Promise<void> {
    return this.getContext(
      config.URLPrefix || ConfigurationService.URLPrefix,
      config.data,
    );
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  protected async getContext(contextUrl: string, data: any = null): Promise<void> {
    const contextData = {
      type: this.config.type || WidgetType.Register,
      data,
      qr: !this.isMobile(),
      partial: !!this.config.partial
    };
    const contextResponse = await this.requestService.post(contextUrl, contextData);

    if (!contextResponse) {
      throw new Error('No context data received');
    }

    this.cacheExpiration = contextResponse.expiration;
    this.contexts.push(contextResponse);
  }

  private render() {
    const lang = this.config.language || ConfigurationService.defaultLanguage;
    if (this.isMobile()) {
      if (this.disableMobile) {
        // eslint-disable-next-line no-console
        console.warn(
          `Mobile rendering is disabled for ${ this.config.type } widget type`,
        );
        return;
      }

      const mobileTitle =
        this.config.mobileTitle ||
        TranslationService.texts[lang][this.config.type].mobileTitle;
      this.link = new LinkButton({
        href: this.getStartUrl(),
        title: mobileTitle,
      });

      this.link.attachHandler('click', () => {
        this.setCallStatus();
        clearTimeout(this.refreshLinkTimeout);

        this.attachPostMessagesHandler();
      });

      this.addChild(this.link);
    } else {
      if (this.disableDesktop) {
        // eslint-disable-next-line no-console
        console.warn(
          `Desktop rendering is disabled for ${ this.config.type } widget type`,
        );
        return;
      }

      const desktopTitle =
        this.config.desktopTitle ||
        TranslationService.texts[lang][this.config.type].desktopTitle;
      const desktopSubtitle =
        this.config.desktopTitle ||
        TranslationService.texts[lang][this.config.type].desktopSubtitle;
      this.qr = new Qr({
        href: this.getStartUrl(),
        title: desktopTitle,
        subtitle: desktopSubtitle,
      })
      this.addChild(this.qr,);
    }
  }

  private getStartUrl() {
    return this.contexts[this.contexts.length - 1].url;
  }

  private getStatusUrl() {
    const prefix = (
      this.config.URLPrefix || ConfigurationService.URLPrefix
    ).replace(/\/+$/, '');

    return `${ prefix }${ ConfigurationService.statusUrl }`;
  }

  private getApproveUrl(context: string) {
    const prefix = (
      this.config.URLPrefix || ConfigurationService.URLPrefix
    ).replace(/\/+$/, '');

    return `${ prefix }${ ConfigurationService.approveUrl.replace(':context', context) }`;
  }

  private setCallStatus() {
    this.statusTimeout = window.setTimeout(
      () => this.callStatus(),
      this.config.statusInterval || ConfigurationService.statusTimeout,
    );
  }

  private async callStatus() {
    const request = this.contexts.map(({ context, nonce }) => ({ context, nonce }));
    const statusResponse = await this.requestService.post(this.getStatusUrl(), request) as Array<StatusResponse>;

    if (!statusResponse) {
      return this.setCallStatus();
    }

    // check if any context finished
    const statuses = statusResponse.map((x: StatusResponse) => x.status);
    const finishedIndex = statuses.indexOf(ContextStatus.Finished);
    if (finishedIndex >= 0) {
      this.qr?.showDone();

      const response = statusResponse[finishedIndex].payload.data;

      switch (this.config.type) {
        case WidgetType.Link:
          return this.config.onLink && this.config.onLink(response);
        case WidgetType.Login:
          return this.config.onLogin && this.config.onLogin(response);
        case WidgetType.Recover:
          return this.config.onRecover && this.config.onRecover(response);
        case WidgetType.Register:
        default:
          return this.config.onRegister && this.config.onRegister(response);
      }
    }

    // stop link regeneration if any context in progress status
    const processingIndex = statuses.indexOf(ContextStatus.Started);
    if (processingIndex >= 0) {
      window.clearTimeout(this.refreshLinkTimeout);
      if (this.qr) {
        const cancelCb = () => this.reCreateWidget();
        this.qr.showPending(cancelCb);
      }
    }

    // stop link regeneration if any context in waitingApproval status
    const waitingApprovalIndex = statuses.indexOf(ContextStatus.WaitingForApproval);
    if (waitingApprovalIndex >= 0) {
      clearTimeout(this.refreshLinkTimeout);

      const contextRS = this.contexts[waitingApprovalIndex];
      const { pin } = statusResponse[waitingApprovalIndex].payload.data;

      if (this.qr) {
        const yesCb = () => {
          this.sendApprove(true, contextRS);
          this.qr?.showPending(() => this.reCreateWidget());
        }

        const noCb = () => {
          this.sendApprove(false, contextRS);
          this.qr?.showPending();
          this.reCreateWidget();
        }

        this.qr.showSecurityCheck(pin, yesCb, noCb);
      }
    }

    // remove expired items from contexts array
    for (let i = this.contexts.length; i--;) {
      const item = this.contexts[i];
      if (statusResponse.findIndex((x: StatusResponse) => x.context === item.context) < 0) {
        this.contexts.splice(i, 1);
      }
    }

    return this.setCallStatus();
  }

  private sendApprove(approved: boolean, { context, nonce }: IContextRS) {
    this.requestService.post(this.getApproveUrl(context), { context, nonce, approved });
  }

  private setRefreshLinkOrQR() {
    if (!this.cacheExpiration) {
      return;
    }

    this.refreshLinkTimeout = window.setTimeout(
      () => this.refreshLinkOrQR(),
      this.cacheExpiration / 2,
    )
  }

  private refreshLinkOrQR() {
    this.init(this.config).then(() => {
      if (this.qr) {
        this.qr.update(this.getStartUrl());
      } else if (this.link) {
        this.link.update(this.getStartUrl());
      }

      this.setRefreshLinkOrQR();
    }, (error: Error) => {
      // eslint-disable-next-line no-console
      console.error(error.message);
    });
  }

  public destroy(): void {
    clearTimeout(this.statusTimeout);
    clearTimeout(this.refreshLinkTimeout);
    this.elements.forEach(element => element.destroy());
  }

  public update(config: IPartialConfig): void {
    this.elements.forEach(element => element.destroy());
    this.config = { ...this.config, ...config };
    this.render();
  }

  private attachPostMessagesHandler() {
    window.addEventListener('message', (message: MessageEvent) => {

      if (message.data === 'ownid postMessages enabled') {
        clearTimeout(this.statusTimeout);
      }

      if (message.data === 'ownid success') {
        this.callStatus();
      }
    }, false);
  }

  private reCreateWidget() {
    this.contexts = [];
    this.widgetReady = this.init(this.config).then(() => {
      this.destroy();
      this.render();

      this.setRefreshLinkOrQR();

      if (!this.isMobile()) {
        this.setCallStatus();
      }
    });
  }
}
