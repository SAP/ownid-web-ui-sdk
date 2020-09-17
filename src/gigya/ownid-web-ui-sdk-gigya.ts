import { IWidgetConfig } from '../interfaces/i-widget.interfaces';
import RequestService from '../services/request.service';
import GigyaLinkWidgetComponent from './components/gigya-link-widget.component';
import OwnIDUiSdkGigyaScreenSets from './ownid-web-ui-sdk-gigya-screen-sets';

export default class OwnIDUiSdkGigya {
  screenSets = new OwnIDUiSdkGigyaScreenSets();

  isGigyaAdded = false;

  async renderLink(config: IWidgetConfig, apiKey: string): Promise<GigyaLinkWidgetComponent | null> {
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
        if (!window.ownid || !window.ownid.config) {
          // eslint-disable-next-line no-console
          console.error('OwnID is not initialized, please call window.ownid.init() function');
          resolve(null);
        }

        resolve(new GigyaLinkWidgetComponent({ ...window.ownid.config, ...config }, new RequestService()));
      };

      if (!this.isGigyaAdded && !gigya) {
        this.isGigyaAdded = true;
        const src = `https://cdns.gigya.com/js/gigya.js?apikey=${ apiKey }`;
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
