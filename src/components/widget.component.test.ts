import WidgetComponent from './widget.component';
import RequestService from '../services/request.service';
import { Languages, WidgetType } from '../interfaces/i-widget.interfeces';

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
      document.body.append(parent);

      const sut = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );

      sut.widgetReady.then(() => {
        expect(sut).not.toBeNull();
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].tagName.toLowerCase()).toEqual('a');

        resolve(true);
      });
    });
  });

  it('should render and add chile in desktop mode', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

      const parent = document.createElement('div');
      document.body.append(parent);

      const sut = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );

      sut.widgetReady.then(() => {
        expect(sut).not.toBeNull();
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].tagName.toLowerCase()).toEqual('div');

        resolve(true);
      });
    });
  });

  it('should not render', () => {
    return new Promise(resolve => {
      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve(null)));

      const parent = document.createElement('div');

      const sut = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );
      sut.widgetReady.then(() => {
        expect(parent.children.length).toBe(0);
        resolve();
      });
    });
  });

  it('should not render in desktop mode when desktopDisabled = true', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';
      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve({})));

      const parent = document.createElement('div');
      document.body.append(parent);
      console.warn = jest.fn();
      const type = WidgetType.Login;
      const sut = new WidgetComponent(
        {
          element: parent,
          type,
          URLPrefix: 'url',
        },
        requestService,
        true
      );
      sut.widgetReady.then(() => {
        expect(console.warn).toBeCalledWith(`Desktop rendering is disabled for ${type} widget type`);
        expect(parent.children.length).toBe(0);
        resolve();
      });
    });
  });

  it('should not render in mobile mode when mobileDisabled = true', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';
      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve({})));

      const parent = document.createElement('div');
      document.body.append(parent);
      console.warn = jest.fn();

      const type = WidgetType.Login;
      const sut = new WidgetComponent(
        {
          element: parent,
          type,
          URLPrefix: 'url',
        },
        requestService,
        false,
        true
      );
      sut.widgetReady.then(() => {
        expect(console.warn).toBeCalledWith(`Mobile rendering is disabled for ${type} widget type`);
        expect(parent.children.length).toBe(0);
        resolve();
      });
    });
  });

});

describe('callStatus', () => {
  let requestService: RequestService;
  // eslint-disable-next-line no-console
  console.error = jest.fn();

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

  it('should call onLogin', () => {
    return new Promise(resolve => {
      const parent = document.createElement('div');

      const onLogin = jest.fn();

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          URLPrefix: 'url',
          onLogin,
        },
        requestService,
      );
      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve({ status: true })));

      sut.callStatus('url').then(() => {
        expect(onLogin).toBeCalledWith({ status: true });
        resolve();
      });
    });
  });

  it('should call onRegister', () => {
    return new Promise(resolve => {
      const parent = document.createElement('div');

      const onRegister = jest.fn();

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: parent,
          URLPrefix: 'url',
          onRegister,
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any,
        requestService,
      );

      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve({ status: true })));

      sut.callStatus('url').then(() => {
        expect(onRegister).toBeCalledWith({ status: true });
        resolve();
      });
    });
  });

  it('should call onLink', () => {
    return new Promise(resolve => {
      const parent = document.createElement('div');

      const onLink = jest.fn();

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: parent,
          URLPrefix: 'url',
          type: WidgetType.Link,
          onLink,
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any,
        requestService,
      );

      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve({ status: true })));

      sut.callStatus('url').then(() => {
        expect(onLink).toBeCalledWith({ status: true });
        resolve();
      });
    });
  });

  it('should call setCallStatus', () => {
    return new Promise(resolve => {
      const parent = document.createElement('div');

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );

      sut.setCallStatus = jest.fn();
      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve({ status: false })));

      sut.callStatus('url').then(() => {
        expect(sut.setCallStatus).toBeCalledWith('url');
        resolve();
      });
    });
  });

  it('should remove elements', () => {
    const parent = document.createElement('div');

    const onRegister = jest.fn();

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const sut: any = new WidgetComponent(
      {
        element: parent,
        URLPrefix: 'url',
        onRegister,
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      } as any,
      requestService,
    );

    // eslint-disable-next-line no-shadow
    requestService.post = jest
      .fn()
      .mockReturnValue(new Promise(resolve => resolve({ status: true })));

    sut.destroy();

    expect(sut.elements).toEqual([]);
  });

  it('should update config', () => {
    const parent = document.createElement('div');

    const onRegister = jest.fn();

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const sut: any = new WidgetComponent(
      {
        element: parent,
        URLPrefix: 'url',
        type: WidgetType.Login,
        onRegister,
      },
      requestService,
    );

    sut.data = { url: 'url' };

    // eslint-disable-next-line no-shadow
    requestService.post = jest
      .fn()
      .mockReturnValue(new Promise(resolve => resolve({ status: true })));

    sut.update({ language: Languages.ru });

    expect(sut.config.language).toEqual(Languages.ru);
  });
});


