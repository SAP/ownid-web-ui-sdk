import BaseCommonComponent from './base-common.component';
import TranslationService from '../../services/translation.service';

export type InlineWidgetOptions = {
  targetElement: HTMLElement;
  lang: string;
  additionalElements?: HTMLElement[];
  offset?: [number, number];
};

export default class InlineWidget extends BaseCommonComponent<InlineWidgetOptions> {
  constructor(private options: InlineWidgetOptions) {
    super(options);
  }

  protected render(options: InlineWidgetOptions): HTMLElement {
    const styles = document.getElementById('ownid-inline-widget-styles');

    if (!styles) {
      this.addOwnIDStyleTag('ownid-inline-widget-styles');
    }

    const element = document.createElement('div');

    const { message } = TranslationService.texts[options.lang].inline;

    element.classList.add('ownid-inline-widget');
    element.innerHTML = `${ message }&nbsp;<svg class="ownid-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20"><path d="M4.16 8.322a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776L9.108.368c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776L5.052 7.95a1.25 1.25 0 0 1-.891.371zm7.116-1.286a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.662-1.657c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.675 1.67a1.24 1.24 0 0 1-.878.358zm-7.154 7.132a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.242-4.23c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.242 4.23a1.23 1.23 0 0 1-.891.371zm2.9 2.877a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.795-1.8c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.795 1.8c-.24.252-.56.37-.9.37zm4.708-4.695a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.1-4.096c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.1 4.096c-.24.252-.56.37-.9.37zM1.25 11.2A1.25 1.25 0 0 0 2.5 9.965a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 1.25 1.246zM9.906 20a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l5.944-5.925c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-5.944 5.926a1.25 1.25 0 0 1-.891.371zm8.844-8.815a1.25 1.25 0 1 0-1.25-1.246 1.25 1.25 0 0 0 1.25 1.246z"></path></svg>
`;


    options.targetElement.addEventListener('input', (event) => {
      console.log(event);
      if (true) {
        element.style.display = 'none';
      }

    })

    return element;
  }

  public setFinishStatus(finish: boolean) {
    this.ref.classList.toggle('ownid-inline-widget--finished', finish);
    this.options.targetElement.classList.toggle('ownid-inline-disabled', finish);
    this.options.additionalElements?.forEach((element: HTMLElement) =>
      element.classList.toggle('ownid-disabled', finish),
    );
  }

  private addOwnIDStyleTag(id: string): void {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `.ownid-inline-widget{color:#0070F2;cursor:pointer;position:absolute;display:flex;font-size:14px}
.ownid-inline-widget .ownid-icon{fill:#0070F2}
.ownid-inline-widget--finished{color:#354A5F;margin-left:-25px;pointer-events:none}
.ownid-inline-widget--finished .ownid-icon{fill:#354A5F}
.ownid-inline-widget--finished:before{content:'';width:25px;height:16px;display:block;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOC43MDcgNy4yOTNhMSAxIDAgMCAxIDAgMS40MTRsLTggOGExIDEgMCAwIDEtMS40MTQgMGwtMy0zYTEgMSAwIDAgMSAxLjQxNC0xLjQxNEwxMCAxNC41ODZsNy4yOTMtNy4yOTNhMSAxIDAgMCAxIDEuNDE0IDB6IiBmaWxsPSIjMzZhNDFkIi8+PC9zdmc+) repeat center center}
.ownid-inline-disabled{opacity:0.3;pointer-events:none}
.ownid-note-undo{color:#0070F2;cursor:pointer}
`;

    document.head.appendChild(style);
  }

  public calculatePosition(element: HTMLElement, options: InlineWidgetOptions) {
    const [offsetX, offsetY] = options.offset || [0, 0];

    const { right, top, height: targetHeight } = options.targetElement.getBoundingClientRect();
    const { width, height } = element.getBoundingClientRect();

    console.log(top + offsetX + targetHeight / 2 - height / 2 + window.pageYOffset)

    element.style.top = `${ top + offsetX + targetHeight / 2 - height / 2 + window.pageYOffset }px`;
    element.style.left = `${ right + offsetY - width + window.pageXOffset }px`;
  }
}
