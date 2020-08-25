import WidgetComponent from './components/widget.component';
import RequestService from './services/request.service';
import { IInitConfig, IWidgetConfig, WidgetType } from './interfaces/i-widget.interfaces';
import GigyaLinkWidgetComponent from './components/gigya-link-widget.component';
import LoggerDecorator from './services/logger.service';
import { LogLevel } from './interfaces/i-logger.interfaces';

const possibleChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default class OwnIDUiSdk {
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
    const mobileDisable = config.type === WidgetType.Register && config.partial;

    return new WidgetComponent(
      { ...this.config, ...config },
      new RequestService(this.config.logger),
      desktopDisable,
      mobileDisable,
    );
  }

  async getOwnIDPayload(widget: WidgetComponent): Promise<unknown> {
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

  async renderLinkGigya(config: IWidgetConfig, apiKey: string): Promise<GigyaLinkWidgetComponent | null> {
    if (!config.element) {
      // eslint-disable-next-line no-console
      console.error(`Parent element wasn't found on the page`);
      return null;
    }

    // @ts-ignore
    const { gigya } = window;

    if (!apiKey && !gigya) {
      // eslint-disable-next-line no-console
      console.error(`Gigya apiKey should be provided`);
      return null;
    }

    return new Promise<GigyaLinkWidgetComponent | null>((resolve) => {
      const createWidgetResolve = () => {
        resolve(new GigyaLinkWidgetComponent({ ...this.config, ...config }, new RequestService()));
      };

      if (!this.isGigyaAdded && !gigya) {
        this.isGigyaAdded = true;
        const src = `https://cdns.gigya.com/js/gigya.js?apikey=${apiKey}`;
        const scriptElement = document.createElement('script');
        scriptElement.src = src;
        scriptElement.addEventListener('load', createWidgetResolve);
        document.head.appendChild(scriptElement);
      } else {
        createWidgetResolve();
      }
    });
  }
}
