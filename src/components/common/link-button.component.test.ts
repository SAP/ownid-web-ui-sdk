import LinkButton from "./link-button.component";

const parent = document.createElement('div');
document.body.append(parent);

describe('ctor -> Render', () => {
  it('should create anchor element with options', () => {
    const options = {id: 'login-btn', href: 'test-href', className: 'test-class-name', textContent: 'My test button'};
    const linkButton = new LinkButton(options);

    linkButton.appendToParent(parent);
    const button = document.querySelector(`#${options.id}`);
    expect(button).not.toBeNull();
    expect(button?.id).toEqual(options.id);
    expect(button?.className).toEqual(options.className);
    expect(button?.hasAttribute('href')).toEqual(true);
    expect(button?.getAttribute('href')).toEqual(options.href);
    expect(button?.querySelector('span')?.textContent).toEqual(options.textContent);
    // check if we have logo in anchor element
    expect(button?.querySelector('svg')).not.toBeNull();
  });

  it('should be able to create two almost identical buttons', ()=>{
    const loginOptions = {id: 'login-btn', href: 'test-href', className: 'test-class-name', textContent: 'My test button'};
    const registerOptions = {id: 'register-btn', href: 'test-href', className: 'test-class-name', textContent: 'My second test button'};
    const loginButton = new LinkButton(loginOptions);
    const registerButton = new LinkButton(registerOptions);

    loginButton.appendToParent(parent);
    registerButton.appendToParent(parent);
    expect(document.querySelector(`#${loginOptions.id}`)).not.toBeNull();
    expect(document.querySelector(`#${registerOptions.id}`)).not.toBeNull();
  });
});

describe('Destroy()', () => {
  it('should remove LinkButton element from document', ()=> {
    const options = {id: 'login-btn-remove', href: 'test-href', textContent: 'My test button'};
    const linkButton = new LinkButton(options);
    linkButton.appendToParent(parent);
    linkButton.destroy();
    expect(document.querySelector(`#${options.id}`)).toBeNull();
  });
});

describe('AttachHandler(', ()=> {
  it('should attach handler LinkButton element and drigger when event pops up', ()=> {
    const options = {id: 'login-btn-event', href: 'test-href', textContent: 'My test button'};
    const linkButton = new LinkButton(options);
    linkButton.appendToParent(parent);
    const spyFn = jest.fn();
    linkButton.attachHandler('click', spyFn);
    (document.querySelector(`#${options.id}`) as HTMLElement)?.click();
    expect(spyFn.mock.calls.length).toEqual(1);
  });
});
