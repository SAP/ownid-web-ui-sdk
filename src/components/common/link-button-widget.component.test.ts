import { Languages } from '../../interfaces/i-widget.interfaces';
import LinkButtonWidget, { LinkButtonWidgetOptions } from './link-button-widget.component';

describe('LinkButtonWidget Component', () => {
  let parent: HTMLElement;
  let options: LinkButtonWidgetOptions;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);

    options = {
      language: Languages.en,
    };
  });

  describe('render', () => {
    it('should call events', () => {
      const linkButtonWidget = new LinkButtonWidget(options);
      linkButtonWidget.toggleInfoTooltip = jest.fn();

      const svg = linkButtonWidget.ref.querySelector('svg.ownid-info-icon');
      const clickEvent = new Event('click', {
        bubbles: true,
        cancelable: true,
      });

      svg!.dispatchEvent(clickEvent);

      expect(linkButtonWidget.toggleInfoTooltip).toHaveBeenCalledWith(true);
    });
  });

  describe('toggleInfoTooltip', () => {
    it('should set classes on finish', () => {
      const linkButtonWidget = new LinkButtonWidget(options);

      linkButtonWidget.toggleInfoTooltip(true);

      // @ts-ignore
      expect(linkButtonWidget.infoTooltipEl!.style.display).toEqual('block');
    });

    it('should set classes on finish on relative el', () => {
      const linkButtonWidget = new LinkButtonWidget(options);

      // @ts-ignore
      linkButtonWidget.infoTooltipEl!.getBoundingClientRect = jest.fn().mockReturnValue({
        left: 0,
        width: 20,
        top: -4,
        height: 0,
      });

      linkButtonWidget.toggleInfoTooltip(true);

      // @ts-ignore
      expect(linkButtonWidget.infoTooltipEl!.style.display).toEqual('block');
    });

    it('should set classes on non finish', () => {
      const linkButtonWidget = new LinkButtonWidget(options);

      linkButtonWidget.toggleInfoTooltip(false);

      // @ts-ignore
      expect(linkButtonWidget.infoTooltipEl!.style.display).toEqual('none');
    });
  });
});
