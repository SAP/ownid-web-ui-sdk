import UserHandler from '../../components/user-handler';
import { IWidgetConfig, WidgetType } from '../../interfaces/i-widget.interfaces';
import RequestService from '../../services/request.service';
import GigyaUserHandler from './gigya-user-handler';
import GigyaWidgetComponent from './gigya-widget.component';

console.error = jest.fn();

describe('Gigya widget', () => {
  let requestService: RequestService;

  it('Should use GigyaUserHandler by default', () => {
    const config = {} as IWidgetConfig;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sut = new GigyaWidgetComponent(config, requestService) as any;

    expect(sut.userHandler).not.toBeNull();
    expect(sut.userHandler).not.toBeInstanceOf(UserHandler);
    expect(sut.userHandler).toBeInstanceOf(GigyaUserHandler);
  });

  it('Should use user handler from config', () => {
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
    const sut = new GigyaWidgetComponent(config, requestService) as any;

    expect(sut.userHandler).not.toBeNull();
    expect(sut.userHandler).not.toBeInstanceOf(UserHandler);
    expect(sut.userHandler).not.toBeInstanceOf(GigyaUserHandler);
    expect(sut.userHandler).toEqual(userHandler);
  });

  describe('init', () => {
    beforeEach(() => {
      requestService = {} as RequestService;
      requestService.post = jest.fn();
    })

    it('should call super init if not Link widget type', async () => {
      const config = {
        type: WidgetType.Login,
      } as IWidgetConfig;

      // @ts-ignore
      window.gigya = { accounts: { getJWT: jest.fn() } };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sut = new GigyaWidgetComponent(config, requestService) as any;

      sut.getContext = jest.fn().mockResolvedValue(true);

      await sut.init(config);

      // @ts-ignore
      expect(window.gigya.accounts.getJWT).not.toHaveBeenCalled();
    });

    it('should call window.gigya.accounts.getJWT for Link widget type', async () => {
      const config = {
        type: WidgetType.Link,
      } as IWidgetConfig;

      // @ts-ignore
      window.gigya = {
        accounts: {
          getJWT: jest.fn().mockImplementation(({ callback }: { callback: (params: { id_token?: string; errorCode: number; }) => Promise<void> }) => {
            callback({ id_token: 'id_token', errorCode: 0 }).then();
          }),
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sut = new GigyaWidgetComponent(config, requestService, undefined, true, true) as any;

      sut.getContext = jest.fn().mockResolvedValue(true);

      await sut.init(config);

      // @ts-ignore
      expect(window.gigya.accounts.getJWT).toHaveBeenCalled();
      expect(sut.getContext).toHaveBeenCalled();
    });

    it('should call window.gigya.accounts.getJWT for Link widget type (handle error)', async () => {
      const config = {
        type: WidgetType.Link,
      } as IWidgetConfig;

      // @ts-ignore
      window.gigya = {
        accounts: {
          getJWT: jest.fn().mockImplementation(({ callback }: { callback: (params: { errorMessage: string; errorCode: number; }) => Promise<void> }) => {
            callback({ errorCode: 1, errorMessage: 'errorMessage' }).then();
          }),
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sut = new GigyaWidgetComponent(config, requestService) as any;

      sut.getContext = jest.fn().mockResolvedValue(true);

      try {
        await sut.init(config);
      }
      catch (e) {
        // @ts-ignore
        expect(window.gigya.accounts.getJWT).toHaveBeenCalled();
        expect(e.toString()).toBe('Error: Gigya.GetJWT -> 1: errorMessage');
      }
    });
  });
});
