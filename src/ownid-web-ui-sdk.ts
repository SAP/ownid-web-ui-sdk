import WidgetComponent from './components/widget.component';
import RequestService from './services/request.service';
import { IInitConfig, IWidgetConfig, IWidgetPayload, WidgetType } from './interfaces/i-widget.interfaces';
import LoggerDecorator from './services/logger.service';
import { LogLevel } from './interfaces/i-logger.interfaces';
import { MagicLinkHandler } from './components/magic-link-handler';

const possibleChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default class OwnIDUiSdk {
  // don't change version placeholder
  // eslint-disable-next-line no-template-curly-in-string
  version = '${APP_VERSION}';

  config = {} as IInitConfig;

  isGigyaAdded = false;

  private magicLinkHandler = {} as MagicLinkHandler;

  init(config: IInitConfig = {}): void {
    this.config = config;

    // init logger decorator
    if (config.logger) {
      // parse log level
      const logLevel = config.logLevel ? LogLevel[config.logLevel as keyof typeof LogLevel] : LogLevel.error;

      this.config.logger = new LoggerDecorator(config.logger, logLevel);
    }

    this.magicLinkHandler = new MagicLinkHandler(this.config, new RequestService(this.config.logger));

    if (this.config.onMagicLinkLogin) {
      this.magicLinkHandler.tryExchangeMagicToken().then((res) => {
        if (!res) return;

        this.config.onMagicLinkLogin!(res);
      });
    }
  }

  render(config: IWidgetConfig): WidgetComponent | null {
    if (!config.element) {
      // eslint-disable-next-line no-console
      console.error(`Parent element wasn't found on the page`);
      return null;
    }

    const desktopDisable = config.type === WidgetType.Link;
    const mobileDisable = !!config.inline;

    return new WidgetComponent(
      { ...this.config, ...config },
      new RequestService(this.config.logger),
      desktopDisable,
      mobileDisable,
    );
  }

  async getOwnIDPayload(widget: WidgetComponent): Promise<IWidgetPayload> {
    if (widget.disabled) {
      return Promise.resolve({ error: null, data: null, metadata: null });
    }

    if (widget.finalResponse) {
      return { error: null, data: widget.finalResponse, metadata: widget.metadata };
    }

    if (widget.returnError) {
      return { error: true, message: widget.returnError };
    }

    return widget.openWebapp();
  }

  async addOwnIDConnectionOnServer(widget: WidgetComponent, did: string): Promise<IWidgetPayload> {
    return widget.addOwnIDConnectionOnServer(did);
  }

  generateOwnIDPassword(length: number): string {
    let result = '';
    for (let i = length; i--; ) {
      result += possibleChars[Math.floor(Math.random() * possibleChars.length)];
    }
    return result;
  }

  reRenderWidget(ownIDWidget: WidgetComponent | null): WidgetComponent | null {
    if (!ownIDWidget) {
      return null;
    }

    ownIDWidget.destroy();

    return this.render(ownIDWidget.config);
  }

  sendMagicLink(email: string): Promise<void> {
    return this.magicLinkHandler.sendMagicLink(email);
  }
}
