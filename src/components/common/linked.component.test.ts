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

    it('should create div element with options', () => {
      const linkedWidget = new LinkedWidget({});

      linkedWidget.toggleInfoTooltip = jest.fn();

      const svg = linkedWidget.ref.querySelector('svg.ownid-info-icon');
      const clickEvent = new Event('click', {
        bubbles: true,
        cancelable: true,
      });

      svg!.dispatchEvent(clickEvent);

      expect(linkedWidget.toggleInfoTooltip).toHaveBeenCalledWith(true);
    });
  });

  describe('toggleInfoTooltip', () => {
    it('should set classes on finish', () => {
      const inline = new LinkedWidget({});

      inline.toggleInfoTooltip(true);

      // @ts-ignore
      expect(inline.infoTooltipEl!.style.display).toEqual('block');
    });

    it('should set classes on finish on relative el', () => {
      const inline = new LinkedWidget({});

      // @ts-ignore
      inline.infoTooltipEl!.getBoundingClientRect = jest.fn().mockReturnValue({
        left: 0,
        width: 20,
        top: -4,
        height: 0,
      });

      inline.toggleInfoTooltip(true);

      // @ts-ignore
      expect(inline.infoTooltipEl!.style.display).toEqual('block');
    });

    it('should set classes on non finish', () => {
      const inline = new LinkedWidget({});

      inline.toggleInfoTooltip(false);

      // @ts-ignore
      expect(inline.infoTooltipEl!.style.display).toEqual('none');
    });
  });

});
