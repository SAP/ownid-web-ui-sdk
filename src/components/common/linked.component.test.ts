import LinkedWidget from './linked.component';

describe('LinkedWidget Component', () => {
  let parent: HTMLElement;
  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  describe('render', () => {
    it('should create div element with options', () => {
      const linkedWidget = new LinkedWidget({});

      linkedWidget.appendToParent(parent);
      const svg = parent.querySelector('svg');
      expect(svg).not.toBeNull();
    });
  });
});
