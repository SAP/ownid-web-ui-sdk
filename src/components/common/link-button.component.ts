import BaseCommonComponent from './base-common.component';
import { validateUrl } from '../../services/helper.service';

declare type LinkButtonOptions = {
  title: string;
  href: string;
};

export default class LinkButton extends BaseCommonComponent<LinkButtonOptions> {
  private disabled = false;

  constructor(private options: LinkButtonOptions) {
    super(options);
  }

  protected render(options: LinkButtonOptions): HTMLElement {
    if (!validateUrl(options.href)) {
      // eslint-disable-next-line no-console
      console.error('URL validation failed');
      return document.createElement('div');
    }

    const styles = document.getElementById('OwnID-styles');

    if (!styles) {
      this.addOwnIDStyleTag('OwnID-styles');
    }

    const button = document.createElement('button');

    button.type = 'button';
    button.classList.add('ownid-button');
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#030303"><path d="M4.16 8.322a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776L9.108.368c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776L5.052 7.95a1.25 1.25 0 0 1-.891.371zm7.116-1.286a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.662-1.657c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.675 1.67a1.24 1.24 0 0 1-.878.358zm-7.154 7.132a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.242-4.23c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.242 4.23a1.23 1.23 0 0 1-.891.371zm2.9 2.877a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.795-1.8c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.795 1.8c-.24.252-.56.37-.9.37zm4.708-4.695a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.1-4.096c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.1 4.096c-.24.252-.56.37-.9.37zM1.25 11.2A1.25 1.25 0 0 0 2.5 9.965a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 1.25 1.246zM9.906 20a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l5.944-5.925c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-5.944 5.926a1.25 1.25 0 0 1-.891.371zm8.844-8.815a1.25 1.25 0 1 0-1.25-1.246 1.25 1.25 0 0 0 1.25 1.246z"/></svg><span style="margin-left: 10px;">${options.title}</span>`;

    button.addEventListener('click', () => this.openWindow());

    return button;
  }

  public update(href: string): void {
    if (!validateUrl(href)) {
      // eslint-disable-next-line no-console
      console.error('URL validation failed');
      return;
    }

    this.options.href = href;
  }

  public disableButton(): void {
    this.disabled = true;
  }

  private addOwnIDStyleTag(id: string): void {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
.ownid-button{width:100%;min-width:288px;height:40px;display:flex;align-items:center;justify-content:center;border:none;border-radius:20px;font-style:normal;font-weight:500;font-size:14px;color:#030303;text-decoration: none; background-color: #fff;}
`;

    document.head.appendChild(style);
  }

  private openWindow(): void {
    if (this.disabled) {
      return;
    }
    window.open(this.options.href);
  }
}
