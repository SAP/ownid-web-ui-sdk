import { BaseComponent } from './base.component';
import LinkButton from './common/link-button.component';
import Qr from './common/qr.component';
import ConfigurationService from '../services/configuration.service';
import { IContextRS } from '../interfaces/i-context.interfaces';
import RequestService from '../services/request.service';
import { IPartialConfig, IWidgetConfig, WidgetType } from '../interfaces/i-widget.interfaces';
import TranslationService from '../services/translation.service';
import StatusResponse, { ContextStatus } from './status-response';

export default class WidgetComponent extends BaseComponent {
  widgetReady: Promise<void>;

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  finalResponse: any | null = null;

  returnError: string | null = null;

  private statusTimeout: number | undefined;

  private refreshLinkTimeout: number | undefined;

  private qr: Qr | undefined;

  private link: LinkButton | undefined;

  private cacheExpiration: number | undefined;

  private contexts: IContextRS[] = [];

  private postMessagesHandlerAttached = false;

  private isDestroyed = false;

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private webappResolver: (value?: any) => void = () => {};

  constructor(
    protected config: IWidgetConfig,
    protected requestService: RequestService,
    protected disableDesktop: boolean = false,
    protected disableMobile: boolean = false,
  ) {
    super(config);

    this.widgetReady = this.init(config).then(
      () => {
        this.render();

        this.setRefreshLinkOrQR();

        if (!this.isMobile()) {
          this.setCallStatus();
        }

        if (config.toggleElement) {
          this.addInfoIcon(config.toggleElement);
        }
      },
      (error: Error) => {
        // eslint-disable-next-line no-console
        console.error(error.message);
      },
    );
  }

  protected init(config: IWidgetConfig): Promise<void> {
    return this.getContext(config.URLPrefix || ConfigurationService.URLPrefix, config.data);
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  protected async getContext(contextUrl: string, data: any = null): Promise<void> {
    const contextData = {
      type: this.config.type || WidgetType.Register,
      data,
      qr: !this.isMobile(),
      partial: !!this.config.partial,
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
        console.warn(`Mobile rendering is disabled for ${this.config.type} widget type`);
        return;
      }

      const type = this.config.partial ? `${this.config.type}-partial` : this.config.type;
      const mobileTitle = this.config.mobileTitle || TranslationService.texts[lang][type].mobileTitle;
      this.link = new LinkButton({
        href: this.getStartUrl(),
        title: mobileTitle,
      });

      this.link.attachHandler('click', () => {
        if (this.finalResponse) {
          this.callOnSuccess(this.finalResponse);
        }

        this.setCallStatus();
        clearTimeout(this.refreshLinkTimeout);

        this.attachPostMessagesHandler();
      });

      this.addChild(this.link);
      this.returnError = TranslationService.texts[lang].errors.link;
    } else {
      if (this.disableDesktop) {
        // eslint-disable-next-line no-console
        console.warn(`Desktop rendering is disabled for ${this.config.type} widget type`);
        return;
      }
      const type = this.config.partial ? `${this.config.type}-partial` : this.config.type;

      this.qr = new Qr({
        href: this.getStartUrl(),
        title: this.config.desktopTitle || TranslationService.texts[lang][type].desktopTitle,
        subtitle: this.config.desktopSubtitle || TranslationService.texts[lang][type].desktopSubtitle,
        type,
        lang,
      });
      this.addChild(this.qr);

      this.returnError = TranslationService.texts[lang].errors.qr;
    }
  }

  private getStartUrl() {
    return this.contexts[this.contexts.length - 1].url;
  }

  private getStatusUrl() {
    const prefix = (this.config.URLPrefix || ConfigurationService.URLPrefix).replace(/\/+$/, '');

    return `${prefix}${ConfigurationService.statusUrl}`;
  }

  private getApproveUrl(context: string) {
    const prefix = (this.config.URLPrefix || ConfigurationService.URLPrefix).replace(/\/+$/, '');

    return `${prefix}${ConfigurationService.approveUrl.replace(':context', context)}`;
  }

  private setCallStatus() {
    this.statusTimeout = window.setTimeout(
      () => this.callStatus(),
      this.config.statusInterval || ConfigurationService.statusTimeout,
    );
  }

  private async callStatus() {
    if (this.isDestroyed || this.contexts.length <= 0) {
      return () => {};
    }

    const request = this.contexts.map(({ context, nonce }) => ({
      context,
      nonce,
    }));
    const statusResponse = (await this.requestService.post(this.getStatusUrl(), request)) as Array<StatusResponse>;

    if (!statusResponse) {
      return this.setCallStatus();
    }

    // check if any context finished
    const statuses = statusResponse.map((x: StatusResponse) => x.status);
    const finishedIndex = statuses.indexOf(ContextStatus.Finished);
    if (finishedIndex >= 0) {
      if (this.config.partial && this.config.type === WidgetType.Register && this.qr) {
        this.qr.showDone();
      }

      this.contexts = [];
      this.link?.disableButton();

      this.finalResponse = statusResponse[finishedIndex].payload.data;
      this.callOnSuccess(this.finalResponse);
      this.apiReply(this.finalResponse);
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
        };

        const noCb = () => {
          this.sendApprove(false, contextRS);
          this.qr?.showPending();
          this.reCreateWidget();
        };

        this.qr.showSecurityCheck(pin, yesCb, noCb);
      }
    }

    // remove expired items from contexts array
    for (let i = this.contexts.length; i--; ) {
      const item = this.contexts[i];
      if (statusResponse.findIndex((x: StatusResponse) => x.context === item.context) < 0) {
        this.contexts.splice(i, 1);
      }
    }

    return this.setCallStatus();
  }

  private sendApprove(approved: boolean, { context, nonce }: IContextRS) {
    this.requestService.post(this.getApproveUrl(context), {
      context,
      nonce,
      approved,
    });
  }

  private setRefreshLinkOrQR() {
    if (!this.cacheExpiration) {
      return;
    }

    this.refreshLinkTimeout = window.setTimeout(() => this.refreshLinkOrQR(), this.cacheExpiration / 2);
  }

  private refreshLinkOrQR() {
    this.init(this.config).then(
      () => {
        if (this.qr) {
          this.qr.update(this.getStartUrl());
        } else if (this.link) {
          this.link.update(this.getStartUrl());
        }

        this.setRefreshLinkOrQR();
      },
      (error: Error) => {
        // eslint-disable-next-line no-console
        console.error(error.message);
      },
    );
  }

  public destroy(): void {
    this.isDestroyed = true;
    window.removeEventListener('message', this.onMessage);
    clearTimeout(this.statusTimeout);
    clearTimeout(this.refreshLinkTimeout);
    this.elements.forEach((element) => element.destroy());
  }

  public update(config: IPartialConfig): void {
    this.elements.forEach((element) => element.destroy());
    this.config = { ...this.config, ...config };
    this.render();
  }

  private onMessage = (message: MessageEvent) => {
    if (message.data === 'ownid postMessages enabled') {
      clearTimeout(this.statusTimeout);
    }

    if (message.data === 'ownid success') {
      this.callStatus();
    }
  };

  private attachPostMessagesHandler(): void {
    if (this.postMessagesHandlerAttached) {
      return;
    }

    this.postMessagesHandlerAttached = true;

    window.addEventListener('message', this.onMessage, false);
  }

  private reCreateWidget(): void {
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

  private addInfoIcon(checkInput: HTMLElement): void {
    if (!checkInput.id) {
      // eslint-disable-next-line no-param-reassign
      checkInput.id = `ownid-toggle-check-${Math.random()}`;
    }

    const lang = this.config.language || ConfigurationService.defaultLanguage;
    const label = document.createElement('label');
    label.setAttribute('for', checkInput.id);
    label.setAttribute('class', 'ownid-label ownid-toggle');
    label.textContent = TranslationService.texts[lang].common.labelText;

    checkInput.parentNode!.insertBefore(label, checkInput.nextSibling);

    const infoIcon = document.createElement('span');
    infoIcon.setAttribute('style', 'margin-left:8px;cursor:pointer;position:relative');
    infoIcon.setAttribute('ownid-info-button', '');

    infoIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#354a5f"><path d="M.333 7A6.67 6.67 0 0 1 7 .333 6.67 6.67 0 0 1 13.667 7 6.67 6.67 0 0 1 7 13.667 6.67 6.67 0 0 1 .333 7zM7 1.667C4.054 1.667 1.667 4.055 1.667 7S4.054 12.334 7 12.334 12.333 9.946 12.333 7 9.945 1.667 7 1.667zm0 3.667a1 1 0 1 0 0-2 1 1 0 1 0 0 2zm0 1.333c.368 0 .667.298.667.667V10c0 .368-.298.667-.667.667s-.667-.298-.667-.667V7.334c0-.368.298-.667.667-.667z"/></svg>' +
      '<div ownid-about-tooltip style="display: none;position: absolute;width: 220px;background: #FFFFFF;border: 1px solid #D5DADD;box-sizing: border-box;border-radius: 6px;font-size: 12px;line-height: 16px;padding: 16px 12px;bottom: 23px;left: -100px;cursor: default;">' +
      '<strong style="color: #0070F2">OwnID</strong> is a tool that allows you to register and login to the websites and apps you use everyday.</div>';

    const aboutTooltip = infoIcon.querySelector('[ownid-about-tooltip]') as HTMLElement;

    document.addEventListener('click', (event) => {
      const clickedInside = infoIcon.contains(event.target as Node);
      if (!clickedInside) {
        aboutTooltip.style.display = 'none';
      }
    });

    infoIcon.querySelector('svg')!.addEventListener('click', () => {
      aboutTooltip.style.display = aboutTooltip.style.display === 'block' ? 'none' : 'block';
    });

    label.parentNode!.insertBefore(infoIcon, label.nextSibling);

    const toggleElements = document.querySelectorAll(checkInput.getAttribute('ownid-toggle-rel') as string);

    checkInput.addEventListener('change', ({ target }) => {
      if ((target as HTMLInputElement).checked) {
        this.config.element.style.display = 'block';

        toggleElements.forEach((toggleElement) => {
          const placeholder = document.createElement('ownid-toggle-placeholder');
          placeholder.style.display = 'none';

          toggleElement.parentNode!.insertBefore(placeholder, toggleElement);
          toggleElement.parentNode!.removeChild(toggleElement);
        });
      } else {
        this.config.element.style.display = 'none';

        document.querySelectorAll('ownid-toggle-placeholder').forEach((element, index) => {
          element.parentNode!.insertBefore(toggleElements[index], element);
          element.parentNode!.removeChild(element);
        });
      }
    });

    this.config.element.style.display = 'none';
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private callOnSuccess(finalResponse: any): void {
    switch (this.config.type) {
      case WidgetType.Link:
        return this.config.onLink && this.config.onLink(finalResponse);
      case WidgetType.Login:
        return this.config.onLogin && this.config.onLogin(finalResponse);
      case WidgetType.Recover:
        return this.config.onRecover && this.config.onRecover(finalResponse);
      case WidgetType.Register:
      default:
        return this.config.onRegister && this.config.onRegister(finalResponse);
    }
  }

  public async openWebapp(): Promise<unknown> {
    window.open(this.getStartUrl());

    this.setCallStatus();
    clearTimeout(this.refreshLinkTimeout);

    this.attachPostMessagesHandler();

    return new Promise((resolve) => {
      this.webappResolver = resolve;
    });
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private apiReply(response: any): void {
    this.webappResolver({
      error: null,
      data: response,
    });
  }
}
