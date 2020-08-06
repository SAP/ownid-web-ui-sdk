import LinkedWidget from './linked.component';

describe('LinkedWidget Component', () => {
  let parent: HTMLElement;
  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  describe('render', () => {
    it('should create div element with options', () => {
      const options = { href: 'http://test-href/' };
      const linkButton = new LinkedWidget(options);

      linkButton.appendToParent(parent);
      const link = parent.querySelector('a');
      expect(link).not.toBeNull();
      expect(link!.href).toEqual(options.href);
    });

    it('should create div element', () => {
      const options = { href: 'javascript:alert("hacked!!")' };
      const linkButton = new LinkedWidget(options);

      linkButton.appendToParent(parent);
      const div = parent.querySelector('div');
      expect(div).not.toBeNull();
    });
  });
});
