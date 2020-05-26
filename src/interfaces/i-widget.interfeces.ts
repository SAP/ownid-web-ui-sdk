export enum WidgetType {
  Register = 'register',
  Login = 'login',
}

export enum Languages {
  en = 'en',
  enGB = 'en-GB',
  enUS = 'en-US',
  ru = 'ru',
  es = 'es',
}

export interface IInitConfig {
  URLPrefix?: string;
  language?: Languages;
}

export interface IWidgetConfig {
  element: HTMLElement;
  type: WidgetType;
  language?: Languages;
  URLPrefix?: string;
  mobileTitle?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  onLogin?: (response: object) => void
  onRegister?: (response: object) => void
}

export interface IPartialConfig {
  language?: Languages;
  mobileTitle?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  onLogin?: (response: object) => void
  onRegister?: (response: object) => void
}
