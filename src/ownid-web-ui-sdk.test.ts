import OwnIDUiSdk from './ownid-web-ui-sdk';
import WidgetComponent from './components/widget.component';
import { IWidgetConfig, WidgetType } from './interfaces/i-widget.interfeces';

describe('OwnIDUiSdk instances test', () => {
  const sdk = new OwnIDUiSdk();

  // eslint-disable-next-line no-console
  console.error = jest.fn();

  it('DummyClass is instantiable', () => {
    expect(sdk).toBeInstanceOf(OwnIDUiSdk);
  });

  it('init should set config', () => {
    const params = {
      URLPrefix: 'url',
    };
    sdk.init(params);

    expect(sdk.config).toEqual({
      URLPrefix: 'url',
    });
  });

  it('should set config to {}', () => {
    sdk.init();

    expect(sdk.config).toEqual({});
  });

  it('render should call WidgetComponent', () => {
    const params = {
      element: document.createElement('div'),
      type: WidgetType.Login,
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

  // it('render should call WidgetComponent', () => {
  //   const params = {
  //     element: document.createElement('div'),
  //     type: WidgetType.Login,
  //   };
  //   const sut = sdk.renderLinkGigya(params, );
  //
  //   expect(sut).toBeInstanceOf(WidgetComponent);
  // });
  //
  // it('render should return null', () => {
  //   const params: IWidgetConfig = {
  //     // @ts-ignore
  //     element: null,
  //     type: WidgetType.Login,
  //   };
  //   const sut = sdk.render(params);
  //
  //   expect(sut).toBe(null);
  // });
});
