import InlineWidget, { InlineWidgetOptions } from './inline.component';
import { Languages } from '../../interfaces/i-widget.interfaces';

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

  describe('render', () => {
    it('should call events', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      inline.toggleInfoTooltip = jest.fn();

      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      // @ts-ignore
      event.inputType = 'a';

      targetElement.dispatchEvent(event);

      const svg = inline.ref.querySelector('svg.ownid-info-icon');

      const clickEvent = new Event('click', {
        bubbles: true,
        cancelable: true,
      });

      svg?.dispatchEvent(clickEvent);

      expect(inline.toggleInfoTooltip).toHaveBeenCalledWith(true);
      expect(inline.ref.style.display).toEqual('flex');
    });

    it('should toggle elements style', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      // @ts-ignore
      event.inputType = 'a';

      targetElement.value = '123';

      inline.ref.style.display = 'flex';

      targetElement.dispatchEvent(event);


      expect(inline.ref.style.display).toEqual('none');
    });

    it('should do nothing', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      inline.ref.style.display = 'flex';

      targetElement.dispatchEvent(event);

      expect(inline.ref.style.display).toEqual('flex');
    });
  });

  describe('setFinishStatus', () => {
    it('should set classes on finish', () => {
      const additionalElement = document.createElement('input');
      const options = {
        targetElement,
        additionalElements: [additionalElement],
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      inline.setFinishStatus(true)

      expect(inline.ref.classList.contains('ownid-inline-widget--finished')).toEqual(true);
      expect(additionalElement.classList.contains('ownid-disabled')).toEqual(true);
    });

    it('should remove classes on non finish', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      inline.setFinishStatus(false);

      expect(inline.ref.classList.contains('ownid-inline-widget--finished')).toEqual(false);
    });
  });

  describe('toggleInfoTooltip', () => {
    it('should set classes on finish', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      inline.toggleInfoTooltip(true);

      // @ts-ignore
      expect(inline.infoTooltipEl!.style.display).toEqual('block');
    });

    it('should set classes on finish on relative el', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

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
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      inline.toggleInfoTooltip(false);

      // @ts-ignore
      expect(inline.infoTooltipEl!.style.display).toEqual('none');
    });
  });

  describe('calculatePosition', () => {
    it('should call inline.toggleInfoTooltip', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);
      inline.toggleInfoTooltip = jest.fn();
      inline.ref.style.display = 'block';

      // @ts-ignore
      inline.showInfo = true;

      inline.calculatePosition(inline.ref, options);

      expect(inline.toggleInfoTooltip).toHaveBeenCalled();
    });

    it('should calculate positions if relative position', () => {
      const options: InlineWidgetOptions = {
        offset: [-1, 0],
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);
      inline.toggleInfoTooltip = jest.fn();
      inline.ref.style.display = 'block';

      inline.ref.getBoundingClientRect = jest.fn().mockReturnValue({
        top: -1,
        right: -1,
      });

      // @ts-ignore
      inline.showInfo = false;

      inline.calculatePosition(inline.ref, options);

      expect(inline.toggleInfoTooltip).not.toHaveBeenCalled();
    });

    it('should do nothing if is not visible', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      inline.toggleInfoTooltip = jest.fn();
      inline.ref.style.display = 'none';

      inline.calculatePosition(inline.ref, options);

      expect(inline.toggleInfoTooltip).not.toHaveBeenCalled();
    });
  });

  describe('requirePassword', () => {
    it('should call inline.displayMessage', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);
      // @ts-ignore
      inline.displayMessage = jest.fn();

      inline.requirePassword();

      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      targetElement.dispatchEvent(event);

      // @ts-ignore
      expect(inline.displayMessage).toHaveBeenCalledWith('info', 'Enter your password to confirm your account.');
      expect(targetElement.classList.contains('ownid-inline-required')).toEqual(true);
    });
  });

  describe('noAccount', () => {
    it('should add warning message if require a password', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      inline.noAccount();

      expect(parent.childElementCount).toBe(2);
    });

    it('should add warning message if no account found', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      inline.noAccount();

      expect(parent.childElementCount).toBe(2);
    });
  });

  describe('displayMessage', () => {
    it('should add warning message wring type', () => {
      const options = {
        targetElement,
        language: Languages.en,
      };
      const inline = new InlineWidget(options);

      // @ts-ignore
      inline.displayMessage('', 'test');

      expect(parent.childElementCount).toBe(2);
    });

  });
});
