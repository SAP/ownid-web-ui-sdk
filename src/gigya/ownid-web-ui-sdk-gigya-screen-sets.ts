import WidgetComponent from '../components/widget.component';
import { IWidgetConfig, WidgetType } from '../interfaces/i-widget.interfaces';

interface IMyWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gigya: any;
}

interface OnAfterScreenLoadConfig {
  customScreenSetsIds: {
    [key: string]: string;
  };
  onError: (error: string) => void;
  widgetConfigs: {
    [key: string]: IWidgetConfig;
  }
}

declare let window: IMyWindow;

export default class OwnIDUiSdkGigyaScreenSets {
  private ownIDWidget: WidgetComponent | null = null;

  private observer: MutationObserver;

  constructor() {
    this.observer = new MutationObserver(() => this.ownIDWidget?.recalculatePosition());
  }

  getOwnIdWrapper(): HTMLElement {
    let ownIDElement = document.getElementById('ownid-wrapper');
    if (!ownIDElement) {
      ownIDElement = document.createElement('div');
      ownIDElement.id = 'ownid-wrapper';

      document.body.appendChild(ownIDElement);
    }

    return ownIDElement;
  }

  renderInlineRegisterWidget(): void {
    const pass = document.querySelector('[data-gigya-name="password"]') as HTMLInputElement;
    const repeatPass = document.querySelector('[data-gigya-name="passwordRetype"]') as HTMLElement;

    this.ownIDWidget = window.ownid.render({
      type: WidgetType.Register,
      inline: {
        targetElement: pass,
        additionalElements: [repeatPass],
        offset: [0, -10],
      },
      element: this.getOwnIdWrapper(),
      onError(error) {
        // eslint-disable-next-line no-console
        console.warn('onError', error);
      },
    });
  }

  renderInlineLoginWidget(callback: () => void, config?: OnAfterScreenLoadConfig): void {
    const pass = document.querySelector('[data-gigya-name="password"]') as HTMLInputElement;

    this.ownIDWidget = window.ownid!.render({
      type: WidgetType.Login,
      inline: {
        targetElement: pass,
        offset: [0, -10],
      },
      element: this.getOwnIdWrapper(),
      onError: (error) => {
        let ownIDErrorElement = document.getElementById('ownid-register-error');

        if (!ownIDErrorElement) {
          ownIDErrorElement = document.createElement('span');
          ownIDErrorElement.classList.add('gigya-error-msg', 'gigya-error-msg-active');
          ownIDErrorElement.id = 'ownid-register-error';

          pass?.parentNode?.insertBefore(ownIDErrorElement, pass.nextSibling);
        }

        ownIDErrorElement.textContent = error;
        ownIDErrorElement.style.display = 'block';


        this.ownIDWidget!.disabled = true;
        this.ownIDWidget = window.ownid!.reRenderWidget(this.ownIDWidget);

        (document.querySelector('[data-gigya-name="password"]') as HTMLInputElement).value = '';
        (document.querySelector('[data-gigya-name="passwordRetype"]') as HTMLInputElement).value = '';

        pass.addEventListener('input', () => {
          ownIDErrorElement!.style.display = pass.value !== '' ? 'none' : 'block';
        });

        config?.onError(error);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onLogin(statusRS: any) {
        document.cookie = `gac_${ window.gigya.thisScript.APIKey }=${ statusRS.sessionInfo.cookieValue }; path=/`;
        window.gigya.accounts.getAccountInfo({ callback });
      },
    });
  }

  destroyOwnIDWidget(): void {
    if (this.ownIDWidget) {
      this.ownIDWidget.destroy();
      this.ownIDWidget = null;
    }
  }

  public onAfterScreenLoad(event: { currentScreen: string }, callback: () => void, config?: OnAfterScreenLoadConfig): void {
    this.destroyOwnIDWidget();

    this.observer.disconnect();

    this.observer.observe(document.getElementById(event.currentScreen)!, {
      attributes: false,
      childList: true,
      subtree: true,
    });

    if (event.currentScreen === 'gigya-login-screen' || event.currentScreen === config?.customScreenSetsIds.login) {
      this.renderInlineLoginWidget(callback, config);
    }

    if (event.currentScreen === 'gigya-register-screen' || event.currentScreen === config?.customScreenSetsIds.registration) {
      this.renderInlineRegisterWidget();
    }

    document.getElementsByClassName('gigya-input-submit')[0].addEventListener('click', () => {
      if (!this.ownIDWidget?.disabled) {
        const pw = window.ownid.generateOwnIDPassword(32);
        (document.querySelector('[data-gigya-name="password"]') as HTMLInputElement).value = pw;
        (document.querySelector('[data-gigya-name="passwordRetype"]') as HTMLInputElement).value = pw;
      }
    });
  }

  public onHide(): void {
    this.destroyOwnIDWidget();
    this.observer.disconnect();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  public async onSubmit(event: any): Promise<any> {
    if (this.ownIDWidget) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = (await window.ownid.getOwnIDPayload(this.ownIDWidget)) as { data: any };
      if (data) {
        // eslint-disable-next-line no-param-reassign
        event.formModel.data.ownIdConnections = [{ ...data }];
      }
    }
    return event;
  }
}
