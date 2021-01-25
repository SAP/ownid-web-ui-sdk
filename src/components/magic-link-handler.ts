import { IInitConfig, Languages } from '../interfaces/i-widget.interfaces';
import RequestService from '../services/request.service';
import ConfigurationService from '../services/configuration.service';
import { getCookie, setCookie } from '../services/helper.service';

export class MagicLinkHandler {
  readonly link: string;

  constructor(private config: IInitConfig, private requestService: RequestService) {
    this.link = this.getMagicLinkEndpointUrl();
  }

  public async sendMagicLink(email: string, language: Languages = Languages.en): Promise<unknown | null> {
    const headers = {
      'Accept-Language': language,
    };

    const response = await this.requestService.get(`${this.link}?email=${email}`, { headers });

    if (response?.checkTokenKey) {
      setCookie(response.checkTokenKey, response.checkTokenValue, response.checkTokenLifetime);
    }

    return response;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async tryExchangeMagicToken(): Promise<any> {
    const urlParams = new URLSearchParams(window.location.search);
    const magicToken = urlParams.get('ownid-mtkn');
    const context = urlParams.get('ownid-ctxt');

    if (!magicToken && !context) return null;

    const checkToken = getCookie(`ownid-mlc-${context}`);
    const { data } = await this.requestService.post(`${this.getMagicLinkEndpointUrl()}`, {
      context,
      magicToken,
      checkToken,
    });

    return data;
  }

  private getMagicLinkEndpointUrl(): string {
    const prefix = (this.config.URLPrefix || ConfigurationService.URLPrefix).replace(/\/+$/, '');

    return `${prefix}${ConfigurationService.magicLinkUrl}`;
  }
}
