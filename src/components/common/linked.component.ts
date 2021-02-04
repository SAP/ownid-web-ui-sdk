import BaseCommonComponent from './base-common.component';
import { Languages } from '../../interfaces/i-widget.interfaces';
import TranslationService from '../../services/translation.service';

declare type LinkButtonOptions = {
  language?: Languages;
};

export default class LinkedWidget extends BaseCommonComponent<LinkButtonOptions> {
  private showInfo = false;

  private infoTooltipEl: HTMLDivElement | undefined;

  constructor(options: LinkButtonOptions) {
    super(options);
  }

  protected render(options: LinkButtonOptions): HTMLElement {
    const styles = document.getElementById('ownid-linked-widget-styles');

    if (!styles) {
      this.addOwnIDStyleTag('ownid-linked-widget-styles');
    }

    const element = document.createElement('div');

    element.classList.add('ownid-linked');

    const linkageComplete = TranslationService.instant(options.language, 'link.complete');

    element.innerHTML = `${linkageComplete}&nbsp;<svg class="ownid-info-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#354a5f" fill-rule="evenodd" viewBox="0 0 14 14"><path d="M.333 7A6.67 6.67 0 0 1 7 .333 6.67 6.67 0 0 1 13.667 7 6.67 6.67 0 0 1 7 13.667 6.67 6.67 0 0 1 .333 7zM7 1.667C4.055 1.667 1.667 4.055 1.667 7S4.055 12.333 7 12.333 12.334 9.946 12.334 7 9.946 1.667 7 1.667zm0 3.666a1 1 0 1 0 0-2 1 1 0 1 0 0 2zm0 1.334c.368 0 .667.298.667.667V10c0 .368-.298.667-.667.667A.67.67 0 0 1 6.333 10V7.333c0-.368.298-.667.667-.667z"/></svg>`;

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
    style.textContent = `
.ownid-linked{font-style:normal;font-weight:normal;font-size:14px;line-height:20px;color:#111D29}
.ownid-linked--link{color:#0070F2;text-decoration:none}
.ownid-linked .ownid-info-icon{margin:0 0 -1px -2px;width:13px;height:13px;cursor:pointer;padding:0;fill:#354a5f;box-sizing:content-box}
.ownid-info-tooltip{width:280px;display:none;position:absolute;background:#FFF;border-radius:6px;border:1px solid #D5DADD;box-shadow:0px 0px 2px rgba(131,150,168,0.16),0px 4px 8px rgba(131,150,168,0.16);box-sizing: border-box;font-style: normal;font-weight: normal;font-size: 12px;line-height: 18px;padding:12px;z-index:10000000001}
`;
    document.head.appendChild(style);
  }
}
