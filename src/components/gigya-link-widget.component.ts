import WidgetComponent from './widget.component';
import { IWidgetConfig } from '../interfaces/i-widget.interfaces';
import RequestService from '../services/request.service';
import ConfigurationService from '../services/configuration.service';

export default class GigyaLinkWidgetComponent extends WidgetComponent {
  constructor(protected config: IWidgetConfig, protected requestService: RequestService) {
    super(config, requestService);
  }

  protected init(config: IWidgetConfig) {
    return new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.gigya.accounts.getJWT({
        callback: async (data: IGetJwtResponse) => {
          if (data.errorCode !== 0) {
            const errorText = `Gigya.GetJWT -> ${data.errorCode}: ${data.errorMessage}`;
            console.error(errorText);
            reject(new Error(errorText));
          }

          await this.getContext(config.URLPrefix || ConfigurationService.URLPrefix, { jwt: data.id_token });

          resolve();
        },
      });
    });
  }
}

interface IGetJwtResponse {
  errorCode: number;
  errorMessage: string;
  id_token: string;
}
