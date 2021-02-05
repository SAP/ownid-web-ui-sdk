import { IInitConfig, Languages } from '../interfaces/i-widget.interfaces';
import RequestService from '../services/request.service';
import ConfigurationService from '../services/configuration.service';
import { getCookie, setCookie } from '../services/helper.service';

export class MagicLinkHandler {
  readonly link: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static tryExchangeMagicTokenPromise: Promise<any> | undefined;

  constructor(private config: IInitConfig, private requestService: RequestService) {
    this.link = this.getMagicLinkEndpointUrl();
  }

  public async sendMagicLink(email: string, language: Languages = Languages.en): Promise<unknown | null> {
    const headers = {
      'Accept-Language': language,
    };

    const fixedEmail = encodeURIComponent(email).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);

    // for RFC 3986 https://tools.ietf.org/html/rfc3986
    const response = await this.requestService.get(`${this.link}?email=${fixedEmail}`, { headers });

    if (response?.checkTokenKey) {
      setCookie(response.checkTokenKey, response.checkTokenValue, response.checkTokenLifetime);
    }

    return response;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public tryExchangeMagicToken(): Promise<any> {
    if (MagicLinkHandler.tryExchangeMagicTokenPromise) {
      return MagicLinkHandler.tryExchangeMagicTokenPromise;
    }

    MagicLinkHandler.tryExchangeMagicTokenPromise = new Promise((resolve, reject) => {
      const urlParams = new URLSearchParams(window.location.search);
      const magicToken = urlParams.get('ownid-mtkn');
      const context = urlParams.get('ownid-ctxt');

      if (!magicToken && !context) {
        resolve(null);
        return;
      }

      const checkToken = getCookie(`ownid-mlc-${context}`);
      this.requestService
        .post(`${this.getMagicLinkEndpointUrl()}`, {
          context,
          magicToken,
          checkToken,
        })
        .then(({ data }) => resolve(data))
        .catch(() => reject(new Error('Error while receiving login data')));
    });

    return MagicLinkHandler.tryExchangeMagicTokenPromise;
  }

  private getMagicLinkEndpointUrl(): string {
    const prefix = (this.config.URLPrefix || ConfigurationService.URLPrefix).replace(/\/+$/, '');

    return `${prefix}${ConfigurationService.magicLinkUrl}`;
  }
}
