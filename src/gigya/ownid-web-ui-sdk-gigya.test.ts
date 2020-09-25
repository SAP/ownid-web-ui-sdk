import { WidgetType } from '../interfaces/i-widget.interfaces';
import GigyaLinkWidgetComponent from './components/gigya-link-widget.component';
import OwnIDUiSdkGigya from './ownid-web-ui-sdk-gigya';

describe('OwnIDUiSdkGigya instances test', () => {
  const sdk = new OwnIDUiSdkGigya();

  // eslint-disable-next-line no-console
  console.error = jest.fn();

  it('DummyClass is instantiable', () => {
    expect(sdk).toBeInstanceOf(OwnIDUiSdkGigya);
  });

  it('renderLink should return null if no api key', () => {
    return new Promise((resolve) => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Link,
      };
      sdk
        // @ts-ignore
        .renderLink(params, null)
        .then((windget: GigyaLinkWidgetComponent | null) => {
          expect(windget).toBeNull();
        })
        .finally(() => {
          resolve();
        });
    });
  });

  it('renderLink should call GigyaLinkWidgetComponent and use Gigya JS SDK', () => {
    return new Promise((resolve, reject) => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Link,
      };

      sdk.isGigyaAdded = true;

      // @ts-ignore
      window.gigya = {
        accounts: {
          getJWT: () => {},
        },
      };

      window.ownid = { config: params } as any;

      sdk
        .renderLink(params, '')
        .then((windget: GigyaLinkWidgetComponent | null) => {
          expect(windget).toBeInstanceOf(GigyaLinkWidgetComponent);
          // @ts-ignore
          expect(window.gigya).not.toBeNull();
          resolve();
        })
        .catch(() => reject);
    });
  });

  it('renderLink should call GigyaLinkWidgetComponent and load Gigya JS SDK', () => {
    return new Promise((resolve, reject) => {
      const params = {
        element: document.createElement('div'),
        type: WidgetType.Link,
      };

      // @ts-ignore
      window.gigya = null;
      sdk.isGigyaAdded = false;
      const scriptElement = document.createElement('script');
      scriptElement.addEventListener = jest.fn().mockImplementationOnce((event: string, callback: () => void) => {
        if (event === 'load') {
          // @ts-ignore
          window.gigya = {
            accounts: {
              getJWT: () => {},
            },
          };
          callback();
        }
      });

      document.createElement = jest.fn().mockImplementationOnce((tag: string) => {
        if (tag === 'script') {
          return scriptElement;
        }

        return null;
      });

      sdk
        .renderLink(params, '3_s5-gLs4aLp5FXluP8HXs7_JN40XWNlbvYWVCCkbNCqlhW6Sm5Z4tXGGsHcSJYD3W')
        .then((widget: GigyaLinkWidgetComponent | null) => {
          expect(widget).toBeInstanceOf(GigyaLinkWidgetComponent);
          expect(sdk.isGigyaAdded).toBeTruthy();
          resolve();
        })
        .catch(() => reject);
    });
  });
});
