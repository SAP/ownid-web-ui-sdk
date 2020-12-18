import WidgetComponent from '../components/widget.component';
import { IWidgetConfig, IWidgetPayload, Languages, WidgetType } from '../interfaces/i-widget.interfaces';
import ConfigurationService from '../services/configuration.service';

interface IMyWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gigya: any;
}

interface OnAfterScreenLoadConfig {
  customScreenSetsIds: {
    [key: string]: string;
  };
  widgetConfigs: {
    [key: string]: IWidgetConfig;
  };
}

declare let window: IMyWindow;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IsreensetEvent = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IOwnIdDataRS = any;

type IHandler = (currentScreen: string, data: IOwnIdDataRS, metadata?: string | null) => void;

interface IHandlers {
  onSuccess?: IHandler;
}

export default class OwnIDUiSdkGigyaScreenSets {
  private ownIDWidget: WidgetComponent | null = null;

  private observer: MutationObserver;

  private handlers: {
    onSuccess: IHandler[];
  } = {
    onSuccess: [],
  };

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

  renderInlineRegisterWidget(currentScreen: string, config?: IWidgetConfig): void {
    const screensetSelector = `[data-screenset-element-id="${currentScreen}"][data-screenset-roles*="instance"]`;
    const pass = document.querySelector(`${screensetSelector} [data-gigya-name="password"]`) as HTMLInputElement;
    const repeatPass = document.querySelector(
      `${screensetSelector} [data-gigya-name="passwordRetype"]`,
    ) as HTMLInputElement;

    this.ownIDWidget = window.ownid.render({
      element: this.getOwnIdWrapper(),
      language: this.mapGigyaLanguage(window.gigya.thisScript.globalConf.lang),
      inline: {
        targetElement: pass,
        additionalElements: [repeatPass],
        offset: [-10, 0],
      },
      ...config,
      type: WidgetType.Register,
      onError: (error) => {
        let ownIDErrorElement = document.querySelector(`${screensetSelector} .ownid-register-error`) as HTMLSpanElement;

        if (!ownIDErrorElement) {
          ownIDErrorElement = document.createElement('span');
          ownIDErrorElement.classList.add('gigya-error-msg', 'gigya-error-msg-active', 'ownid-register-error');

          pass?.parentNode?.insertBefore(ownIDErrorElement, pass.nextSibling);
        }

        ownIDErrorElement.textContent = error;
        ownIDErrorElement.style.display = 'block';

        this.ownIDWidget!.disabled = true;
        this.ownIDWidget = window.ownid!.reRenderWidget(this.ownIDWidget);

        pass.value = '';

        if (repeatPass) {
          repeatPass.value = '';
        }

        pass.addEventListener('input', () => {
          ownIDErrorElement!.style.display = pass.value !== '' ? 'none' : 'block';
        });

        if (config?.onError) {
          config.onError(error);
        }
      },
    });
  }

  renderInlineLoginWidget(currentScreen: string, config?: IWidgetConfig): void {
    const screensetSelector = `[data-screenset-element-id="${currentScreen}"][data-screenset-roles*="instance"]`;
    const loginID = document.querySelector(`${screensetSelector} [data-gigya-name="loginID"]`) as HTMLInputElement;
    const pass = document.querySelector(`${screensetSelector} [data-gigya-name="password"]`) as HTMLInputElement;

    this.ownIDWidget = window.ownid!.render({
      element: this.getOwnIdWrapper(),
      language: this.mapGigyaLanguage(window.gigya.thisScript.globalConf.lang),
      inline: {
        userIdElement: loginID,
        targetElement: pass,
        offset: [-10, 0],
      },
      ...config,
      type: WidgetType.Login,
      onError: (error) => {
        let ownIDErrorElement = document.querySelector(`${screensetSelector} .ownid-register-error`) as HTMLSpanElement;

        if (!ownIDErrorElement) {
          ownIDErrorElement = document.createElement('span');
          ownIDErrorElement.classList.add('gigya-error-msg', 'gigya-error-msg-active', 'ownid-login-error');

          pass?.parentNode?.insertBefore(ownIDErrorElement, pass.nextSibling);
        }

        ownIDErrorElement.textContent = error;
        ownIDErrorElement.style.display = 'block';

        this.ownIDWidget!.disabled = true;
        this.ownIDWidget = window.ownid!.reRenderWidget(this.ownIDWidget);

        pass.value = '';

        pass.addEventListener('input', () => {
          ownIDErrorElement!.style.display = pass.value !== '' ? 'none' : 'block';
        });

        if (config?.onError) {
          config.onError(error);
        }
      },
      onLogin: (statusRS: IOwnIdDataRS, metadata: string | null) => {
        if (statusRS.sessionInfo?.cookieValue) {
          document.cookie = `gac_${window.gigya.thisScript.APIKey}=${statusRS.sessionInfo.cookieValue}; path=/`;
          window.gigya.accounts.getAccountInfo({
            callback: () =>
              this.handlers.onSuccess.forEach((callback: IHandler) => callback(currentScreen, statusRS, metadata)),
          });
        }
      },
    });
  }

  renderInlineRecoverWidget(currentScreen: string, config?: IWidgetConfig): void {
    const screensetSelector = `[data-screenset-element-id="${currentScreen}"][data-screenset-roles*="instance"]`;
    const pass = document.querySelector(`${screensetSelector} [data-gigya-name="newPassword"]`) as HTMLInputElement;
    const repeatPass = document.querySelector(
      `${screensetSelector} [data-gigya-name="passwordRetype"]`,
    ) as HTMLInputElement;

    this.ownIDWidget = window.ownid!.render({
      element: this.getOwnIdWrapper(),
      language: this.mapGigyaLanguage(window.gigya.thisScript.globalConf.lang),
      inline: {
        targetElement: pass,
        additionalElements: [repeatPass],
        offset: [-10, 0],
      },
      ...config,
      type: WidgetType.Recover,
      onRecover: (statusRS: IOwnIdDataRS, metadata: string | null) => {
        this.handlers.onSuccess.forEach((callback: IHandler) => callback(currentScreen, statusRS, metadata));
      },
    });
  }

  destroyOwnIDWidget(): void {
    if (this.ownIDWidget) {
      this.ownIDWidget.destroy();
      this.ownIDWidget = null;
    }
  }

  public onAfterScreenLoad(event: IsreensetEvent, config?: OnAfterScreenLoadConfig): void {
    this.destroyOwnIDWidget();

    this.observer.disconnect();

    this.observer.observe(document.getElementById(event.currentScreen)!, {
      attributes: false,
      childList: true,
      subtree: true,
    });

    switch (event.currentScreen) {
      case 'gigya-reset-password-screen':
      case config?.customScreenSetsIds?.recover:
        this.renderInlineRecoverWidget(event.currentScreen, config?.widgetConfigs?.[event.currentScreen]);
        break;
      case 'gigya-login-screen':
      case config?.customScreenSetsIds?.login:
        this.renderInlineLoginWidget(event.currentScreen, config?.widgetConfigs?.[event.currentScreen]);
        break;
      case 'gigya-register-screen':
      case config?.customScreenSetsIds?.registration:
        this.renderInlineRegisterWidget(event.currentScreen, config?.widgetConfigs?.[event.currentScreen]);
        // eslint-disable-next-line  no-case-declarations
        const screensetSelector = `[data-screenset-element-id="${event.currentScreen}"][data-screenset-roles*="instance"]`;

        document.querySelector(`${screensetSelector} .gigya-input-submit`)?.addEventListener('click', () => {
          if (!this.ownIDWidget?.disabled) {
            const pw = window.ownid.generateOwnIDPassword(32);
            (document.querySelector(
              `${screensetSelector} [data-gigya-name="password"]`,
            ) as HTMLInputElement).value = pw;
            (document.querySelector(
              `${screensetSelector} [data-gigya-name="passwordRetype"]`,
            ) as HTMLInputElement).value = pw;
          }
        });
        break;
      default:
    }
  }

  public onHide(): void {
    this.destroyOwnIDWidget();
    this.observer.disconnect();
  }

  public async onSubmit(event: IsreensetEvent): Promise<IsreensetEvent> {
    if (this.ownIDWidget) {
      const { data, metadata } = await window.ownid.getOwnIDPayload(this.ownIDWidget);
      if (data) {
        this.handlers.onSuccess.forEach((callback: IHandler) => callback(event.currentScreen, data, metadata));
        // eslint-disable-next-line no-param-reassign
        event.formModel.data = event.formModel.data || {};
        // eslint-disable-next-line no-param-reassign
        event.formModel.data.ownIdConnections = [{ ...data }];
      }
    }
    return event;
  }

  public addEventHandlers(handlers?: IHandlers): void {
    if (handlers?.onSuccess) {
      this.handlers.onSuccess.push(handlers.onSuccess);
    }

    window.gigya.accounts.addEventHandlers({
      onLogin: async (event: { newUser: boolean }) => {
        if (!event.newUser && this.ownIDWidget) {
          const { data }: IWidgetPayload = await window.ownid.getOwnIDPayload(this.ownIDWidget);
          if (data?.pubKey) {
            window.gigya.accounts.getAccountInfo({
              include: 'data',
              callback: (userData: { data: { ownIdConnections: IOwnIdDataRS[] } }) => {
                const userDataObj = userData.data || {};
                const ownIdConnections = userDataObj.ownIdConnections || [];

                ownIdConnections.push(data);

                window.gigya.accounts.setAccountInfo({ data: { ownIdConnections } });
              },
            });
          }
        }
      },
    });
  }

  mapGigyaLanguage(gigyaLang: string): Languages {
    const [lang, cultureLang] = gigyaLang.split('-');
    const language = cultureLang ? `${lang}_${cultureLang.toUpperCase()}` : lang;

    return language in Languages ? (language as Languages) : ConfigurationService.defaultLanguage;
  }
}
