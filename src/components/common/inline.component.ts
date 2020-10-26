import BaseCommonComponent from './base-common.component';
import TranslationService from '../../services/translation.service';

export type InlineWidgetOptions = {
  targetElement: HTMLInputElement;
  lang: string;
  additionalElements?: HTMLElement[];
  offset?: [number, number];
};

export default class InlineWidget extends BaseCommonComponent<InlineWidgetOptions> {
  constructor(private options: InlineWidgetOptions) {
    super(options);
  }

  private showInfo = false;

  private infoTooltipEl: HTMLElement | undefined;

  protected render(options: InlineWidgetOptions): HTMLElement {
    const styles = document.getElementById('ownid-inline-widget-styles');

    if (!styles) {
      this.addOwnIDStyleTag('ownid-inline-widget-styles');
    }

    const element = document.createElement('div');

    const { message, info } = TranslationService.texts[options.lang].inline;

    element.classList.add('ownid-inline-widget');

    element.innerHTML = `${message}&nbsp;<svg class="ownid-info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#354a5f" fill-rule="evenodd" viewBox="-1 0 18 18"><path d="M.333 7A6.67 6.67 0 0 1 7 .333 6.67 6.67 0 0 1 13.667 7 6.67 6.67 0 0 1 7 13.667 6.67 6.67 0 0 1 .333 7zM7 1.667C4.055 1.667 1.667 4.055 1.667 7S4.055 12.333 7 12.333 12.334 9.946 12.334 7 9.946 1.667 7 1.667zm0 3.666a1 1 0 1 0 0-2 1 1 0 1 0 0 2zm0 1.334c.368 0 .667.298.667.667V10c0 .368-.298.667-.667.667A.67.67 0 0 1 6.333 10V7.333c0-.368.298-.667.667-.667z"/></svg>`;

    element.style.height = `${options.targetElement.offsetHeight}px`;

    options.targetElement.addEventListener('input', () => {
      element.style.display = options.targetElement.value !== '' ? 'none' : 'flex';
    });

    const svg = element.querySelector('svg.ownid-info-icon');

    const tooltip = document.querySelector('.ownid-info-tooltip');

    if (tooltip) {
      this.infoTooltipEl = tooltip as HTMLElement;
    } else {
      this.infoTooltipEl = document.createElement('div');
      this.infoTooltipEl.classList.add('ownid-info-tooltip');
      this.infoTooltipEl.innerHTML = `${info}`.replace(/\n/g, '<br />');
      document.body.appendChild(this.infoTooltipEl);
    }

    svg!.addEventListener('click', (e) => {
      this.toggleInfoTooltip(!this.showInfo);
      e.stopPropagation();
    });

    return element;
  }

  public setFinishStatus(finish: boolean): void {
    this.ref.classList.toggle('ownid-inline-widget--finished', finish);
    this.options.targetElement.classList.toggle('ownid-inline-disabled', finish);
    this.options.additionalElements?.forEach((element: HTMLElement) =>
      element.classList.toggle('ownid-disabled', finish),
    );
  }

  public toggleInfoTooltip(show: boolean): void {
    this.showInfo = show;

    if (!show) {
      this.infoTooltipEl!.style.display = 'none';
      return;
    }

    this.infoTooltipEl!.style.display = 'block';
    const tooltipRefEl = this.ref.querySelector('svg.ownid-info-icon')!;
    const { top, left, width } = tooltipRefEl.getBoundingClientRect();
    const rect = this.infoTooltipEl!.getBoundingClientRect();
    this.infoTooltipEl!.style.top = `${top + window.pageYOffset - 4 - rect.height}px`;
    this.infoTooltipEl!.style.left = `${left - rect.width + width + window.pageXOffset}px`;
  }

  private addOwnIDStyleTag(id: string): void {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `.ownid-inline-widget{color:#0070F2;cursor:pointer;position:absolute;display:flex;align-items:center;font-size:14px;padding:0 10px}
.ownid-inline-widget .ownid-info-icon{fill:#0070F2}
.ownid-inline-widget--finished {color:#000;margin-left:-25px;pointer-events:none;opacity:1}
.ownid-inline-widget--finished .ownid-info-icon{fill:#000;pointer-events:initial;opacity:1;cursor:pointer;}
.ownid-inline-widget--finished:before{content:'';opacity:1;width:25px;height:16px;display:block;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOC43MDcgNy4yOTNhMSAxIDAgMCAxIDAgMS40MTRsLTggOGExIDEgMCAwIDEtMS40MTQgMGwtMy0zYTEgMSAwIDAgMSAxLjQxNC0xLjQxNEwxMCAxNC41ODZsNy4yOTMtNy4yOTNhMSAxIDAgMCAxIDEuNDE0IDB6IiBmaWxsPSIjMzZhNDFkIi8+PC9zdmc+) repeat center center}
.ownid-inline-disabled {opacity:0.3;pointer-events:none}
.ownid-note-undo{color:#0070F2;cursor:pointer}
.ownid-inline-required{border-color:#D20A0A}
.ownid-inline-warn{color:#D20A0A}
.ownid-info-tooltip{width:280px;display:none;position:absolute;background:#FFF;border-radius:6px;border:1px solid #D5DADD;box-shadow:0px 0px 2px rgba(131,150,168,0.16),0px 4px 8px rgba(131,150,168,0.16);box-sizing: border-box;font-style: normal;font-weight: normal;font-size: 12px;line-height: 18px;padding:12px;}
`;
    document.head.appendChild(style);
  }

  public calculatePosition(element: HTMLElement, options: InlineWidgetOptions): void {
    if (this.ref.style.display === 'none') {
      return;
    }

    const [offsetX, offsetY] = options.offset || [0, 0];

    const { right, top, height: targetHeight } = options.targetElement.getBoundingClientRect();
    const { width, height } = element.getBoundingClientRect();

    // eslint-disable-next-line no-param-reassign
    element.style.top = `${top + offsetX + targetHeight / 2 - height / 2 + window.pageYOffset}px`;
    // eslint-disable-next-line no-param-reassign
    element.style.left = `${right + offsetY - width + window.pageXOffset + 10}px`; // 10 px padding

    if (offsetY < 0) {
      // eslint-disable-next-line no-param-reassign
      element.style.paddingRight = `${-offsetY}px`;
    }
  }

  public requirePassword(): void {
    this.ref.style.display = 'none';

    this.options.targetElement.classList.remove('ownid-inline-disabled');
    this.options.targetElement.classList.add('ownid-inline-required');
    this.options.targetElement.focus();

    this.options.targetElement.addEventListener('input', () =>
      this.options.targetElement.classList.toggle('ownid-inline-required', !this.options.targetElement.value),
    );

    const warn = document.createElement('div');
    warn.classList.add('ownid-inline-warn');
    warn.textContent = TranslationService.texts[this.options.lang].inline.passwordWarn;

    this.options.targetElement.parentNode!.insertBefore(warn, this.options.targetElement.nextSibling);
  }
}
