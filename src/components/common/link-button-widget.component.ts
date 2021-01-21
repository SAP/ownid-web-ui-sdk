import BaseCommonComponent from './base-common.component';
import { Languages } from '../../interfaces/i-widget.interfaces';
import TranslationService from '../../services/translation.service';

declare type LinkButtonWidgetOptions = {
  language?: Languages;
};

export default class LinkButtonWidget extends BaseCommonComponent<LinkButtonWidgetOptions> {
  private showInfo = false;

  private infoTooltipEl: HTMLDivElement | undefined;

  constructor(options: LinkButtonWidgetOptions) {
    super(options);
  }

  protected render(options: LinkButtonWidgetOptions): HTMLElement {
    const styles = document.getElementById('ownid-link-button-styles');

    if (!styles) {
      this.addOwnIDStyleTag('ownid-link-button-styles');
    }

    const element = document.createElement('div');
    element.classList.add('ownid-link-button-widget');

    element.innerHTML = `<button class="ownid-flat-button">${TranslationService.instant(
      options.language,
      'linkButton.button',
    )}</button>&nbsp;<svg class="ownid-info-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#354a5f" fill-rule="evenodd" viewBox="0 0 14 14"><path d="M.333 7A6.67 6.67 0 0 1 7 .333 6.67 6.67 0 0 1 13.667 7 6.67 6.67 0 0 1 7 13.667 6.67 6.67 0 0 1 .333 7zM7 1.667C4.055 1.667 1.667 4.055 1.667 7S4.055 12.333 7 12.333 12.334 9.946 12.334 7 9.946 1.667 7 1.667zm0 3.666a1 1 0 1 0 0-2 1 1 0 1 0 0 2zm0 1.334c.368 0 .667.298.667.667V10c0 .368-.298.667-.667.667A.67.67 0 0 1 6.333 10V7.333c0-.368.298-.667.667-.667z"/></svg>`;

    const info = TranslationService.instant(options.language, 'inline.info');

    this.infoTooltipEl = document.createElement('div');
    this.infoTooltipEl.classList.add('ownid-info-tooltip');
    this.infoTooltipEl.innerHTML = info.replace(/\n/g, '<br>');
    document.body.appendChild(this.infoTooltipEl);

    element.querySelector('svg.ownid-info-icon')!.addEventListener('click', (e) => {
      this.toggleInfoTooltip(!this.showInfo);
      e.stopPropagation();
    });

    return element;
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
    const leftPosition = left - rect.width / 2 + width + window.pageXOffset;
    const clearLeftPosition = Math.min(Math.max(leftPosition, 10), window.document.body.clientWidth - rect.width - 10);

    this.infoTooltipEl!.style.top = `${top + window.pageYOffset - 4 - rect.height}px`;
    this.infoTooltipEl!.style.left = `${clearLeftPosition}px`;
  }

  private addOwnIDStyleTag(id: string): void {
    const style = document.createElement('style');

    style.id = id;
    style.textContent = `.ownid-link-button-widget{display:flex}
.ownid-flat-button{font-size:12px;line-height:16px;text-align:center;color:#0070F2;background:#FFF;border:1px solid #0070F2;border-radius:6px;padding:7px 10px;cursor:pointer}

.ownid-info-icon{padding:10px 10px 10px 5px;margin:0 0 -3px;width:13px;height:13px;cursor:pointer;fill:#0070F2}
.ownid-info-tooltip{width:280px;display:none;position:absolute;background:#FFF;border-radius:6px;border:1px solid #D5DADD;box-shadow:0px 0px 2px rgba(131,150,168,0.16),0px 4px 8px rgba(131,150,168,0.16);box-sizing:border-box;font-style:normal;font-weight:normal;font-size:12px;line-height:18px;padding:12px;z-index:1000000001}
`;
    document.head.appendChild(style);
  }
}
