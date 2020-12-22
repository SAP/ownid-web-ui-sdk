import QRCode from 'qrcode-generator';
import BaseCommonComponent from './base-common.component';
import { validateUrl } from '../../services/helper.service';
import TranslationService from '../../services/translation.service';
import { Languages } from '../../interfaces/i-widget.interfaces';

declare type QrOptions = {
  title: string;
  subtitle: string;
  href: string;
  type: string;
  tooltip: boolean;
  language?: Languages;
};

export default class Qr extends BaseCommonComponent<QrOptions> {
  private qrCodeWrapper: HTMLDivElement | null = null;

  public securityCheckShown = false;

  private spendingShown = false;

  constructor(private options: QrOptions) {
    super(options);
  }

  protected render(options: QrOptions): HTMLElement {
    const wrapper = document.createElement('div');

    if (!validateUrl(options.href)) {
      // eslint-disable-next-line no-console
      console.error('URL validation failed');
      return wrapper;
    }

    wrapper.classList.add('ownid-wrapper');

    if (options.tooltip) {
      wrapper.classList.add('ownid-tooltip-wrapper');
    }

    const styles = document.getElementById('OwnID-styles');

    if (!styles) {
      this.addOwnIDStyleTag('OwnID-styles');
    }

    const title = options.title ? `<div class="ownid-title">${options.title}</div>` : '';

    const subTitle = options.subtitle ? `<div class="ownid-subtitle">${options.subtitle}</div>` : '';

    const onlyTitleFx = title && !subTitle ? '<div class="ownid-title-spacer"></div>' : '';

    const pendingTexts = {
      message: TranslationService.instant(options.language)[options.type].pendingMessage,
      button: TranslationService.instant(options.language)[options.type].pendingButton,
    };
    const { doneMessage } = TranslationService.instant(options.language)[options.type];

    wrapper.innerHTML = `
      <div class="ownid-qr-pane">
        <div class="ownid-qr-code">${this.generateQRCode(options.href)}</div>
        <div class="ownid-qr-pane--titles">
          ${onlyTitleFx}
          <div>${title}${subTitle}</div>
          <div class="ownid-qr-pane--about-wrapper"><a href="https://ownid.com/" class="ownid-qr-pane--about"><span class="ownid-qr-pane--about-text">What is this?</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#030303"><path d="M4.16 8.322a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776L9.108.368c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776L5.052 7.95a1.25 1.25 0 0 1-.891.371zm7.116-1.286a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.662-1.657c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.675 1.67a1.24 1.24 0 0 1-.878.358zm-7.154 7.132a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.242-4.23c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.242 4.23a1.23 1.23 0 0 1-.891.371zm2.9 2.877a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.795-1.8c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.795 1.8c-.24.252-.56.37-.9.37zm4.708-4.695a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.1-4.096c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.1 4.096c-.24.252-.56.37-.9.37zM1.25 11.2A1.25 1.25 0 0 0 2.5 9.965a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 1.25 1.246zM9.906 20a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l5.944-5.925c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-5.944 5.926a1.25 1.25 0 0 1-.891.371zm8.844-8.815a1.25 1.25 0 1 0-1.25-1.246 1.25 1.25 0 0 0 1.25 1.246z"/></svg></a></div>
        </div>
      </div>
      ${this.pendingTemplate(pendingTexts)}
      <div ownid-done>
        <div class="ownid-spacer"></div>
        <svg class="ownid-done-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#5dc122"><path d="M32 0A32 32 0 0 0 9.373 54.627 32 32 0 0 0 64 32c-.01-8.484-3.383-16.618-9.383-22.617A32.04 32.04 0 0 0 32 0zm0 59.43a27.43 27.43 0 0 1-19.395-46.824A27.43 27.43 0 0 1 59.429 32 27.46 27.46 0 0 1 32 59.429zm14.783-40.372L25.36 40.414l-7.592-7.568c-.213-.22-.467-.395-.748-.515a2.32 2.32 0 0 0-.9-.186 2.31 2.31 0 0 0-.893.171 2.32 2.32 0 0 0-.757.502 2.3 2.3 0 0 0-.504.755 2.29 2.29 0 0 0 .016 1.777 2.3 2.3 0 0 0 .517.746l9.222 9.192a2.31 2.31 0 0 0 3.26 0l23.054-22.98c.42-.433.652-1.014.647-1.617a2.29 2.29 0 0 0-.675-1.605 2.31 2.31 0 0 0-3.232-.028z"/></svg>
        <div class="ownid-done-text">${doneMessage}</div>
      </div>`;

    return wrapper;
  }

  public update(href: string): void {
    if (!validateUrl(href)) {
      // eslint-disable-next-line no-console
      console.error('URL validation failed');
      return;
    }

    if (this.ref && !this.qrCodeWrapper) {
      this.qrCodeWrapper = this.ref.querySelector('.ownid-qr-code');
    }

    if (!this.qrCodeWrapper) {
      return;
    }

    this.qrCodeWrapper.innerHTML = this.generateQRCode(href);
  }

  public showSecurityCheck(pin: number, yesCb: () => void, noCb: () => void): void {
    if (this.securityCheckShown) {
      return;
    }

    this.securityCheckShown = true;

    const pendingTexts = {
      message: TranslationService.instant(this.options.language)[this.options.type].pendingMessage,
      button: TranslationService.instant(this.options.language)[this.options.type].pendingButton,
    };
    const { title, message, yesButton, noButton } = TranslationService.instant(this.options.language).verification;

    this.ref.innerHTML = `
      <div class="ownid-security-check">
        <section class="ownid-security-check--pane">
          <section class="ownid-security-check--pane-pin">${pin}</section>
          <section class="ownid-security-check--pane-header">
            <div class="ownid-security-check--pane-title">${title}</div>
            <div class="ownid-security-check--pane-message">${message}</div>
          </section>
        </section>
        <section class="ownid-actions">
          <button ownid-btn="no" type="button">${noButton}</button>
          <button ownid-btn="yes" type="button">${yesButton}</button>
        </section>
      </div>
      ${this.pendingTemplate(pendingTexts)}`;

    const yesBtn = this.ref.querySelector('[ownid-btn="yes"]');
    yesBtn!.addEventListener('click', () => yesCb());

    const noBtn = this.ref.querySelector('[ownid-btn="no"]');
    noBtn!.addEventListener('click', () => noCb());
  }

  public showPending(cancelCb: () => void = () => {}): void {
    if (this.spendingShown) {
      return;
    }

    this.spendingShown = true;

    const pendingPane = this.ref.querySelector('[ownid-pending]') as HTMLElement;
    pendingPane.style.display = 'flex';
    const cancelBtn = pendingPane.querySelector('[ownid-btn="cancel"]');
    cancelBtn!.addEventListener('click', () => cancelCb());
  }

  public showDone(): void {
    const donePane = this.ref.querySelector('[ownid-done]') as HTMLElement;
    if (donePane) {
      donePane.style.display = 'flex';
    }
  }

  private generateQRCode(href: string): string {
    const qr = QRCode(0, 'L');

    qr.addData(href);
    qr.make();
    return qr.createImgTag(3, 7);
  }

  private addOwnIDStyleTag(id: string): void {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `[ownid-btn]{min-width:72px;height:36px;background:#fff;border:1px solid #000;border-radius:20px;color:#000;cursor:pointer;outline:0;transition:background-color .2s ease-out,color .2s ease-out}[ownid-btn]:hover{color:#fff;background:#000}@-webkit-keyframes ownid-spin{17%{background:0 0;-webkit-box-shadow:none;box-shadow:none}35%{-webkit-transform:rotate(-135deg);transform:rotate(-135deg);width:5px;height:5px;background:#000;border-radius:1px;-webkit-box-shadow:0 0 2px #000;box-shadow:0 0 2px #000}53%{background:0 0;-webkit-box-shadow:none;box-shadow:none}70%{-webkit-transform:rotate(360deg);transform:rotate(360deg);width:20px;height:20px}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes ownid-spin{17%{background:0 0;-webkit-box-shadow:none;box-shadow:none}35%{-webkit-transform:rotate(-135deg);transform:rotate(-135deg);width:5px;height:5px;background:#000;border-radius:1px;-webkit-box-shadow:0 0 2px #000;box-shadow:0 0 2px #000}53%{background:0 0;-webkit-box-shadow:none;box-shadow:none}70%{-webkit-transform:rotate(360deg);transform:rotate(360deg);width:20px;height:20px}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}
.ownid-qr-pane{display:flex;padding:15px;background:#fff;border-radius:10px}
.ownid-qr-code{margin-right:25px;text-align:center}
.ownid-qr-pane--titles{display:flex;flex-direction:column;justify-content:space-between;flex:1 1 auto;}
.ownid-title-spacer{height:25px}
.ownid-title{font-weight:bold;font-size:20px;line-height:32px;margin-bottom:4px}
.ownid-subtitle{font-weight:500;font-size:16px;line-height:24px}
.ownid-qr-pane--about{text-decoration:none;display:flex;justify-content:flex-end}
.ownid-qr-pane--about-text{font-weight:500;font-size:12px;line-height:24px;color:#ACACAC;margin-right:5px}
.ownid-spacer{display:none}

[ownid-done]{display:none;position:absolute;top:0;background:#FFF;width:100%;height:100%;justify-content:space-around;align-items:center}
.ownid-done-icon{margin:0 48px;flex:0 0 auto}
.ownid-done-text{font-weight:bold;font-size:14px;line-height:20px;color:#000000}

.ownid-security-check{padding:15px;background:#fff;border-radius:10px}
.ownid-security-check--pane{display:flex;justify-content:space-between}
.ownid-security-check--pane-pin{display:flex;justify-content:center;align-items:center;flex:50% 0 0;font-size:32px;line-height:36px;text-align:center;letter-spacing:12px}
.ownid-security-check--pane-header{font-size: 14px;line-height: 20px}
.ownid-security-check--pane-title{font-weight: bold}
.ownid-security-check--pane-message{margin-top: 4px}
.ownid-actions{padding:15px;background:#fff;border-radius:10px;white-space:nowrap}
[ownid-btn]+[ownid-btn]{margin-left:16px}
.ownid-wrapper{position:relative}

[ownid-pending]{display:none;position:absolute;top:0;background:rgba(255,255,255,.95);width:100%;height:100%;flex-direction:column;justify-content:space-around;align-items:center;}
.ownid-pending--icon{height:40px;display:flex;justify-content:center;align-items: center;}
.ownid-pending--svg{-webkit-animation:ownid-spin 1.77s ease infinite;-moz-animation:ownid-spin 1.77s ease infinite;animation:ownid-spin 1.77s ease infinite;}
.ownid-pending--title{font-weight:bold}

.ownid-wrapper.ownid-tooltip-wrapper{position:absolute;background:#FFF;border-radius:6px;border:1px solid #D5DADD;box-shadow:0px 0px 2px rgba(131,150,168,0.16),0px 4px 8px rgba(131,150,168,0.16);transform:translateY(-50%)}
.ownid-tooltip-wrapper:before,.ownid-tooltip-wrapper:after{content:'';position:absolute;display:block;width:0;height:0;border-style:solid;border-width:12px 10px;border-color:transparent #D5DADD transparent transparent;left:-20px;top:calc(50% - 12px)}
.ownid-tooltip-wrapper.ownid-tooltip-wrapper-left:before,.ownid-tooltip-wrapper.ownid-tooltip-wrapper-left:after{border-color:transparent transparent transparent #D5DADD;right:-20px;top:calc(50% - 12px);left:auto}
.ownid-tooltip-wrapper:after{border-color:transparent #FFF transparent transparent;left:-19px}
.ownid-tooltip-wrapper.ownid-tooltip-wrapper-left:after{border-color:transparent transparent transparent #FFF;right:-19px;left:auto}
.ownid-tooltip-wrapper .ownid-qr-pane{flex-direction:column;padding:24px 16px;width:225px}
.ownid-tooltip-wrapper .ownid-title{font-size:14px;line-height:20px;margin:0;text-align:center;}
.ownid-tooltip-wrapper .ownid-qr-code{margin-right:0}
.ownid-tooltip-wrapper .ownid-title-spacer{display:none}
.ownid-tooltip-wrapper .ownid-qr-pane--about-wrapper{display:none}
.ownid-tooltip-wrapper .ownid-spacer{display:block}
.ownid-tooltip-wrapper .ownid-subtitle{display:none}

.ownid-tooltip-wrapper [ownid-done]{flex-direction:column}
.ownid-tooltip-wrapper .ownid-done-text{text-align:center}

.ownid-tooltip-wrapper .ownid-security-check{width:195px}
.ownid-tooltip-wrapper .ownid-security-check--pane{flex-direction:column;text-align:center}
.ownid-tooltip-wrapper .ownid-security-check--pane-pin{margin:16px 0}
.ownid-tooltip-wrapper [ownid-pending]{border-radius:10px}
`;

    document.head.appendChild(style);
  }

  private pendingTemplate({ message, button }: { message: string; button: string }): string {
    return `<div ownid-pending>
      <div class="ownid-spacer"></div>
      <div>
        <div class="ownid-pending--icon">
          <svg class="ownid-pending--svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="#030303"><path d="M4.16 8.322a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776L9.108.368c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776L5.052 7.95a1.25 1.25 0 0 1-.891.371zm7.116-1.286a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.662-1.657c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.675 1.67a1.24 1.24 0 0 1-.878.358zm-7.154 7.132a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.242-4.23c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.242 4.23a1.23 1.23 0 0 1-.891.371zm2.9 2.877a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l1.795-1.8c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-1.795 1.8c-.24.252-.56.37-.9.37zm4.708-4.695a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l4.1-4.096c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-4.1 4.096c-.24.252-.56.37-.9.37zM1.25 11.2A1.25 1.25 0 0 0 2.5 9.965a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 1.25 1.246zM9.906 20a1.25 1.25 0 0 1-.891-.371c-.492-.5-.492-1.286 0-1.776l5.944-5.925c.492-.5 1.3-.5 1.782 0s.492 1.286 0 1.776l-5.944 5.926a1.25 1.25 0 0 1-.891.371zm8.844-8.815a1.25 1.25 0 1 0-1.25-1.246 1.25 1.25 0 0 0 1.25 1.246z"></path></svg>
        </div>
        <div class="ownid-pending--title">${message}</div>
      </div>
      <button ownid-btn="cancel">${button}</button>
    </div>`;
  }
}
