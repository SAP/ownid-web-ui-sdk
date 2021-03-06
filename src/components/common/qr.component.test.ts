import Qr from "./qr.component";
import { Languages, WidgetType } from '../../interfaces/i-widget.interfaces';

const parent = document.createElement('div');
document.body.appendChild(parent);

describe('ctor -> Render', () => {
  it('should create qr(button) element with options', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const sut = new Qr(options);

    sut.appendToParent(parent);

    const qrCode = document.querySelector(`.ownid-qr-code`);
    expect(qrCode).not.toBeNull();

    const qrCodeImg = qrCode!.querySelector(`img`);
    expect(qrCodeImg).not.toBeNull();

    sut.destroy();
  });

  it('should create qr element empty', () => {
    const options = {
      href: 'javascript:alert("hacked!!")',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const sut = new Qr(options);

    sut.appendToParent(parent);

    const div = document.querySelector(`div`);
    expect(div).not.toBeNull();

    sut.destroy();
  });

  it('should create qr element with magicLink', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
      config: {
        magicLink: {
          sendLinkCallback: jest.fn().mockResolvedValue(true),
        }
      },
    };
    const sut = new Qr(options);

    // @ts-ignore
    sut.showMagicLinkPane = jest.fn();

    const mlEl = sut.ref.querySelector('.ownid-magic-link')
    const clickEvent = new Event('click', {
      bubbles: true,
      cancelable: true,
    });

    mlEl!.dispatchEvent(clickEvent);
    // @ts-ignore
    expect(sut.showMagicLinkPane).toBeCalled();

    sut.destroy();
  });
});

describe('update', () => {
  it('do nothing if wrapper is undefined', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const sut: any = new Qr(options);
    sut.ref = null;
    sut.generateQRCode = jest.fn();

    sut.update('http://new-test-url');

    expect(sut.generateQRCode).not.toBeCalled();
  });

  it('do nothing if qrCode element is undefined', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const sut: any = new Qr(options);

    sut.generateQRCode = jest.fn();
    sut.ref.querySelector = jest.fn().mockReturnValue(null);

    sut.update('http://new-test-url');

    expect(sut.generateQRCode).not.toBeCalled();
  });

  it('do nothing if not valid url', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const sut: any = new Qr(options);

    sut.generateQRCode = jest.fn();
    sut.ref.querySelector = jest.fn().mockReturnValue(null);

    sut.update('new-test-url');

    expect(sut.generateQRCode).not.toBeCalled();
  });

  it('generate new qr code', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const sut: any = new Qr(options);

    sut.generateQRCode = jest.fn().mockReturnValue('some-qr-code');

    sut.update('http://new-test-url');

    expect(sut.generateQRCode).toBeCalledWith('http://new-test-url');
  });
});

describe('Destroy()', () => {
  it('should remove qr(button) element from document', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const qr = new Qr(options);
    qr.appendToParent(parent);
    qr.destroy();
    expect(document.querySelector(`.ownid-qr-code`)).toBeNull();
  });
});

describe('showSecurityCheck', () => {
  it('should remove qr(button) element from document', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const qr = new Qr(options);
    qr.appendToParent(parent);

    const yesCb = jest.fn();
    const noCb = jest.fn();

    qr.showSecurityCheck(1234, yesCb, noCb);

    expect(parent.querySelector(`[ownid-btn="yes"]`)).toBeTruthy();

    qr.showSecurityCheck(1234, yesCb, noCb);
    const yesBtn: HTMLElement | null = parent.querySelector(`[ownid-btn="yes"]`);
    yesBtn!.click()
    const noBtn: HTMLElement | null = parent.querySelector(`[ownid-btn="no"]`);
    noBtn!.click()

    expect(yesCb).toBeCalled();
    expect(noCb).toBeCalled();
  });
});

describe('showPending', () => {
  it('should set display style for pending element', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const qr: any = new Qr(options);
    qr.appendToParent(parent);

    const yesCb = jest.fn();
    const noCb = jest.fn();

    qr.showSecurityCheck(1234, yesCb, noCb);

    qr.showPending();
    qr.showPending(() => {
    });

    const el: HTMLElement | null = qr.ref.querySelector('[ownid-pending]')

    const cancelBtn = el!.querySelector('[ownid-btn="cancel"]') as HTMLElement;
    cancelBtn.click();

    expect(el!.style.display).toEqual('flex');
  });

  it('should not set flex display style for pending element', () => {
    const options = {
      href: 'https://test-url',
      title: '',
      subtitle: '',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const qr = new Qr(options);
    qr.appendToParent(parent);

    qr.showPending();

    const el: HTMLElement | null = parent.querySelector('[ownid-pending]')

    expect(el!.style.display).not.toEqual('flex');
  });
});

describe('showDone', () => {
  it('should set display style for done element', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const qr = new Qr(options);
    qr.appendToParent(parent);

    qr.showDone();

    const el: HTMLElement | null = qr.ref.querySelector('[ownid-done]')

    expect(el!.style.display).toEqual('flex');
  });

  it('should do nothing if there no done pane', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
    };
    const qr = new Qr(options);
    qr.appendToParent(parent);

    qr.showSecurityCheck(1234, () => {
    }, () => {
    });

    qr.showDone();

    const el: HTMLElement | null = qr.ref.querySelector('[ownid-done]')

    expect(el).toEqual(null);
  });
});

describe('showMagicLinkPane', () => {
  it('should call buttons', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
      config: {
        magicLink: {
          sendLinkCallback: jest.fn().mockResolvedValue(true),
        }
      },
    };
    const qr = new Qr(options);
    qr.appendToParent(parent);

    // @ts-ignore
    qr.showMagicLinkPane();

    const clickEvent = new Event('click', {
      bubbles: true,
      cancelable: true,
    });

    // @ts-ignore
    qr.showMagicLinkPane = jest.fn();

    const mlButton = qr.ref.querySelector('.ownid-magic-link--button');
    const mlBackButton = qr.ref.querySelector('.ownid-magic-link--back');


    mlButton!.dispatchEvent(clickEvent);
    mlBackButton!.dispatchEvent(clickEvent);

    const mlink = qr.ref.querySelector('.ownid-magic-link');
    mlink!.dispatchEvent(clickEvent);

    // @ts-ignore
    expect(qr.showMagicLinkPane).toBeCalled();
    expect(options.config.magicLink.sendLinkCallback).toBeCalled();
  });

  it('should call buttons (show error)', (done) => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
      config: {
        magicLink: {
          sendLinkCallback: jest.fn().mockResolvedValue(false),
        }
      },
    };
    const qr = new Qr(options);
    qr.appendToParent(parent);

    // @ts-ignore
    qr.showMagicLinkPane();

    const clickEvent = new Event('click', {
      bubbles: true,
      cancelable: true,
    });

    const mlButton = qr.ref.querySelector('.ownid-magic-link--button');

    mlButton!.dispatchEvent(clickEvent);

    setTimeout(() => {
      // @ts-ignore
      expect(qr.ref.querySelector('.ownid-magic-link--error')!.style.display).toEqual('block');
      done();
    });
  });

  it('should not call buttons', () => {
    const options = {
      href: 'http://test-url',
      title: 'title',
      subtitle: 'subtitle',
      language: Languages.en,
      type: WidgetType.Register,
      tooltip: false,
      tooltipTargetEl: null,
      config: {
        magicLink: {
          sendLinkCallback: jest.fn().mockResolvedValue(true),
        }
      },
    };
    const qr = new Qr(options);
    qr.appendToParent(parent);

    qr.ref.querySelector = jest.fn();

    // @ts-ignore
    qr.showMagicLinkPane();

    expect(options.config.magicLink.sendLinkCallback).not.toBeCalled();
  });
});
