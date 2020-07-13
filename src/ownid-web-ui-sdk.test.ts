import OwnIDUiSdk from './ownid-web-ui-sdk';
import WidgetComponent from './components/widget.component';
import { IWidgetConfig, WidgetType } from './interfaces/i-widget.interfaces';
import GigyaLinkWidgetComponent from "./components/gigya-link-widget.component";
import { ILogger } from './interfaces/i-logger.interfaces';

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
      logger: {} as ILogger,
    };
    sdk.init(params);

    expect(sdk.config).toEqual({
      URLPrefix: 'url',
      logger: {
        externalLogger: {},
        logLevel: 3,
      }
    });
  });

  it('init should set config (more options)', () => {
    const params = {
      URLPrefix: 'url',
      logger: {} as ILogger,
      logLevel: 'info' as 'info',
    };

    sdk.init(params);

    expect(sdk.config).toEqual({
      URLPrefix: 'url',
      logLevel: 'info',
      logger: {
        externalLogger: {},
        logLevel: 2,
      }
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

  it('renderLinkGigya should return null if no element', () => {
    return new Promise(resolve => {
      const params = {
        element: null,
        type: WidgetType.Link,
      };
      // @ts-ignore
      sdk.renderLinkGigya(params, '3_s5-gLs4aLp5FXluP8HXs7_JN40XWNlbvYWVCCkbNCqlhW6Sm5Z4tXGGsHcSJYD3W')
        .then((windget: GigyaLinkWidgetComponent|null) => {
          expect(windget).toBeNull();
        })
        .finally(()=>{resolve()});
    })
  });

  it('renderLinkGigya should return null if no api key', () => {
    return new Promise(resolve => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Link,
      };
      // @ts-ignore
      sdk.renderLinkGigya(params, null)
        .then((windget: GigyaLinkWidgetComponent|null) => {
          expect(windget).toBeNull();
        })
        .finally(()=>{resolve()});
    })
  });

  it('renderLinkGigya should call GigyaLinkWidgetComponent and use Gigya JS SDK', () => {
    return new Promise((resolve, reject) => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Link,
      };

      sdk.isGigyaAdded = true;

      // @ts-ignore
      window.gigya = {
        accounts: {
          getJWT : () =>{}
        }
      };

      sdk.renderLinkGigya(params, '')
        .then((windget: GigyaLinkWidgetComponent|null) => {
          expect(windget).toBeInstanceOf(GigyaLinkWidgetComponent);
          // @ts-ignore
          expect(window.gigya).not.toBeNull();
          resolve();
        })
        .catch(()=>reject);
    })
  });

  it('renderLinkGigya should call GigyaLinkWidgetComponent and load Gigya JS SDK', () => {
    return new Promise((resolve, reject) => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Link,
      };

      // @ts-ignore
      window.gigya = null;
      sdk.isGigyaAdded = false;
      const scriptElement = document.createElement('script');
      scriptElement.addEventListener = jest.fn().mockImplementationOnce((event: string, callback: ()=>void) => {
        if(event === 'load') {
          // @ts-ignore
          window.gigya = {
            accounts: {
              getJWT : () =>{}
            }
          };
          callback();
        }
      })

      document.createElement = jest.fn().mockImplementationOnce((tag: string) => {
        if(tag === 'script')
        {
          return scriptElement;
        }

        return null;
      });

      sdk.renderLinkGigya(params, '3_s5-gLs4aLp5FXluP8HXs7_JN40XWNlbvYWVCCkbNCqlhW6Sm5Z4tXGGsHcSJYD3W')
        .then((widget: GigyaLinkWidgetComponent|null) => {
          expect(widget).toBeInstanceOf(GigyaLinkWidgetComponent);
          expect(sdk.isGigyaAdded).toBeTruthy();
          resolve();
        }).catch(()=>reject);
    })
  });

});
