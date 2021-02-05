import { IInitConfig, Languages } from '../interfaces/i-widget.interfaces';
import RequestService from '../services/request.service';
import ConfigurationService from '../services/configuration.service';
import { getCookie, setCookie } from '../services/helper.service';

export class MagicLinkHandler {
  readonly link: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tryExchangeMagicTokenPromise: Promise<any> | undefined;

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
  public async tryExchangeMagicToken(): Promise<any> {
    if (this.tryExchangeMagicTokenPromise) {
      return this.tryExchangeMagicTokenPromise;
    }

    this.tryExchangeMagicTokenPromise = new Promise((resolve, reject) => {
      const urlParams = new URLSearchParams(window.location.search);
      const magicToken = urlParams.get('ownid-mtkn');
      const context = urlParams.get('ownid-ctxt');

      if (!magicToken && !context) reject(new Error('Missing required params'));

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

    return this.tryExchangeMagicTokenPromise;
  }

  private getMagicLinkEndpointUrl(): string {
    const prefix = (this.config.URLPrefix || ConfigurationService.URLPrefix).replace(/\/+$/, '');

    return `${prefix}${ConfigurationService.magicLinkUrl}`;
  }
}
