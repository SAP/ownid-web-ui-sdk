import InlineWidget from './inline.component';

describe('InlineWidget Component', () => {
  let parent: HTMLElement;
  let targetElement: HTMLInputElement;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);

    targetElement = document.createElement('input');
    targetElement.type = 'text';
    parent.append(targetElement);
  });

  it('should add warning message if require a password', () => {
    return new Promise((resolve) => {
      const options = {
        targetElement,
        lang: 'en',
      };
      const inline = new InlineWidget(options);

      inline.noAccount();

      expect(parent.childElementCount).toBe(2);

      resolve();
    });
  });

  it('should add warning message if no account found', () => {
    return new Promise((resolve) => {
      const options = {
        targetElement,
        lang: 'en',
      };
      const inline = new InlineWidget(options);

      inline.noAccount();

      expect(parent.childElementCount).toBe(2);

      resolve();
    });
  });
});
