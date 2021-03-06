import { IUserHandler } from '../interfaces/i-user-handler.interfaces';
import { BaseComponent } from './base.component';
import LinkButton from './common/link-button.component';
import Qr from './common/qr.component';
import ConfigurationService from '../services/configuration.service';
import { IContext, IContextConfig, IContextRS } from '../interfaces/i-context.interfaces';
import RequestService from '../services/request.service';
import {
  IFullWidgetConfig,
  IPartialConfig,
  IWidgetConfig,
  IWidgetPayload,
  Languages,
  WidgetType,
} from '../interfaces/i-widget.interfaces';
import TranslationService from '../services/translation.service';
import StatusResponse, { ContextStatus } from './status-response';
import LinkedWidget from './common/linked.component';
import { find, findIndex } from '../services/helper.service';
import InlineWidget, { InlineWidgetOptions } from './common/inline.component';
import UserHandler from './user-handler';
import { MagicLinkHandler } from './magic-link-handler';
import LinkButtonWidget from './common/link-button-widget.component';

export default class WidgetComponent extends BaseComponent {
  widgetReady: Promise<void>;

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  finalResponse: any | null = null;

  metadata: string | null = null;

  returnError: string | null = null;

  disabled = true;

  succeededContext: IContext | undefined;

  private statusTimeout: number | undefined;

  private refreshLinkTimeout: number | undefined;

  private qr: Qr | undefined;

  private link: LinkButton | undefined;

  private linked: LinkedWidget | undefined;

  private cacheExpiration: number | undefined;

  private contexts: IContextRS[] = [];

  private postMessagesHandlerAttached = false;

  private isDestroyed = false;

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private webappResolver: (value?: any) => void = () => {};

  private toggleElements: NodeListOf<Element> | undefined;

  private note: HTMLDivElement | null = null;

  private inline: InlineWidget | undefined;

  private globalEventCallbacks: ((event: MouseEvent) => void)[] = [];

  protected userHandler: IUserHandler;

  private inlineWidgetInterval: number | undefined;

  private linkButtonInterval: number | undefined;

  private linkButton: LinkButtonWidget | undefined;

  private tooltipPlaceholder: HTMLDivElement | undefined;

  constructor(
    public config: IFullWidgetConfig,
    protected requestService: RequestService,
    protected magicLinkHandler?: MagicLinkHandler,
    protected disableDesktop: boolean = false,
    protected disableMobile: boolean = false,
  ) {
    super(config);

    this.userHandler = config.userHandler || new UserHandler();

    this.widgetReady = this.init(config).then(
      () => {
        if (this.getConfig()?.magicLink && this.magicLinkHandler) {
          //  eslint-disable-next-line promise/no-nesting
          this.magicLinkHandler
            .tryExchangeMagicToken()
            .then((res) => {
              if (!res) return;

              this.destroy();
            })
            .catch(() => {});
        }

        this.render();

        this.setRefreshLinkOrQR();

        if (!this.isMobile()) {
          this.setCallStatus();
        }

        if (config.toggleElement) {
          this.addInfoIcon(config.toggleElement);
        }

        if (config.toggleElement || config.inline || this.linkButton || this.linked) {
          document.addEventListener('click', (event) =>
            // eslint-disable-next-line promise/no-callback-in-promise
            this.globalEventCallbacks.forEach((callback) => callback(event)),
          );
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
    const language =
      this.config.language && this.config.language in Languages
        ? this.config.language
        : ConfigurationService.defaultLanguage;

    const contextData = {
      type: this.config.type || WidgetType.Register,
      data,
      qr: !this.isMobile(),
      partial: !!this.config.partial || !!this.config.inline,
      language,
    };
    const contextResponse = await this.requestService.post(contextUrl, contextData);

    if (!contextResponse) {
      throw new Error('No context data received');
    }

    this.cacheExpiration = contextResponse.expiration;
    this.contexts.push(contextResponse);
  }

  private render(): void {
    this.isDestroyed = false;
    const styles = document.getElementById('OwnID-common-styles');

    if (!styles) {
      this.addOwnIDStyleTag('OwnID-common-styles');
    }

    if (this.config.type === WidgetType.Link && find(this.contexts, ({ context }) => !context)) {
      this.linked = new LinkedWidget({ language: this.config.language });
      this.addChild(this.linked);

      this.addCallback2GlobalEvent((event) => {
        const el = event.target as HTMLElement;
        if (!el || !el.classList.contains('ownid-info-tooltip')) {
          this.linked?.toggleInfoTooltip(false);
        }
      });
      return;
    }

    if (this.config.type === WidgetType.Link && find(this.contexts, ({ context }) => !!context)) {
      this.linkButton = new LinkButtonWidget({ language: this.config.language });
      this.insertAfter(this.linkButton);

      this.tooltipPlaceholder = document.createElement('div');

      this.config.element.parentNode!.insertBefore(this.tooltipPlaceholder, this.config.element.nextSibling);

      window.document.body.appendChild(this.config.element);

      if (!this.isMobile()) {
        this.toggleQrTooltip(false);
      }

      this.linkButton.attachHandler('click', () => {
        if (this.finalResponse) {
          this.callOnSuccess(this.finalResponse, this.metadata);
          return;
        }

        if (this.isMobile()) {
          this.openWebapp();
        } else {
          this.toggleQrTooltip(true);
        }
      });

      this.addCallback2GlobalEvent((event) => {
        const el = event.target as HTMLElement;
        if (!el || !el.classList.contains('ownid-info-tooltip')) {
          this.linkButton?.toggleInfoTooltip(false);
        }
      });

      this.linkButtonInterval = window.setInterval(() => this.recalculatePosition(), 10);
    }

    if (this.config.inline) {
      this.renderInlineWidget({ language: this.config.language, ...this.config.inline });
    }

    if (
      (this.config.inline || this.config.toggleElement) &&
      [WidgetType.Register, WidgetType.Login, WidgetType.Recover].indexOf(this.config.type) !== -1 &&
      (this.config.note || this.config.note === undefined)
    ) {
      this.renderNote(this.config.language);
    }

    if (this.isMobile()) {
      if (this.disableMobile) {
        // eslint-disable-next-line no-console
        console.warn(`Mobile rendering is disabled for ${this.config.type} widget type`);
        return;
      }

      const type = this.config.partial ? `${this.config.type}-partial` : this.config.type;
      const mobileTitle =
        this.config.mobileTitle || TranslationService.instant(this.config.language, `${type}.mobileTitle`);
      this.link = new LinkButton({
        href: this.getStartUrl(),
        title: mobileTitle,
      });

      this.link.attachHandler('click', () => {
        if (this.finalResponse) {
          this.callOnSuccess(this.finalResponse, this.metadata);
        }

        this.setCallStatus();
        clearTimeout(this.refreshLinkTimeout);

        this.attachPostMessagesHandler();
      });

      this.addChild(this.link);
      this.returnError = TranslationService.instant(this.config.language, 'errors.link');
    } else {
      if (this.disableDesktop) {
        // eslint-disable-next-line no-console
        console.warn(`Desktop rendering is disabled for ${this.config.type} widget type`);
        return;
      }
      const type = this.config.partial || this.config.inline ? `${this.config.type}-partial` : this.config.type;
      const isTooltip: boolean =
        !!this.config.inline ||
        (this.config.type === WidgetType.Link && !!this.config.tooltip) ||
        (!!this.config.partial &&
          // @ts-ignore
          [null, false].indexOf(this.config.tooltip) < 0 &&
          !!this.config.toggleElement);
      const config = {} as {
        magicLink: { sendLinkCallback: (email: string) => Promise<unknown | null> };
      };
      const widgetConfig = this.getConfig();
      if (widgetConfig?.magicLink && this.config.type === WidgetType.Login && this.magicLinkHandler) {
        config.magicLink = {
          sendLinkCallback: (email: string) => this.magicLinkHandler!.sendMagicLink(email, this.config.language),
        };
      }

      this.qr = new Qr({
        href: this.getStartUrl(),
        title: this.config.desktopTitle || TranslationService.instant(this.config.language, `${type}.desktopTitle`),
        subtitle:
          this.config.desktopSubtitle || TranslationService.instant(this.config.language, `${type}.desktopSubtitle`),
        type,
        language: this.config.language,
        tooltip: isTooltip,
        config,
      });

      if (isTooltip) {
        this.addCallback2GlobalEvent((event) => {
          if (
            this.config.element.style.display === 'block' &&
            !this.qr!.ref.contains(event.target as Node) &&
            !this.inline?.ref.contains(event.target as Node) &&
            !this.linkButton?.ref.contains(event.target as Node) &&
            !this.qr?.securityCheckShown
          ) {
            this.toggleQrTooltip(false);
          }
        });
      }

      this.addChild(this.qr);

      this.returnError = TranslationService.instant(this.config.language, 'errors.qr');
    }
  }

  private getStartUrl(): string {
    return this.contexts[this.contexts.length - 1].url;
  }

  private getConfig(): IContextConfig {
    return this.contexts[this.contexts.length - 1].config;
  }

  private getUrlPrefix(): string {
    return (this.config.URLPrefix || ConfigurationService.URLPrefix).replace(/\/+$/, '');
  }

  private getStatusUrl(): string {
    return `${this.getUrlPrefix()}${ConfigurationService.statusUrl}`;
  }

  private getApproveUrl(context: string): string {
    return `${this.getUrlPrefix()}${ConfigurationService.approveUrl.replace(':context', context)}`;
  }

  private setCallStatus(): void {
    this.statusTimeout = window.setTimeout(
      () => this.callStatus(),
      this.config.statusInterval || ConfigurationService.statusTimeout,
    );
  }

  private async callStatus(): Promise<void> {
    if (this.isDestroyed || this.contexts.length <= 0) {
      return;
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
      if (statusResponse[finishedIndex].payload.error) {
        this.callOnError(statusResponse[finishedIndex].payload.error);
        this.reCreateWidget();
        return;
      }

      if (this.config.partial && this.config.type === WidgetType.Register && this.qr) {
        this.qr.showDone();
      }

      const { context } = statusResponse[finishedIndex];
      const { nonce } = this.contexts.find((item) => item.context === context)!;

      this.succeededContext = { context, nonce };
      this.contexts = [];
      this.link?.disableButton();

      this.finalResponse = statusResponse[finishedIndex].payload.data;
      this.metadata = statusResponse[finishedIndex].metadata;
      this.callOnSuccess(this.finalResponse, this.metadata);
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
      if (findIndex(statusResponse, (x: StatusResponse) => x.context === item.context) < 0) {
        this.contexts.splice(i, 1);
      }
    }

    return this.setCallStatus();
  }

  private sendApprove(approved: boolean, { context, nonce }: IContextRS): void {
    this.requestService.post(this.getApproveUrl(context), {
      context,
      nonce,
      approved,
    });
  }

  private setRefreshLinkOrQR(): void {
    if (!this.cacheExpiration) {
      return;
    }

    this.refreshLinkTimeout = window.setTimeout(() => this.refreshLinkOrQR(), this.cacheExpiration / 2);
  }

  private refreshLinkOrQR(): void {
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
    this.globalEventCallbacks = [];
    window.removeEventListener('message', this.onMessage);
    clearTimeout(this.statusTimeout);
    clearTimeout(this.refreshLinkTimeout);
    clearInterval(this.inlineWidgetInterval);
    clearInterval(this.linkButtonInterval);
    this.elements.forEach((element) => element.destroy());
  }

  public update(config: IPartialConfig): void {
    this.elements.forEach((element) => element.destroy());
    this.config = { ...this.config, ...config };
    this.render();
  }

  private onMessage = (message: MessageEvent) => {
    // should be a bound property as it will be passed as callback
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
      this.tooltipPlaceholder?.parentNode!.insertBefore(this.config.element, this.tooltipPlaceholder?.nextSibling);

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

    const label = document.createElement('label');
    label.setAttribute('for', checkInput.id);
    label.setAttribute('class', 'ownid-label ownid-toggle');
    label.textContent = TranslationService.instant(this.config.language, 'common.labelText');

    checkInput.parentNode!.insertBefore(label, checkInput.nextSibling);

    const infoIcon = document.createElement('span');
    infoIcon.setAttribute('style', 'margin:8px 0 0 8px;cursor:pointer;position:relative');
    infoIcon.setAttribute('ownid-info-button', '');

    infoIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#354a5f"><path d="M.333 7A6.67 6.67 0 0 1 7 .333 6.67 6.67 0 0 1 13.667 7 6.67 6.67 0 0 1 7 13.667 6.67 6.67 0 0 1 .333 7zM7 1.667C4.054 1.667 1.667 4.055 1.667 7S4.054 12.334 7 12.334 12.333 9.946 12.333 7 9.945 1.667 7 1.667zm0 3.667a1 1 0 1 0 0-2 1 1 0 1 0 0 2zm0 1.333c.368 0 .667.298.667.667V10c0 .368-.298.667-.667.667s-.667-.298-.667-.667V7.334c0-.368.298-.667.667-.667z"/></svg>' +
      '<div ownid-about-tooltip style="display: none;position: absolute;width: 220px;background: #FFFFFF;border: 1px solid #D5DADD;box-sizing: border-box;border-radius: 6px;font-size: 12px;line-height: 16px;padding: 16px 12px;bottom: 23px;left: -100px;cursor: default;">' +
      'Access your account without a password. Your phone is your ID. Learn more at <a style="color:#0070F2;font-weight:bold;text-decoration:none" href="https://ownid.com">OwnID.com</a></div>';

    const aboutTooltip = infoIcon.querySelector('[ownid-about-tooltip]') as HTMLElement;

    this.addCallback2GlobalEvent((event) => {
      if (aboutTooltip.style.display === 'block' && !infoIcon.contains(event.target as Node)) {
        aboutTooltip.style.display = 'none';
      }
    });

    infoIcon.querySelector('svg')!.addEventListener('click', () => {
      aboutTooltip.style.display = aboutTooltip.style.display === 'block' ? 'none' : 'block';
    });

    label.parentNode!.insertBefore(infoIcon, label.nextSibling);

    this.toggleElements = document.querySelectorAll(checkInput.getAttribute('ownid-toggle-rel') as string);

    checkInput.addEventListener('change', ({ target }) => {
      if ((target as HTMLInputElement).checked) {
        if (this.finalResponse || this.isMobile()) {
          this.toggleElements?.forEach((toggleElement) => toggleElement.classList.add('ownid-disabled'));
          if (this.note) {
            this.note.style.display = 'block';
          }
        } else {
          this.toggleQrTooltip(true);

          // eslint-disable-next-line no-param-reassign
          (target as HTMLInputElement).checked = false;
        }
      } else {
        this.toggleQrTooltip(false);

        if (this.note) {
          this.note.style.display = 'none';
        }
        this.toggleElements!.forEach((toggleElement) => toggleElement.classList.remove('ownid-disabled'));
      }

      this.disabled = !(target as HTMLInputElement).checked;
    });

    this.toggleQrTooltip(false);
  }

  private toggleQrTooltip(show: boolean): void {
    if (!show) {
      this.config.element.style.display = 'none';
      return;
    }

    this.config.element.style.display = 'block';

    let tooltipRefEl: HTMLElement = (this.inline?.ref ||
      this.config.toggleElement ||
      this.linkButton?.ref) as HTMLElement;
    let [offsetX, offsetY] = [0, 0];
    let tooltipPosition = this.inline || this.linkButton ? 'left' : 'right';

    if (this.config.tooltip && typeof this.config.tooltip === 'object') {
      if (this.config.tooltip.targetEl) {
        tooltipRefEl = document.querySelector(this.config.tooltip.targetEl) as HTMLElement;
      }
      if (this.config.tooltip.offset) {
        [offsetX, offsetY] = this.config.tooltip.offset;
      }

      if (this.config.tooltip.position) {
        tooltipPosition = this.config.tooltip.position;
      }
    }

    this.qr!.ref.classList.add(`ownid-tooltip-wrapper-${tooltipPosition}`);

    const { left, top, right, height } = tooltipRefEl.getBoundingClientRect();

    this.qr!.ref.style.top = `${top + (offsetY || height / 2) + window.pageYOffset}px`;

    if (tooltipPosition === 'right') {
      this.qr!.ref.style.left = `${right + offsetX + window.pageXOffset + 10}px`; // 10px is arrow width
    } else {
      this.qr!.ref.style.right = `${window.innerWidth - left + offsetX + window.pageXOffset + 10}px`; // 10px is arrow width
    }

    const elementBoundingClientRect = this.qr!.ref.getBoundingClientRect();

    const qrTop = elementBoundingClientRect.top + elementBoundingClientRect.height / 2 - (offsetY || height / 2);

    if (qrTop !== top) {
      const offsetYY = top - qrTop;
      this.qr!.ref.style.top = `${top + offsetYY + (offsetY || height / 2) + window.pageYOffset}px`;
    }

    if (tooltipPosition === 'right') {
      if (elementBoundingClientRect.left + 10 !== right) {
        const offsetXX = right - elementBoundingClientRect.left + 10;
        this.qr!.ref.style.left = `${right + offsetXX + offsetX + window.pageXOffset + 10}px`; // 10px is arrow width
      }
    } else if (elementBoundingClientRect.right !== left - 10) {
      const offsetXX = elementBoundingClientRect.right - left + 10;
      this.qr!.ref.style.right = `${window.innerWidth - left + offsetXX + window.pageXOffset + 10}px`; // 10px is arrow width
    }
  }

  private setFinishStatus(isFinished: boolean) {
    this.inline?.setFinishStatus(isFinished);

    this.toggleElements?.forEach((toggleElement) => toggleElement.classList.add('ownid-disabled'));

    if (this.config.toggleElement) {
      this.config.toggleElement.checked = isFinished;
    }

    if (this.note) {
      this.note.style.display = isFinished ? 'block' : 'none';
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private callOnSuccess(finalResponse: any, metadata: string | null): void {
    const isTooltip =
      !!this.config.inline ||
      (this.config.type === WidgetType.Link && !!this.config.tooltip) ||
      (this.config.partial &&
        // @ts-ignore
        [null, false].indexOf(this.config.tooltip) < 0 &&
        this.config.toggleElement);

    if (isTooltip) {
      this.toggleQrTooltip(false);
      this.setFinishStatus(true);
    }

    if (this.config.type === WidgetType.Link) {
      this.reCreateWidget();
      this.config.element.removeAttribute('style');
    }

    this.disabled = false;

    switch (this.config.type) {
      case WidgetType.Link:
        return this.config.onLink && this.config.onLink(finalResponse, metadata);
      case WidgetType.Login:
        if (this.config.inline && finalResponse.pubKey) {
          if (!this.config.inline.userIdElement?.value) {
            this.inline!.noAccount();
          } else {
            this.userHandler.isUserExists(this.config.inline.userIdElement?.value).then((exists) => {
              if (exists) {
                this.inline!.requirePassword();
              } else {
                this.inline!.noAccount();
                if (isTooltip) {
                  this.setFinishStatus(false);
                }
              }
            });
          }
        }

        return this.config.onLogin && this.config.onLogin(finalResponse, metadata);
      case WidgetType.Recover:
        return this.config.onRecover && this.config.onRecover(finalResponse, metadata);
      case WidgetType.Register:
      default:
        return this.config.onRegister && this.config.onRegister(finalResponse, metadata);
    }
  }

  public async openWebapp(): Promise<IWidgetPayload> {
    window.open(this.getStartUrl());

    this.setCallStatus();
    clearTimeout(this.refreshLinkTimeout);

    this.attachPostMessagesHandler();

    return new Promise((resolve) => {
      this.webappResolver = resolve;
    });
  }

  private addOwnIDStyleTag(id: string): void {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `.ownid-disabled{opacity:0;pointer-events:none;display:none}
`;

    document.head.appendChild(style);
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private apiReply(response: any): void {
    this.webappResolver({
      error: null,
      data: response,
    });
  }

  private callOnError(error: string): void {
    const isTooltip =
      !!this.config.inline ||
      (this.config.type === WidgetType.Link && !!this.config.tooltip) ||
      (this.config.partial &&
        // @ts-ignore
        [null, false].indexOf(this.config.tooltip) < 0 &&
        this.config.toggleElement);

    if (isTooltip) {
      this.toggleQrTooltip(false);
    }

    if (this.config.onError) {
      this.config.onError(error);
    }
  }

  private renderInlineWidget(options: InlineWidgetOptions): void {
    this.inline = new InlineWidget(options);

    if (!this.isMobile()) {
      this.toggleQrTooltip(false);
    }

    this.config.element.parentNode!.insertBefore(this.inline.ref, this.config.element.nextSibling);

    this.inline.calculatePosition(this.inline.ref, options);

    this.elements.push(this.inline);

    this.addCallback2GlobalEvent((event) => {
      const el = event.target as HTMLElement;
      if (!el || !el.classList.contains('ownid-info-tooltip')) {
        this.inline?.toggleInfoTooltip(false);
      }
    });

    this.inline.attachHandler('click', () => {
      if (this.finalResponse) {
        this.callOnSuccess(this.finalResponse, this.metadata);
        return;
      }

      if (this.isMobile()) {
        if (this.config.type === WidgetType.Login) {
          this.openWebapp();
          return;
        }

        this.disabled = false;
        this.inline!.setFinishStatus(true);
        if (this.note) {
          this.note.style.display = 'block';
        }
      } else {
        return this.toggleQrTooltip(true);
      }
    });

    this.inlineWidgetInterval = window.setInterval(() => this.recalculatePosition(), 10);
  }

  private addCallback2GlobalEvent(param: (event: MouseEvent) => void): void {
    this.globalEventCallbacks.push(param);
  }

  private renderNote(lang?: Languages): void {
    this.note = document.createElement('div');
    this.note.setAttribute('class', 'ownid-note');
    this.note.style.display = 'none';
    this.note.textContent = TranslationService.instant(lang, 'common.noteText');

    if (typeof this.config.note === 'string') {
      this.note.textContent = this.config.note;
    }

    let prevElement = this.config.toggleElement
      ? this.config.toggleElement.parentNode!
      : this.config.inline!.targetElement;
    let append = false;

    if (typeof this.config.note === 'object') {
      this.note.textContent = this.config.note!.text;

      if (this.config.note!.wrapperElement) {
        prevElement = this.config.note!.wrapperElement;
        append = true;
      }
    }

    if (!this.config.toggleElement && this.config.type === WidgetType.Register) {
      this.note.textContent += ' ';
      const undo = document.createElement('span');
      undo.setAttribute('class', 'ownid-note-undo');
      undo.textContent = TranslationService.instant(lang, 'common.undo');

      undo.addEventListener('click', () => {
        this.note!.style.display = 'none';
        this.disabled = true;
        this.inline?.setFinishStatus(false);
      });

      this.note.appendChild(undo);
    }

    if (append) {
      prevElement.appendChild(this.note);
    } else {
      prevElement.parentNode!.insertBefore(this.note, prevElement.nextSibling);
    }
  }

  public recalculatePosition(): void {
    if (this.inline) {
      this.inline.calculatePosition(this.inline.ref, { language: this.config.language, ...this.config.inline! });
    }

    if (this.config.element.style.display === 'block') {
      this.toggleQrTooltip(true);
    }
  }
}
