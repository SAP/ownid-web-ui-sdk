import WidgetComponent from './components/widget.component';
import RequestService from './services/request.service';
import {
  IInitConfig,
  IWidgetConfig,
  WidgetType,
} from './interfaces/i-widget.interfeces';
import GigyaLinkWidgetComponent from "./components/gigya-link-widget.component";

export default class OwnIDUiSdk {
  config = {} as IInitConfig;

  isGigyaAdded = false;

  init(config: IInitConfig = {}): void {
    this.config = config;
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
      new RequestService(),
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
        document.head.append(scriptElement);
      } else {
        createWidgetResolve();
      }
    });
  }
}
