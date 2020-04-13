import BaseCommonComponent, {Options} from "./base-common.component";

// placeholder for real QR
export default class Qr extends BaseCommonComponent<Options>{
  constructor(options: Options) {
    super(options);
  }

  protected render(options: Options): HTMLElement {
    const button = document.createElement('button');

    if (options.id != null)
      button.id = options.id;

    button.className = options.className || '';
    return button;
  }
}
