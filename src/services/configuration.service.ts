// todo: implement in correct way
import {WidgetType} from "../interfaces/i-widget.interfeces";

interface IDefaultTexts {
  [key: string]: {
    mobileTitle: string;
    desktopTitle: string;
    desktopSubtitle: string;
  }
}

export default class ConfigurationService {
  static readonly contextUrl = '/ownid/';

  static readonly defaultTexts: IDefaultTexts = {
    [WidgetType.Login]: {
      mobileTitle: 'Instant Sign In',
      desktopTitle: 'Instant Sign In',
      desktopSubtitle: 'Use your phone to scan for passwordless sign in.',
    },
    [WidgetType.Register]: {
      mobileTitle: 'Register without a password',
      desktopTitle: 'Skip the password with OwnID',
      desktopSubtitle: 'Use your phone to scan and complete a passwordless registration.',
    }
  }

}
