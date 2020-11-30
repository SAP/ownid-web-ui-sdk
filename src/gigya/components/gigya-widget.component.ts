import { IFullWidgetConfig, IWidgetConfig, WidgetType } from '../../interfaces/i-widget.interfaces';
import WidgetComponent from '../../components/widget.component';
import RequestService from '../../services/request.service';
import GigyaUserHandler from './gigya-user-handler';
import ConfigurationService from '../../services/configuration.service';

interface IGetJwtResponse {
  errorCode: number;
  errorMessage: string;
  id_token: string;
}

export default class GigyaWidgetComponent extends WidgetComponent {
  constructor(
    public config: IFullWidgetConfig,
    protected requestService: RequestService,
    protected disableDesktop: boolean = false,
    protected disableMobile: boolean = false,
  ) {
    super(config, requestService, disableDesktop, disableMobile);

    if (!config.userHandler) {
      this.userHandler = new GigyaUserHandler(config.logger);
    }
  }

  protected init(config: IWidgetConfig): Promise<void> {
    if (config.type !== WidgetType.Link) {
      return super.init(config);
    }

    return new Promise<void>((resolve, reject) => {
      // @ts-ignore
      window.gigya.accounts.getJWT({
        callback: async (data: IGetJwtResponse) => {
          if (data.errorCode !== 0) {
            const errorText = `Gigya.GetJWT -> ${data.errorCode}: ${data.errorMessage}`;
            // eslint-disable-next-line no-console
            console.error(errorText);
            reject(new Error(errorText));
          }

          await this.getContext(config.URLPrefix || ConfigurationService.URLPrefix, {
            jwt: data.id_token,
            ...config.data,
          });

          resolve();
        },
      });
    });
  }
}
