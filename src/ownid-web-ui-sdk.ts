import WidgetComponent from './components/widget.component';
import RequestService from './services/request.service';
import { IInitConfig, IWidgetConfig, IWidgetPayload, WidgetType } from './interfaces/i-widget.interfaces';
import LoggerDecorator from './services/logger.service';
import { LogLevel } from './interfaces/i-logger.interfaces';

const possibleChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default class OwnIDUiSdk {
  // don't change version placeholder
  // eslint-disable-next-line no-template-curly-in-string
  version = '${APP_VERSION}';

  config = {} as IInitConfig;

  isGigyaAdded = false;

  init(config: IInitConfig = {}): void {
    this.config = config;

    // init logger decorator
    if (config.logger) {
      // parse log level
      const logLevel = config.logLevel ? LogLevel[config.logLevel as keyof typeof LogLevel] : LogLevel.error;

      this.config.logger = new LoggerDecorator(config.logger, logLevel);
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
      return Promise.resolve({ error: null, data: null });
    }

    if (widget.finalResponse) {
      return { error: null, data: widget.finalResponse };
    }

    if (widget.returnError) {
      return { error: true, message: widget.returnError };
    }

    return widget.openWebapp();
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
}
