import { IWidgetConfig } from '../../interfaces/i-widget.interfaces';
import WidgetComponent from '../../components/widget.component';
import RequestService from '../../services/request.service';
import GigyaUserHandler from './gigya-user-handler';

export default class GigyaWidgetComponent extends WidgetComponent {
  constructor(config: IWidgetConfig, requestService: RequestService) {
    super(config, requestService);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allConfig: any = config;

    if (!config.userHandler) this.userHandler = new GigyaUserHandler(allConfig.logger);
  }
}
