export declare type Options = {
  className?: string;
  id?: string;
  href: string;
  // events
};

export interface ICommonComponent {
  appendToParent(parent: HTMLElement): void;
  destroy(): void;
}

export default abstract class BaseCommonComponent<T>
  implements ICommonComponent {
  protected constructor(options: T) {
    this.ref = this.render(options);
  }

  private readonly ref: HTMLElement;

  protected abstract render(options: T): HTMLElement;

  public attachHandler(event: string, handler: () => void) {
    this.ref.addEventListener(event, handler);
  }

  public appendToParent(parent: HTMLElement): void {
    parent.append(this.ref);
  }

  public destroy() {
    this.ref.remove();
  }

  // listeners and etc.
}
