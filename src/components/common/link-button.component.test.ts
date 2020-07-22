import LinkButton from './link-button.component';

describe('LinkButton Component', () => {
  let parent: HTMLElement;
  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  describe('ctor -> Render', () => {
    it('should create anchor element with options', () => {
      const options = { href: 'test-href', title: 'My test button' };
      const linkButton = new LinkButton(options);

      linkButton.appendToParent(parent);
      const button = parent.querySelector('button');
      expect(button).not.toBeNull();
      expect(button!.querySelector('span')?.textContent).toEqual(options.title);
      // check if we have logo in anchor element
      expect(button!.querySelector('svg')).not.toBeNull();
    });
  });

  describe('Destroy()', () => {
    it('should remove LinkButton element from document', () => {
      const options = { href: 'test-href2', title: 'My test button' };
      const linkButton = new LinkButton(options);
      linkButton.appendToParent(parent);
      linkButton.destroy();
      expect(parent.querySelector('button')).toBeNull();
    });
  });

  describe('AttachHandler()', () => {
    it('should attach handler LinkButton element and trigger when event pops up', () => {
      const options = { href: 'test-href2', title: 'My test button' };
      const linkButton = new LinkButton(options);
      linkButton.appendToParent(parent);
      const spyFn = jest.fn();
      linkButton.attachHandler('click', spyFn);
      (parent.querySelector('button') as HTMLElement)?.click();
      expect(spyFn.mock.calls.length).toEqual(1);
    });
  });
});
