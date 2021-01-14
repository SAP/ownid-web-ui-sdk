import BaseCommonComponent from './base-common.component';
import { validateUrl } from '../../services/helper.service';
import { Languages } from '../../interfaces/i-widget.interfaces';
import TranslationService from '../../services/translation.service';

declare type LinkButtonOptions = {
  href: string;
  language?: Languages;
};

export default class LinkedWidget extends BaseCommonComponent<LinkButtonOptions> {
  constructor(options: LinkButtonOptions) {
    super(options);
  }

  protected render(options: LinkButtonOptions): HTMLElement {
    const element = document.createElement('div');

    if (!validateUrl(options.href)) {
      // eslint-disable-next-line no-console
      console.error('URL validation failed');
      return element;
    }

    const linkageComplete = TranslationService.instant(options.language).link.complete;

    element.style.cssText = `padding: 20px;font-style: normal;font-weight: normal;font-size: 14px;line-height: 20px;color: #111D29;`;
    element.innerHTML = `${linkageComplete} <a style="color: #0070F2; text-decoration: none" target="_blank" href="${options.href}">OwnID</a>.`;

    return element;
  }
}
