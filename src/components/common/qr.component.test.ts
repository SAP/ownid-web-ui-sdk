import Qr from "./qr.component";

const parent = document.createElement('div');
document.body.append(parent);

describe('ctor -> Render', () => {
  it('should create qr(button) element with options', () => {
    const options = {id: 'btn', className: 'test-class-name'};
    const buttonComponent = new Qr(options);

    buttonComponent.appendToParent(parent);
    const button = document.querySelector(`#${options.id}`);
    expect(button).not.toBeNull();
    expect(button?.id).toEqual(options.id);
    expect(button?.className).toEqual(options.className);
  });
});

describe('Destroy()', () => {
  it('should remove qr(button) element from document', ()=> {
    const options = {id: 'btn-remove'};
    const linkButton = new Qr(options);
    linkButton.appendToParent(parent);
    linkButton.destroy();
    expect(document.querySelector(`#${options.id}`)).toBeNull();
  });
});
