import OwnIDUiSdk from './ownid-web-ui-sdk';
import WidgetComponent from './components/widget.component';
import { IWidgetConfig, WidgetType } from './interfaces/i-widget.interfaces';
import { ILogger } from './interfaces/i-logger.interfaces';
import RequestService from './services/request.service';

describe('OwnIDUiSdk instances test', () => {
  let sdk: OwnIDUiSdk;

  beforeEach(() => {
    sdk = new OwnIDUiSdk();
  });

  // eslint-disable-next-line no-console
  console.error = jest.fn();

  it('DummyClass is instantiable', () => {
    expect(sdk).toBeInstanceOf(OwnIDUiSdk);
  });

  describe('init', () => {
    it('init should set config', () => {
      const params = {
        URLPrefix: 'url',
        logger: {} as ILogger,
      };
      sdk.init(params);

      expect(sdk.config).toEqual({
        URLPrefix: 'url',
        logger: {
          externalLogger: {},
          logLevel: 4,
        },
      });
    });

    it('init should set config (more options)', () => {
      const params = {
        URLPrefix: 'url',
        logger: {} as ILogger,
        logLevel: 'information' as const,
      };

      sdk.init(params);

      expect(sdk.config).toEqual({
        URLPrefix: 'url',
        logLevel: 'information',
        logger: {
          externalLogger: {},
          logLevel: 2,
        },
      });
    });

    it('should set config to {}', () => {
      sdk.init();

      expect(sdk.config).toEqual({
        logger: {
          URLPrefix: '',
          logLevel: 4,
        },
      });
    });
  });

  describe('render', () => {
    it('render should call WidgetComponent', () => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Login,
      };
      const sut = sdk.render(params);

      expect(sut).toBeInstanceOf(WidgetComponent);
    });

    it('render should call WidgetComponent for partial', () => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Register,
        partial: true,
      };
      const sut = sdk.render(params);

      expect(sut).toBeInstanceOf(WidgetComponent);
    });

    it('render should return null', () => {
      const params: IWidgetConfig = {
        // @ts-ignore
        element: null,
        type: WidgetType.Login,
      };
      const sut = sdk.render(params);

      expect(sut).toBe(null);
    });
  });

  describe('getOwnIDPayload', () => {
    let widget: WidgetComponent;

    beforeEach(() => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Login,
      };
      widget = new WidgetComponent(params, new RequestService());
    });

    it('should call widget.openWebapp', () => {
      widget.disabled = false;
      widget.openWebapp = jest.fn();

      sdk.getOwnIDPayload(widget);

      expect(widget.openWebapp).toBeCalled();
    });

    it('should return response', async () => {
      widget.disabled = false;
      widget.finalResponse = { response: true };
      widget.metadata = 'jwt';

      const res = await sdk.getOwnIDPayload(widget);

      expect(res).toEqual({ error: null, data: { response: true }, metadata: 'jwt' });
    });

    it('should return an error', async () => {
      widget.disabled = false;
      widget.returnError = 'show error';

      const res = await sdk.getOwnIDPayload(widget);

      expect(res).toEqual({ error: true, message: 'show error' });
    });

    it('should return an error 2', async () => {
      const res = await sdk.getOwnIDPayload(widget);

      expect(res).toEqual({ error: null, data: null, metadata: null });
    });
  });

  describe('addOwnIDConnectionOnServer', () => {
    it('should call addOwnIDConnectionOnServer on widget', () => {
      const widget = {} as WidgetComponent;
      widget.addOwnIDConnectionOnServer = jest.fn();
      sdk.addOwnIDConnectionOnServer(widget, 'uid');

      expect(widget.addOwnIDConnectionOnServer).toBeCalledWith('uid');
    });
  });

  describe('generateOwnIDPassword', () => {
    it('should create random string with defined length and all groups', () => {
      const res = sdk.generateOwnIDPassword(100, 5, 10, 5);
      expect(/^[a-zA-Z0-9@$%*&^\-+!#_=]{100}$/.test(res)).toEqual(true);
    });

    it('should create random string with defined length and 1 group', () => {
      const res = sdk.generateOwnIDPassword(100, 0, 0, 0);
      expect(/^[a-z]{100}$/.test(res)).toEqual(true);
    });

    it('should create random string with defined length and 2 groups', () => {
      const res = sdk.generateOwnIDPassword(100, 1, 0, 0);
      expect(/^[a-zA-Z]{100}$/.test(res)).toEqual(true);
    });

    it('should create random string with defined length and 3 groups', () => {
      const res = sdk.generateOwnIDPassword(100, 3, 3, 0);
      expect(/^[a-zA-Z0-9]{100}$/.test(res)).toEqual(true);
    });
  });

  describe('reRenderWidget', () => {
    it('should rerender widget', () => {
      const ownIDWidget = {} as WidgetComponent;

      ownIDWidget.destroy = jest.fn();
      sdk.render = jest.fn();

      ownIDWidget.config = {
        element: {} as HTMLElement,
        type: WidgetType.Login,
      };

      sdk.reRenderWidget(ownIDWidget);

      expect(ownIDWidget.destroy).toHaveBeenCalled();
      expect(sdk.render).toHaveBeenCalledWith(ownIDWidget.config);
    });

    it('should do nothing if no widget passed', () => {
      sdk.render = jest.fn();

      sdk.reRenderWidget(null);

      expect(sdk.render).not.toHaveBeenCalled();
    });
  });
});
