import WidgetComponent from './widget.component';
import RequestService from '../services/request.service';
import { Languages, WidgetType } from '../interfaces/i-widget.interfaces';
import { IContext } from '../interfaces/i-context.interfaces';
import { ContextStatus } from './status-response';

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
    requestService.post = jest.fn().mockReturnValueOnce(
      new Promise(resolve => {
        resolve({
          context: '123',
          nonce: '234',
          url: 'url',
          expiration: 10
        });
      }),
    ).mockReturnValue(new Promise(resolve => {
      resolve([{
        "status": 1,
        "context": "context1",
        "payload": null
      },
        {
          "status": 1,
          "context": "context2",
          "payload": null
        }]);
    }));
  });

  it('should render and add child in mobile mode', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

      const parent = document.createElement('div');
      window.clearTimeout = jest.fn();

      const sut: any = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );

      sut.attachPostMessagesHandler();

      window.postMessage('ownid postMessages enabled', '*');
      window.postMessage('ownid success', '*');

      setTimeout(() => {
        expect(sut).not.toBeNull();
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].tagName.toLowerCase()).toEqual('button');
        expect(window.clearTimeout).toBeCalled();

        resolve(true);
      }, 1000);
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
      navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

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
      sut.widgetReady.finally(() => {
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
        expect(console.warn).toBeCalledWith(`Desktop rendering is disabled for ${ type } widget type`);
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
        expect(console.warn).toBeCalledWith(`Mobile rendering is disabled for ${ type } widget type`);
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

  const contextResponse = {
    context: '123',
    nonce: '234',
    url: 'url',
    expiration: 10
  };
  const startedContextResponse = {
    status: ContextStatus.Initiated,
    context: "context1",
    payload: null
  };
  const processingContextResponse = {
    status: ContextStatus.Started,
    context: "context1",
    payload: null
  };
  const finishedContextResponse = {
    status: ContextStatus.Finished,
    context: "context1",
    payload: { "Data": { "a": "b" } }
  };

  const waitingApprovalContextResponse = {
    status: ContextStatus.WaitingForApproval,
    context: "context1",
    payload: { "Data": { "a": "b" } }
  };

  beforeEach(() => {
    navigator.userAgent = '';

    requestService = {} as RequestService;
    requestService.post = jest.fn().mockReturnValueOnce(
      new Promise(resolve => {
        resolve(contextResponse);
      }),
    ).mockReturnValue(new Promise(resolve => {
      resolve([startedContextResponse]);
    }));
  });

  it('should check status automatically for desktop version', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );

      sut.setCallStatus = jest.fn();

      sut.widgetReady.then(() => {
        expect(sut.setCallStatus).toBeCalled();
        resolve();
      });
    });
  });

  it('should not check status automatically for mobile version', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );

      sut.setCallStatus = jest.fn();

      sut.widgetReady.then(() => {
        expect(sut.setCallStatus).not.toBeCalled();
        resolve();
      });
    });
  });

  it('should schedule new status request if no response has been received', () => {
    return new Promise(resolve => {
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );

      sut.setCallStatus = jest.fn();
      requestService.post = jest.fn().mockReturnValue(null);

      sut.callStatus().then(() => {
        expect(sut.setCallStatus).toBeCalled();
        resolve();
      });
    });
  });

  it('should stop regenerating QR code if any context processing started', () => {
    return new Promise(resolve => {
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );

      sut.refreshLinkTimeout = jest.fn();
      window.clearTimeout = jest.fn();
      requestService.post = jest.fn().mockReturnValue(new Promise(resolve => resolve([processingContextResponse])));

      sut.callStatus().then(() => {
        expect(window.clearTimeout).toBeCalledWith(sut.refreshLinkTimeout);
        resolve();
      });
    });
  });

  it('should show pin widget', () => {
    return new Promise(resolve => {
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );

      sut.qr = {
        showPending: jest.fn(),
        showSecurityCheck: jest.fn().mockImplementation((_, yesCBb, noCb) => {
          yesCBb();
          noCb();
        }),
      };

      requestService.post = jest.fn().mockReturnValue(new Promise(resolve => resolve([waitingApprovalContextResponse])));

      sut.callStatus().then(() => {
        expect(sut.qr.showSecurityCheck).toBeCalled();
        resolve();
      });
    });
  });

  it('should start status check after clicking on button', () => {
    return new Promise(resolve => {
      navigator.userAgent = 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

      const parent = document.createElement('div');

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );

      sut.setCallStatus = jest.fn();

      sut.widgetReady.then(() => {
        const link = parent.children[0] as HTMLAnchorElement;
        expect(link).not.toBeNull();

        link.click();

        expect(sut.setCallStatus).toBeCalled();
        resolve();
      });
    });
  });

  it('should include context to check status request', () => {
    return new Promise(resolve => {
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );
      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse])));

      sut.widgetReady.then(() => {
        sut.callStatus().then(() => {
          expect(requestService.post).toBeCalledWith('url/status', [{
            context: contextResponse.context,
            nonce: contextResponse.nonce
          }] as Array<IContext>);
          resolve();
        });
      });
    });
  });

  it('should call onLogin', () => {
    return new Promise(resolve => {
      const onLogin = jest.fn();

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url',
          onLogin,
        },
        requestService,
      );

      sut.callStatus().then(() => {
        expect(onLogin).toBeCalledWith({ "a": "b" });
        resolve();
      });
    });
  });

  it('should call onRegister', () => {
    return new Promise(resolve => {
      const onRegister = jest.fn();

      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Register,
          onRegister
        } as any,
        requestService,
      );

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.callStatus().then(() => {
        expect(onRegister).toBeCalledWith({ "a": "b" });
        resolve();
      });
    });
  });

  it('should call onRegister if type is not set', () => {
    return new Promise(resolve => {
      const onRegister = jest.fn();

      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          onRegister
        } as any,
        requestService,
      );

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.callStatus().then(() => {
        expect(onRegister).toBeCalledWith({ "a": "b" });
        resolve();
      });
    });
  });

  it('should call onLink', () => {
    return new Promise(resolve => {
      const onLink = jest.fn();

      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          type: WidgetType.Link,
          onLink,
        },
        requestService,
      );

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.callStatus('url').then(() => {
        expect(onLink).toBeCalledWith({ "a": "b" });
        resolve();
      });
    });
  });

  it('should call onRecover', () => {
    return new Promise(resolve => {
      const onRecover = jest.fn();

      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          type: WidgetType.Recover,
          onRecover,
        },
        requestService,
      );

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.callStatus('url').then(() => {
        expect(onRecover).toBeCalledWith({ "a": "b" });
        resolve();
      });
    });
  });

  it('should call setCallStatus', () => {
    return new Promise(resolve => {
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );

      sut.setCallStatus = jest.fn();
      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse])));

      sut.callStatus().then(() => {
        expect(sut.setCallStatus).toBeCalledTimes(1);
        resolve();
      });
    });
  });

  it('should remove elements', () => {
    const sut: any = new WidgetComponent(
      {
        element: document.createElement('div'),
        onRegister: jest.fn(),
      } as any,
      requestService,
    );

    sut.destroy();

    expect(sut.elements).toEqual([]);
  });

  it('should update config', () => {
    return new Promise(resolve => {
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
      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve(contextResponse)));

      sut.widgetReady.then(() => {
        sut.update({ language: Languages.ru });

        expect(sut.config.language).toEqual(Languages.ru);

        resolve();
      });
    });
  });

  describe('reCreateWidget', () => {
    it('should call destroy and render', () => {
      return new Promise(resolve => {
        const sut: any = new WidgetComponent(
          {
            element: document.createElement('div'),
            URLPrefix: 'url',
          } as any,
          requestService,
        );

        sut.destroy = jest.fn();
        sut.render = jest.fn();
        sut.setCallStatus = jest.fn();
        sut.reCreateWidget();

        sut.widgetReady.then(() => {
          expect(sut.destroy).toBeCalled();
          expect(sut.render).toBeCalled();
          expect(sut.setCallStatus).toBeCalled();
          resolve();
        });
      });
    });

    it('should call destroy and render and not setCallStatus on desktop', () => {
      return new Promise(resolve => {
        const sut: any = new WidgetComponent(
          {
            element: document.createElement('div'),
            URLPrefix: 'url',
          } as any,
          requestService,
        );

        sut.destroy = jest.fn();
        sut.render = jest.fn();
        sut.setCallStatus = jest.fn();
        sut.isMobile = jest.fn().mockReturnValue(true);

        sut.reCreateWidget();

        sut.widgetReady.then(() => {
          expect(sut.destroy).toBeCalled();
          expect(sut.render).toBeCalled();
          expect(sut.setCallStatus).not.toBeCalled();
          resolve();
        });
      });
    });
  });

});


