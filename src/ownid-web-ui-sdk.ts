import WidgetComponent from './components/widget.component';
import RequestService from './services/request.service';
import { IInitConfig, IWidgetConfig, IWidgetPayload, WidgetType } from './interfaces/i-widget.interfaces';
import LoggerDecorator from './services/logger.service';
import { LogLevel } from './interfaces/i-logger.interfaces';
import { MagicLinkHandler } from './components/magic-link-handler';
import BackendLogger from './services/backendLogger.service';

function addGroup(arr: string[], length: number, possibleChars: string, number = 1) {
  for (let i = Math.floor(Math.random() * (length / 4 - number) + number); i--; ) {
    const char = possibleChars[Math.floor(Math.random() * possibleChars.length)];
    arr.push(char);
  }

  return arr;
}

function shuffle(arr: string[]) {
  for (let i = arr.length - 1; i--; ) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = arr[i];
    // eslint-disable-next-line no-param-reassign
    arr[i] = arr[j];
    // eslint-disable-next-line no-param-reassign
    arr[j] = x;
  }
  return arr;
}

export default class OwnIDUiSdk {
  // don't change version placeholder
  // eslint-disable-next-line no-template-curly-in-string
  version = '${APP_VERSION}';

  config = {} as IInitConfig;

  protected magicLinkHandler: MagicLinkHandler | undefined;

  init(config: IInitConfig = {}): void {
    this.config = config;

    // init logger decorator
    if (config.logger) {
      // parse log level
      const logLevel = config.logLevel ? LogLevel[config.logLevel as keyof typeof LogLevel] : LogLevel.error;

      this.config.logger = new LoggerDecorator(config.logger, logLevel);
    }
    else {
      this.config.logger = new BackendLogger(LogLevel.error, config.URLPrefix || '');
    }

    if (this.config.onMagicLinkLogin) {
      this.magicLinkHandler = new MagicLinkHandler(this.config, new RequestService(this.config.logger));

      this.magicLinkHandler
        .tryExchangeMagicToken()
        .then((res) => {
          if (!res) return;

          this.config.onMagicLinkLogin!(res);
        })
        .catch((error) => {
          if (!error || !this.config.onMagicLinkError) return;

          this.config.onMagicLinkError(error);
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
    const mobileDisable = !!config.inline || !!config.tooltip;

    return new WidgetComponent(
      { ...this.config, ...config },
      new RequestService(this.config.logger),
      this.magicLinkHandler,
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

  generateOwnIDPassword(length: number, numberCapitalised = 1, numberNumbers = 1, numberSpecial = 1): string {
    const possibleRegularChars = 'abcdefghijklmnopqrstuvwxyz';
    const possibleCapitalChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const possibleNumberChars = '0123456789';
    const possibleSpecialChars = '@$%*&^-+!#_=';

    let resArr: string[] = [];

    if (numberCapitalised) {
      resArr = addGroup(resArr, length, possibleCapitalChars, numberCapitalised);
    }
    if (numberNumbers) {
      resArr = addGroup(resArr, length, possibleNumberChars, numberNumbers);
    }
    if (numberSpecial) {
      resArr = addGroup(resArr, length, possibleSpecialChars, numberSpecial);
    }

    const arrLength = resArr.length;

    for (let i = length; i > arrLength; i--) {
      resArr.push(possibleRegularChars[Math.floor(Math.random() * possibleRegularChars.length)]);
    }

    resArr = shuffle(resArr);

    return resArr.join('');
  }

  reRenderWidget(ownIDWidget: WidgetComponent | null): WidgetComponent | null {
    if (!ownIDWidget) {
      return null;
    }

    ownIDWidget.destroy();

    return this.render(ownIDWidget.config);
  }
}
