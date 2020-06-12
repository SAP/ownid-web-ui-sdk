import WidgetComponent from "./widget.component";
import {IWidgetConfig} from "../interfaces/i-widget.interfaces";
import RequestService from "../services/request.service";
import ConfigurationService from "../services/configuration.service";

export default class GigyaLinkWidgetComponent extends WidgetComponent {
  constructor(protected config: IWidgetConfig,
              protected requestService: RequestService) {

    super(config, requestService, true, false, () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return  window.gigya.accounts.getJWT({
        callback: (data: IGetJwtResponse) => {
          if (data.errorCode !== 0) {
            console.error(`Gigya.GetJWT -> ${data.errorCode}: ${data.errorMessage}`)
          }

          this.widgetReady = this.getContext(
            this.config.URLPrefix || ConfigurationService.URLPrefix,
            {jwt: data.id_token}
          );
        }
      })
    });
  }
}

interface IGetJwtResponse {
  errorCode: number;
  errorMessage: string;
  id_token: string;
}
