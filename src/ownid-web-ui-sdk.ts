import WidgetComponent from './components/widget.component';
import RequestService from './services/request.service';
import {
  IInitConfig,
  IWidgetConfig,
  WidgetType,
} from './interfaces/i-widget.interfaces';
import GigyaLinkWidgetComponent from "./components/gigya-link-widget.component";
import LoggerDecorator from './services/logger.service';
import { LogLevel } from './interfaces/i-logger.interfaces';

export default class OwnIDUiSdk {
  config = {} as IInitConfig;

  isGigyaAdded = false;

  init(config: IInitConfig = {}): void {
    this.config = config;

    // init logger decorator
    if (config.logger) {
      // parse log level
      const logLevel = config.logLevel
        ? LogLevel[config.logLevel  as keyof typeof LogLevel]
        : LogLevel.error;

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
    const mobileDisable = false;

    return new WidgetComponent(
      {...this.config, ...config},
      new RequestService(this.config.logger),
      desktopDisable,
      mobileDisable,
    );
  }

  async renderLinkGigya(config: IWidgetConfig, apiKey: string): Promise<GigyaLinkWidgetComponent | null> {
    if (!config.element) {
      // eslint-disable-next-line no-console
      console.error(`Parent element wasn't found on the page`);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { gigya } = window;

    if(!apiKey && !gigya)
    {
      console.error(`Gigya apiKey should be provided`);
      return null;
    }

    return new Promise<GigyaLinkWidgetComponent | null>((resolve) => {
      const createWidgetResolve = () => {
        resolve(new GigyaLinkWidgetComponent(
          {...this.config, ...config},
          new RequestService()
        ));
      };

      if (!this.isGigyaAdded && !gigya) {
        this.isGigyaAdded = true;
        const src = `https://cdns.gigya.com/js/gigya.js?apikey=${apiKey}`;
        const scriptElement = document.createElement('script')
        scriptElement.src = src;
        scriptElement.addEventListener('load', createWidgetResolve);
        document.head.appendChild(scriptElement);
      } else {
        createWidgetResolve();
      }
    });
  }
}
