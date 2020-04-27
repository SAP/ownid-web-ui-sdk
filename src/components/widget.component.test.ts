import WidgetComponent from "./widget.component";
import RequestService from "../services/request.service";
import {WidgetType} from "../interfaces/i-widget.interfeces";

interface IMyNavigator extends Navigator {
  userAgent: string;
}

declare let navigator: IMyNavigator;

Object.defineProperty(navigator, "userAgent", ((value) => ({
  bValue: value,
  get() {
    return this.bValue;
  },
  set(v: string) {
    this.bValue = v;
  }
}))(navigator.userAgent));

describe('ctor-> render', () => {
  let requestService: RequestService;
  // eslint-disable-next-line no-console
  console.error = jest.fn();

  beforeEach(() => {
    requestService = {} as RequestService;
    requestService.post = jest.fn().mockReturnValue(new Promise((resolve) => {
      resolve({
        context: '123',
        url: 'url'
      })
    }));
  });

  it('should render and add chile in mobile mode', () => {
    return new Promise((resolve) => {
      navigator.userAgent = 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

      const parent = document.createElement('div');
      document.body.append(parent);

      const sut = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          getContextURL: 'url'
        },
        requestService,
      );

      sut.widgetReady.then(() => {
        expect(sut).not.toBeNull();
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].tagName.toLowerCase()).toEqual('a');

        resolve(true);
      });
    })
  });

  it('should render and add chile in desktop mode', () => {
    return new Promise((resolve) => {
      navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

      const parent = document.createElement('div');
      document.body.append(parent);

      const sut = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          getContextURL: 'url'
        },
        requestService,
      );

      sut.widgetReady.then(() => {
        expect(sut).not.toBeNull();
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].tagName.toLowerCase()).toEqual('div');

        resolve(true);
      });
    })
  });

  it('should not render', () => {
    return new Promise((resolve) => {
       // eslint-disable-next-line no-shadow
      requestService.post = jest.fn().mockReturnValue(new Promise((resolve) => resolve(null)));

      const parent = document.createElement('div');

      const sut = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          getContextURL: 'url'
        },
        requestService,
      );
      sut.widgetReady.then(() => {
        expect(parent.children.length).toBe(0);
        resolve();
      });
    })
  });
});
