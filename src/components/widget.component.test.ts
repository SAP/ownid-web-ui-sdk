import WidgetComponent from './widget.component';
import RequestService from '../services/request.service';
import {IWidgetPayload, Languages, WidgetType} from '../interfaces/i-widget.interfaces';
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
          url: 'http://url',
          expiration: 10
        });
      }),
    ).mockReturnValue(new Promise(resolve => {
      resolve([
        {
          "status": 1,
          "context": "context1",
          "payload": null
        },
        {
          "status": 1,
          "context": "context2",
          "payload": null
        },
      ]);
    }));
  });

  it('should render and add child in mobile mode', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

      const parent = document.createElement('div');
      window.clearTimeout = jest.fn();

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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

        resolve(true);
      }, 100);
    });
  });

  it('should render and add child in desktop mode', () => {
    return new Promise(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

      const parent = document.createElement('div');
      document.body.appendChild(parent);

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

  it('should render partial in desktop mode', () => {
    return new Promise(resolve => {
      navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

      const toggleElement = document.createElement('input');
      const parent = document.createElement('div');
      document.body.appendChild(parent);
      document.body.appendChild(toggleElement);

      const sut = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Register,
          URLPrefix: 'url',
          partial: true,
          toggleElement,
        },
        requestService,
      );

      sut.widgetReady.then(() => {
        toggleElement.click();

        expect(sut).not.toBeNull();
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].tagName.toLowerCase()).toEqual('div');

        resolve(true);
      });
    });
  });

  it('should render partial in desktop mode with note', () => {
    return new Promise(resolve => {
      navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

      const toggleElement = document.createElement('input');
      toggleElement.id = 'toggleID';
      const parent = document.createElement('div');
      document.body.appendChild(parent);
      document.body.appendChild(toggleElement);

      const sut = new WidgetComponent(
        {
          element: parent,
          type: WidgetType.Register,
          URLPrefix: 'url',
          partial: true,
          toggleElement,
          note: 'this is note'
        },
        requestService,
      );

      sut.widgetReady.then(() => {
        toggleElement.click();

        expect(sut).not.toBeNull();
        expect(sut['note']).not.toBeNull();
        expect(parent.children.length).toBe(1);
        expect(parent.children[0].tagName.toLowerCase()).toEqual('div');

        resolve(true);
      });
    });
  });

  it('should not render', (done) => {
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
      done();
    });
  });

  it('should not render in desktop mode when desktopDisabled = true', () => {
    return new Promise<void>(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';
      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve({})));

      const parent = document.createElement('div');
      document.body.appendChild(parent);
      console.warn = jest.fn();
      const type = WidgetType.Login;
      const sut = new WidgetComponent(
        {
          element: parent,
          type,
          URLPrefix: 'url',
        },
        requestService,
        undefined,
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
    return new Promise<void>(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';
      // eslint-disable-next-line no-shadow
      requestService.post = jest
        .fn()
        .mockReturnValue(new Promise(resolve => resolve({})));

      const parent = document.createElement('div');
      document.body.appendChild(parent);
      console.warn = jest.fn();

      const type = WidgetType.Login;
      const sut = new WidgetComponent(
        {
          element: parent,
          type,
          URLPrefix: 'url',
        },
        requestService,
        undefined,
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

  it('should render and add linked widget if we receive accountUrl', () => {
    navigator.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

    const parent = document.createElement('div');
    window.clearTimeout = jest.fn();

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const sut: any = new WidgetComponent(
      {
        element: parent,
        type: WidgetType.Link,
        URLPrefix: 'url',
      },
      requestService,
    );

    sut.contexts = [{ expiration: 0, url: 'accountUrl' }]
    sut.render();

    expect(sut.linked).not.toBeFalsy();
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
    metadata: "jwt",
    payload: { data: { "a": "b" } }
  };

  const waitingApprovalContextResponse = {
    status: ContextStatus.WaitingForApproval,
    context: "context1",
    payload: { data: { "a": "b" } }
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
    return new Promise<void>(resolve => {
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
    return new Promise<void>(resolve => {
      navigator.userAgent =
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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

  it('should not schedule status check if we have no contexts to check', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );

      sut.contexts = [];
      sut.setCallStatus = jest.fn();
      requestService.post = jest.fn().mockReturnValue(null);

      sut.callStatus().then(() => {
        expect(sut.setCallStatus).not.toBeCalled();
        resolve();
      });
    });
  });

  it('should schedule new status request if no response has been received', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );

      sut.contexts = [{ context: "a", nonce: "b" }];
      sut.setCallStatus = jest.fn();
      requestService.post = jest.fn().mockReturnValue(null);

      sut.callStatus().then(() => {
        expect(sut.setCallStatus).toBeCalled();
        resolve();
      });
    });
  });

  it('should stop regenerating QR code if any context processing started', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );

      sut.contexts = [{ context: "a", nonce: "b" }];
      sut.refreshLinkTimeout = jest.fn();
      window.clearTimeout = jest.fn();
      requestService.post = jest.fn().mockReturnValue(new Promise(resolve => resolve([processingContextResponse])));

      sut.qr = {
        showPending: jest.fn(),
      };

      sut.callStatus().then(() => {
        expect(window.clearTimeout).toBeCalledWith(sut.refreshLinkTimeout);
        resolve();
      });
    });
  });

  it('should show pin widget', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url'
        },
        requestService,
      );
      sut.contexts = [{ context: "a", nonce: "b" }];

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
    return new Promise<void>(resolve => {
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
        sut.finalResponse = {};
        link.click();

        expect(sut.setCallStatus).toBeCalled();
        resolve();
      });
    });
  });

  it('should include context to check status request', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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
    return new Promise<void>(resolve => {
      const onLogin = jest.fn();

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url',
          onLogin,
        },
        requestService,
      );
      sut.contexts = [{ context: "context1", nonce: "b" }];

      sut.callStatus().then(() => {
        expect(onLogin).toBeCalledWith({ "a": "b" }, "jwt");
        resolve();
      });
    });
  });

  it('should call onRegister', () => {
    return new Promise<void>(resolve => {
      const onRegister = jest.fn();
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Register,
          onRegister
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any,
        requestService,
      );
      sut.contexts = [{ context: "context1", nonce: "b" }];

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.qr = {
        showDone: jest.fn(),
      };

      sut.callStatus().then(() => {
        expect(onRegister).toBeCalledWith({ "a": "b" }, "jwt");
        resolve();
      });
    });
  });

  it('should call onRegister with auth only flow', () => {
    return new Promise<void>(resolve => {
      const onRegister = jest.fn();

      const toggleElement = document.createElement('input');
      toggleElement.type = 'checkbox';
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Register,
          partial: true,
          toggleElement,
          onRegister
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any,
        requestService,
      );
      sut.contexts = [{ context: "context1", nonce: "b" }];

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.qr = {
        showDone: jest.fn(),
      };

      sut.callStatus().then(() => {
        expect(onRegister).toBeCalledWith({ "a": "b" }, "jwt");
        resolve();
      });
    });
  });


  it('should call onRegister if type is not set', () => {
    return new Promise<void>(resolve => {
      const onRegister = jest.fn();
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          onRegister
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any,
        requestService,
      );
      sut.contexts = [{ context: "context1", nonce: "b" }];

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.callStatus().then(() => {
        expect(onRegister).toBeCalledWith({ "a": "b" }, "jwt");
        resolve();
      });
    });
  });

  it('should call onLink', () => {
    return new Promise<void>(resolve => {
      const onLink = jest.fn();

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          type: WidgetType.Link,
          onLink,
        },
        requestService,
      );
      sut.contexts = [{ context: "context1", nonce: "b" }];

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.callStatus('url').then(() => {
        expect(onLink).toBeCalledWith({ "a": "b" }, "jwt");
        resolve();
      });
    });
  });

  it('should call onRecover', () => {
    return new Promise<void>(resolve => {
      const onRecover = jest.fn();

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          type: WidgetType.Recover,
          onRecover,
        },
        requestService,
      );
      sut.contexts = [{ context: "context1", nonce: "b" }];

      requestService.post = jest.fn()
        .mockReturnValue(new Promise(resolve => resolve([startedContextResponse, finishedContextResponse])));

      sut.callStatus('url').then(() => {
        expect(onRecover).toBeCalledWith({ "a": "b" }, "jwt");
        resolve();
      });
    });
  });

  it('should call setCallStatus', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          type: WidgetType.Login,
          URLPrefix: 'url',
        },
        requestService,
      );
      sut.contexts = [{ context: "a", nonce: "b" }];

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
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const sut: any = new WidgetComponent(
      {
        element: document.createElement('div'),
        onRegister: jest.fn(),
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      } as any,
      requestService,
    );

    sut.destroy();

    expect(sut.elements).toEqual([]);
  });

  it('should update config', () => {
    return new Promise<void>(resolve => {
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
      return new Promise<void>(resolve => {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const sut: any = new WidgetComponent(
          {
            element: document.createElement('div'),
            URLPrefix: 'url',
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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
      return new Promise<void>(resolve => {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const sut: any = new WidgetComponent(
          {
            element: document.createElement('div'),
            URLPrefix: 'url',
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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

describe('refresh link or qr', () => {
  let requestService: RequestService;

  it('log error to console if init fails during link/qr refresh', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any,
        requestService,
      );
      sut.init = jest.fn().mockReturnValue(Promise.reject('error'));
      console.error = jest.fn();

      sut.refreshLinkOrQR();

      sut.widgetReady.then(() => {
        expect(console.error).toBeCalled();

        resolve();
      });
    });
  });
});

describe('addOwnIDConnectionOnServer', () => {
  const requestService = {} as RequestService;
  // eslint-disable-next-line no-shadow
  requestService.post = jest
    .fn()
    .mockReturnValue(new Promise(resolve => resolve({})));

  it('should return error object if finalResponse is null', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any,
        requestService,
      );

      sut.addOwnIDConnectionOnServer('uid').then((result: IWidgetPayload) => {
        expect(result?.error).toBe(true);
        expect(result?.message).not.toBeNull();
        resolve();
      });
    });
  });

  it('should call server to add connection', () => {
    return new Promise<void>(resolve => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const sut: any = new WidgetComponent(
        {
          element: document.createElement('div'),
          URLPrefix: 'url',
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any,
        requestService,
      );

      const succeededContext = {context: '1context', nonce: '2nonce'} as IContext;
      sut.succeededContext = succeededContext;
      sut.finalResponse = {};

      sut.addOwnIDConnectionOnServer('uid').then((result: IWidgetPayload) => {
        expect(result?.error).toBe(undefined);
        expect(result?.message).toBe(undefined);
        expect(requestService.post).toBeCalledWith('url/connections', {...succeededContext, payload: 'uid'});
        resolve();
      });
    });
  });
});

