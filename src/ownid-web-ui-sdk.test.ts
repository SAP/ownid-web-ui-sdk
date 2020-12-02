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
          logLevel: 3,
        },
      });
    });

    it('init should set config (more options)', () => {
      const params = {
        URLPrefix: 'url',
        logger: {} as ILogger,
        logLevel: 'info' as const,
      };

      sdk.init(params);

      expect(sdk.config).toEqual({
        URLPrefix: 'url',
        logLevel: 'info',
        logger: {
          externalLogger: {},
          logLevel: 2,
        },
      });
    });

    it('should set config to {}', () => {
      sdk.init();

      expect(sdk.config).toEqual({});
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

  describe('generateOwnIDPassword', () => {
    it('should create random string with defined length', () => {
      const res = sdk.generateOwnIDPassword(10);

      expect(res.length).toEqual(10);
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
