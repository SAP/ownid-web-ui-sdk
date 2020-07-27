import RequestService from "../services/request.service";
import { WidgetType } from "../interfaces/i-widget.interfaces";
import GigyaLinkWidgetComponent from "./gigya-link-widget.component";

interface IMyNavigator extends Navigator {
  userAgent: string;
}

declare let navigator: IMyNavigator;

Object.defineProperty(
  navigator,
  'userAgent',
  (value => ({
    bValue: value,
    get() {
      return this.bValue;
    },
    set(v: string) {
      this.bValue = v;
    },
  }))(navigator.userAgent),
);

describe('widget component', () => {
  let requestService: RequestService;
  // eslint-disable-next-line no-console
  console.error = jest.fn();

  // @ts-ignore
  window.gigya = {
    accounts: {
      getJWT: jest.fn().mockImplementation(options => {
        options.callback({
          errorCode: 0,
          errorMessage: '',
          id_token: 'jwt'
        })
      })
    }
  }

  beforeEach(() => {
    requestService = {} as RequestService;
    requestService.post = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolve({
          context: '123',
          nonce: '234',
          url: 'url',
        });
      }),
    );
  });

  it('should render and add chile in mobile mode', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

      const parent = document.createElement('div');
      document.body.appendChild(parent);

      const sut = new GigyaLinkWidgetComponent(
        {
          element: parent,
          type: WidgetType.Link,
        },
        requestService,
      );

      sut.widgetReady.then(() => {
        expect(sut).not.toBeNull();
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].tagName.toLowerCase()).toEqual('button');
        // @ts-ignore
        expect(window.gigya.accounts.getJWT).toBeCalledTimes(1);

        resolve(true);
      });
    });
  });

  it('should render in desktop mode', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

      const parent = document.createElement('div');
      document.body.appendChild(parent);

      const sut = new GigyaLinkWidgetComponent(
        {
          element: parent,
          type: WidgetType.Link,
          URLPrefix: 'url',
        },
        requestService,
      );

      sut.widgetReady.then(() => {
        expect(sut).not.toBeNull();
        expect(parent.children.length).toBe(1);

        resolve(true);
      });
    });
  });

  it('should render and add chile in mobile mode2', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

      const parent = document.createElement('div');
      document.body.appendChild(parent);
      console.error = jest.fn();


      // @ts-ignore
      window.gigya.accounts.getJWT = jest.fn().mockImplementationOnce(options => {
        options.callback({
          errorCode: 1,
          errorMessage: 'my fake error'
        })
      });

      const sut: any = new GigyaLinkWidgetComponent(
        {
          element: parent,
          type: WidgetType.Link,
          URLPrefix: 'url',
        },
        requestService,
      );
      sut.getContext = jest.fn();

      sut.widgetReady.finally(() => {
          expect(parent.children.length).toBe(0);

          // @ts-ignore
          expect(window.gigya.accounts.getJWT).toBeCalledTimes(1);
          expect(sut.getContext).not.toBeCalled();
          expect(console.error).toBeCalledWith('Gigya.GetJWT -> 1: my fake error');
          resolve();
        });
    });
  });
});
