// todo: implement in correct way
import { Languages, WidgetType } from '../interfaces/i-widget.interfeces';

interface ITranslationsTexts {
  [key: string]: {
    [key: string]: {
      mobileTitle: string;
      desktopTitle: string;
      desktopSubtitle: string;
    };
  };
}

export default class TranslationService {
  static readonly texts: ITranslationsTexts = {
    [Languages.en]: {
      [WidgetType.Login]: {
        mobileTitle: 'Instant Sign In',
        desktopTitle: 'Instant Sign In',
        desktopSubtitle: 'Use your phone to scan for passwordless sign in.',
      },
      [WidgetType.Register]: {
        mobileTitle: 'Register without a password',
        desktopTitle: 'Skip the password with OwnID',
        desktopSubtitle:
          'Use your phone to scan and complete a passwordless registration.',
      },
    },
    [Languages.ru]: {
      [WidgetType.Login]: {
        mobileTitle: 'Мгновенный вход',
        desktopTitle: 'Мгновенный вход',
        desktopSubtitle:
          'Используйте свой телефон для сканирования и входа без пароля.',
      },
      [WidgetType.Register]: {
        mobileTitle: 'Зарегистрироваться без пароля',
        desktopTitle: 'Пропустить пароль с OwnID',
        desktopSubtitle:
          'Используйте свой телефон для сканирования и завершения регистрации без пароля.',
      },
    },
  };
}
