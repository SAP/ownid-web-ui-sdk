import Qr from "./qr.component";

const parent = document.createElement('div');
document.body.append(parent);

describe('ctor -> Render', () => {
  it('should create qr(button) element with options', () => {
    const options = { href: 'test-url', title: 'title', subtitle: 'subtitle' };
    const sut = new Qr(options);

    sut.appendToParent(parent);

    const qrCode = document.querySelector(`.own-id-qr-code`);
    expect(qrCode).not.toBeNull();

    const qrCodeImg = qrCode!.querySelector(`img`);
    expect(qrCodeImg).not.toBeNull();

    sut.destroy();
  });
});

describe('update', () => {
  it('do nothing if wrapper is undefined', () => {
    const options = { href: 'test-url', title: 'title', subtitle: 'subtitle' };
    const sut: any = new Qr(options);
    sut.wrapper = null;
    sut.generateQRCode = jest.fn();

    sut.update('new-test-url');

    expect(sut.generateQRCode).not.toBeCalled();
  });

  it('do nothing if qrCode element is undefined', () => {
    const options = { href: 'test-url', title: 'title', subtitle: 'subtitle' };
    const sut: any = new Qr(options);

    sut.generateQRCode = jest.fn();
    sut.wrapper.querySelector = jest.fn().mockReturnValue(null);

    sut.update('new-test-url');

    expect(sut.generateQRCode).not.toBeCalled();
  });

  it('generate new qr code', () => {
    const options = { href: 'test-url', title: 'title', subtitle: 'subtitle' };
    const sut: any = new Qr(options);

    sut.generateQRCode = jest.fn().mockReturnValue('some-qr-code');

    sut.update('new-test-url');

    expect(sut.generateQRCode).toBeCalledWith('new-test-url');
  });
});

describe('Destroy()', () => {
  it('should remove qr(button) element from document', () => {
    const options = { href: 'test-url', title: 'title', subtitle: 'subtitle' };
    const qr = new Qr(options);
    qr.appendToParent(parent);
    qr.destroy();
    expect(document.querySelector(`.own-id-qr-code`)).toBeNull();
  });
});
