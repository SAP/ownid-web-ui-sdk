import QRCode from 'qrcode-generator';
import BaseCommonComponent from './base-common.component';

declare type QrOptions = {
  title: string;
  subtitle: string;
  href: string;
};

export default class Qr extends BaseCommonComponent<QrOptions> {
  private qrCodeWrapper: HTMLDivElement | null = null;

  private securityCheckShown = false;

  constructor(options: QrOptions) {
    super(options);
  }

  protected render(options: QrOptions): HTMLElement {
    const wrapper = document.createElement('div');

    wrapper.style.position = 'relative';

    wrapper.innerHTML = `<div style="display:flex;padding:15px;background:#fff;border-radius:10px"><div class="own-id-qr-code" style="margin-right:25px">${ this.generateQRCode(options.href) }</div><div style="display:flex;flex-direction:column;justify-content:space-between;flex:1;"><div><div style="font-family:'SF Compact Text',sans-serif;font-weight:bold;font-size:20px;line-height:32px;margin-bottom:4px;">${ options.title }</div><div style="font-family:'SF Compact Text',sans-serif;font-weight:500;font-size:16px;line-height:24px;">${ options.subtitle }</div></div><div><a href="https://ownid.com/" style="text-decoration:none;display:flex;justify-content:flex-end;"><span style="font-family:'SF Pro Text',sans-serif;font-weight:500;font-size:12px;line-height:24px;color:#ACACAC;margin-right:5px;">What is this?</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#030303"><path d="M4.16 8.322a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776L9.108.368c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776L5.052 7.95a1.25 1.25 0 0 1-.891.371zm7.116-1.286a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.662-1.657c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.675 1.67a1.24 1.24 0 0 1-.878.358zm-7.154 7.132a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.242-4.23c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.242 4.23a1.23 1.23 0 0 1-.891.371zm2.9 2.877a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.795-1.8c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.795 1.8c-.24.252-.56.37-.9.37zm4.708-4.695a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.1-4.096c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.1 4.096c-.24.252-.56.37-.9.37zM1.25 11.2A1.25 1.25 0 0 0 2.5 9.965a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 1.25 1.246zM9.906 20a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l5.944-5.925c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-5.944 5.926a1.25 1.25 0 0 1-.891.371zm8.844-8.815a1.25 1.25 0 1 0-1.25-1.246 1.25 1.25 0 0 0 1.25 1.246z"/></svg></a></div></div></div>`;

    return wrapper;
  }

  public update(href: string): void {
    if (this.ref && !this.qrCodeWrapper) {
      this.qrCodeWrapper = this.ref.querySelector('.own-id-qr-code');
    }

    if (!this.qrCodeWrapper) {
      return;
    }

    this.qrCodeWrapper.innerHTML = this.generateQRCode(href);
  }

  public showSecurityCheck(pin: number, yesCb: () => void, noCb: () => void) {
    if (this.securityCheckShown) {
      return;
    }

    this.securityCheckShown = true;

    this.ref.innerHTML = `
      <style>
        ownid [ownid-btn] {min-width: 72px; height: 36px;background: #FFF; border: 1px solid #000; border-radius: 20px;color: #000; cursor: pointer; outline: none;transition: background-color .2s ease-out, color .2s ease-out;}
        ownid [ownid-btn]:hover {color: #FFF; background: #000;}
        @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
        @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
        @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
      </style>
      <div style="padding:15px;background:#fff;border-radius:10px">
        <section style="display: flex;justify-content: space-between;">
          <section style="display: flex;justify-content: center;align-items: center;flex: 50% 0 0;font-size: 32px;line-height: 36px;text-align: center;letter-spacing: 12px;">${ pin }</section>
          <section style="font-size: 14px;line-height: 20px;">
            <div style="font-weight: bold">Verification Code</div>
            <div style="margin-top: 4px">Does the code on your device match this one?</div>
          </section>
        </section>
        <section style="display: flex;justify-content: center;margin-top: 12px">
          <button ownid-btn="no" style="margin-right: 16px;">No</button>
          <button ownid-btn="yes">Yes</button>
        </section>
      </div>
      <div ownid-pending style="display:none; position: absolute;top: 0;background: rgba(255,255,255,.7);width: 100%;height: 100%;justify-content: center;align-items: flex-start;padding-top: 35px;">
        <img style="width: 50px; height: 50px;-webkit-animation:spin 1.2s linear infinite;-moz-animation:spin 1.2s linear infinite;animation:spin 1.2s linear infinite;" src="data:image/png;base64,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cy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjcwIiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNzAiIGV4aWY6VXNlckNvbW1lbnQ9IlNjcmVlbnNob3QiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA1LTEyVDIxOjE2OjEyLTA3OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNS0xMlQyMToyMDozOS0wNzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNS0xMlQyMToyMDozOS0wNzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJEaXNwbGF5IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmRhZTI5ZGM4LTlkODktNDUzYS1hOTU1LTU0ZDE2MjJmYzEyNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpkYWUyOWRjOC05ZDg5LTQ1M2EtYTk1NS01NGQxNjIyZmMxMjYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkYWUyOWRjOC05ZDg5LTQ1M2EtYTk1NS01NGQxNjIyZmMxMjYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkYWUyOWRjOC05ZDg5LTQ1M2EtYTk1NS01NGQxNjIyZmMxMjYiIHN0RXZ0OndoZW49IjIwMjAtMDUtMTJUMjE6MjA6MzktMDc6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFk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">
      </div>`

    const yesBtn = this.ref.querySelector('[ownid-btn="yes"]');
    yesBtn!.addEventListener('click', () => yesCb());

    const noBtn = this.ref.querySelector('[ownid-btn="no"]');
    noBtn!.addEventListener('click', () => noCb());
  }

  public showPending() {
    const spinner: HTMLElement | null = this.ref.querySelector('[ownid-pending]');
    console.log('spinner.style.display', spinner?.style.display);
    if (spinner) {
      spinner.style.display = 'flex';
      console.log('spinner.style.display 2', spinner.style.display);

    }
  }

  private generateQRCode(href: string): string {
    const qr = QRCode(0, 'L');

    qr.addData(href);
    qr.make();
    return qr.createImgTag(3, 7);
  }
}
