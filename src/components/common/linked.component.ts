import BaseCommonComponent from './base-common.component';
import { validateUrl } from '../../services/helper.service';

declare type LinkButtonOptions = {
  href: string;
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

    element.style.cssText = `padding: 20px;font-style: normal;font-weight: normal;font-size: 14px;line-height: 20px;color: #111D29;`;
    element.innerHTML = `You have instant login enabled by <a style="color: #0070F2; text-decoration: none" target="_blank" href="${ options.href }">OwnID</a>.`;

    return element;
  }
}
