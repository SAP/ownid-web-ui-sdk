import UserHandler from '../../components/user-handler';
import { IWidgetConfig, WidgetType } from '../../interfaces/i-widget.interfaces';
import RequestService from '../../services/request.service';
import GigyaUserHandler from './gigya-user-handler';
import GigyaWidgetComponent from './gigya-widget.component';

describe('Gigya widget', () => {
  let requestService: RequestService;

  it('Should use GigyaUserHandler by default', () => {
    return new Promise((resolve) => {
      const config = {} as IWidgetConfig;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const widget = new GigyaWidgetComponent(config, requestService) as any;

      expect(widget.userHandler).not.toBeNull();
      expect(widget.userHandler).not.toBeInstanceOf(UserHandler);
      expect(widget.userHandler).toBeInstanceOf(GigyaUserHandler);

      resolve();
    });
  });

  it('Should use user handler from config', () => {
    return new Promise((resolve) => {
      const userHandler = {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        isUserExists: (): Promise<boolean> => new Promise<boolean>((resolve) => resolve(true)),
      };

      const config: IWidgetConfig = {
        // @ts-ignore
        element: null,
        type: WidgetType.Login,
        userHandler,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const widget = new GigyaWidgetComponent(config, requestService) as any;

      expect(widget.userHandler).not.toBeNull();
      expect(widget.userHandler).not.toBeInstanceOf(UserHandler);
      expect(widget.userHandler).not.toBeInstanceOf(GigyaUserHandler);
      expect(widget.userHandler).toEqual(userHandler);

      resolve();
    });
  });
});
