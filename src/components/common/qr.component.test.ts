import Qr from "./qr.component";

const parent = document.createElement('div');
document.body.appendChild(parent);

describe('ctor -> Render', () => {
  it('should create qr(button) element with options', () => {
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
    const sut = new Qr(options);

    sut.appendToParent(parent);

    const qrCode = document.querySelector(`.own-id-qr-code`);
    expect(qrCode).not.toBeNull();

    const qrCodeImg = qrCode!.querySelector(`img`);
    expect(qrCodeImg).not.toBeNull();

    sut.destroy();
  });

  it('should create qr element empty', () => {
    const options = { href: 'javascript:alert("hacked!!")', title: 'title', subtitle: 'subtitle' };
    const sut = new Qr(options);

    sut.appendToParent(parent);

    const div = document.querySelector(`div`);
    expect(div).not.toBeNull();

    sut.destroy();
  });
});

describe('update', () => {
  it('do nothing if wrapper is undefined', () => {
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
    const sut: any = new Qr(options);
    sut.ref = null;
    sut.generateQRCode = jest.fn();

    sut.update('http://new-test-url');

    expect(sut.generateQRCode).not.toBeCalled();
  });

  it('do nothing if qrCode element is undefined', () => {
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
    const sut: any = new Qr(options);

    sut.generateQRCode = jest.fn();
    sut.ref.querySelector = jest.fn().mockReturnValue(null);

    sut.update('http://new-test-url');

    expect(sut.generateQRCode).not.toBeCalled();
  });

  it('do nothing if not valid url', () => {
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
    const sut: any = new Qr(options);

    sut.generateQRCode = jest.fn();
    sut.ref.querySelector = jest.fn().mockReturnValue(null);

    sut.update('new-test-url');

    expect(sut.generateQRCode).not.toBeCalled();
  });

  it('generate new qr code', () => {
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
    const sut: any = new Qr(options);

    sut.generateQRCode = jest.fn().mockReturnValue('some-qr-code');

    sut.update('http://new-test-url');

    expect(sut.generateQRCode).toBeCalledWith('http://new-test-url');
  });
});

describe('Destroy()', () => {
  it('should remove qr(button) element from document', () => {
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
    const qr = new Qr(options);
    qr.appendToParent(parent);
    qr.destroy();
    expect(document.querySelector(`.own-id-qr-code`)).toBeNull();
  });
});

describe('showSecurityCheck', () => {
  it('should remove qr(button) element from document', () => {
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
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
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
    const qr: any = new Qr(options);
    qr.appendToParent(parent);

    const yesCb = jest.fn();
    const noCb = jest.fn();

    qr.showSecurityCheck(1234, yesCb, noCb);

    qr.showPending();
    qr.showPending(() => {});

    const el: HTMLElement | null = qr.ref.querySelector('[ownid-pending]')

    expect(el!.style.display).toEqual('flex');
  });

  it('should not set display style for pending element', () => {
    const options = { href: 'https://test-url', title: 'title', subtitle: 'subtitle' };
    const qr = new Qr(options);
    qr.appendToParent(parent);

    qr.showPending();

    const el: HTMLElement | null = parent.querySelector('[ownid-pending]')

    expect(el!.style.display).toEqual('none');
  });
});

describe('showDone', () => {
  it('should set display style for done element', () => {
    const options = { href: 'http://test-url', title: 'title', subtitle: 'subtitle' };
    const qr: any = new Qr(options);
    qr.appendToParent(parent);

    qr.showDone();

    const el: HTMLElement | null = qr.ref.querySelector('[ownid-done]')

    expect(el!.style.display).toEqual('flex');
  });
});
