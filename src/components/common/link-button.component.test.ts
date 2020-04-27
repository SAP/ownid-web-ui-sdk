import LinkButton from "./link-button.component";

const parent = document.createElement('div');
document.body.append(parent);

describe('ctor -> Render', () => {
  it('should create anchor element with options', () => {
    const options = {href: 'test-href', title: 'My test button'};
    const linkButton = new LinkButton(options);

    linkButton.appendToParent(parent);
    const button = document.querySelector(`a[href="${options.href}"]`);
    expect(button).not.toBeNull();
    expect(button!.hasAttribute('href')).toEqual(true);
    expect(button!.getAttribute('href')).toEqual(options.href);
    expect(button!.querySelector('span')?.textContent).toEqual(options.title);
    // check if we have logo in anchor element
    expect(button!.querySelector('svg')).not.toBeNull();
  });
});

describe('Destroy()', () => {
  it('should remove LinkButton element from document', ()=> {
    const options = { href: 'test-href2', title: 'My test button'};
    const linkButton = new LinkButton(options);
    linkButton.appendToParent(parent);
    linkButton.destroy();
    expect(document.querySelector(`a[href="${options.href}"]`)).toBeNull();
  });
});

describe('AttachHandler()', ()=> {
  it('should attach handler LinkButton element and drigger when event pops up', ()=> {
    const options = {href: 'test-href2', title: 'My test button'};
    const linkButton = new LinkButton(options);
    linkButton.appendToParent(parent);
    const spyFn = jest.fn();
    linkButton.attachHandler('click', spyFn);
    (document.querySelector(`a[href="${options.href}"]`) as HTMLElement)?.click();
    expect(spyFn.mock.calls.length).toEqual(1);
  });
});
