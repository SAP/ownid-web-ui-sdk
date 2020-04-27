import Qr from "./qr.component";

const parent = document.createElement('div');
document.body.append(parent);

describe('ctor -> Render', () => {
  it('should create qr(button) element with options', () => {
    const options = {href: 'test-url', title: 'title', subtitle: 'subtitle'};
    const sut = new Qr(options);

    sut.appendToParent(parent);

    const qrCode = document.querySelector(`.own-id-qr-code`);
    expect(qrCode).not.toBeNull();

    const qrCodeImg = qrCode!.querySelector(`img`);
    expect(qrCodeImg).not.toBeNull();

    sut.destroy();
  });
});

describe('Destroy()', () => {
  it('should remove qr(button) element from document', ()=> {
    const options = {href: 'test-url', title: 'title', subtitle: 'subtitle'};
    const qr = new Qr(options);
    qr.appendToParent(parent);
    qr.destroy();
    expect(document.querySelector(`.own-id-qr-code`)).toBeNull();
  });
});
