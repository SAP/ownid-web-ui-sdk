import {ErrorCorrectLevel, QRCode} from "qrcode-generator-ts";
import BaseCommonComponent from "./base-common.component";

declare type QrOptions = {
  title: string;
  subtitle: string;
  href: string;
};

export default class Qr extends BaseCommonComponent<QrOptions> {
  constructor(options: QrOptions) {
    super(options);
  }

  protected render(options: QrOptions): HTMLElement {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<div style="display:flex;padding:15px;background:#fff;border-radius:10px"><div class="own-id-qr-code" style="margin-right:25px"></div><div style="display:flex;flex-direction:column;justify-content:space-between;flex:1;"><div><div style="font-family:'SF Compact Text',sans-serif;font-weight:bold;font-size:20px;line-height:32px;margin-bottom:4px;">${options.title}</div><div style="font-family:'SF Compact Text',sans-serif;font-weight:500;font-size:16px;line-height:24px;">${options.subtitle}</div></div><div><a href="https://ownid.com/" style="text-decoration:none;display:flex;justify-content:flex-end;"><span style="font-family:'SF Pro Text',sans-serif;font-weight:500;font-size:12px;line-height:24px;color:#ACACAC;margin-right:5px;">What is this?</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#030303"><path d="M4.16 8.322a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776L9.108.368c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776L5.052 7.95a1.25 1.25 0 0 1-.891.371zm7.116-1.286a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.662-1.657c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.675 1.67a1.24 1.24 0 0 1-.878.358zm-7.154 7.132a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.242-4.23c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.242 4.23a1.23 1.23 0 0 1-.891.371zm2.9 2.877a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.795-1.8c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.795 1.8c-.24.252-.56.37-.9.37zm4.708-4.695a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.1-4.096c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.1 4.096c-.24.252-.56.37-.9.37zM1.25 11.2A1.25 1.25 0 0 0 2.5 9.965a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 1.25 1.246zM9.906 20a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l5.944-5.925c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-5.944 5.926a1.25 1.25 0 0 1-.891.371zm8.844-8.815a1.25 1.25 0 1 0-1.25-1.246 1.25 1.25 0 0 0 1.25 1.246z"/></svg></a></div></div></div>`;

    const img = document.createElement('img');
    const qr = new QRCode();
    qr.setErrorCorrectLevel(ErrorCorrectLevel.L);
    qr.setTypeNumber(10);
    qr.addData(options.href);
    qr.make();
    img.src = qr.toDataURL(3, 7);

    const imgWrapper = wrapper.querySelector('.own-id-qr-code') as HTMLElement;

    imgWrapper.append(img);

    return wrapper;
  }
}
