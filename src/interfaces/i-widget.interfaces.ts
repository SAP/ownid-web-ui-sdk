import { ILogger, LogLevel } from './i-logger.interfaces';

export enum WidgetType {
  Register = 'register',
  Login = 'login',
  Link = 'link',
  Recover = 'recover',
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
  statusInterval?: number;
  logger?: ILogger;
  logLevel?: keyof typeof LogLevel;
}

export interface IWidgetConfig {
  element: HTMLElement;
  type: WidgetType;
  language?: Languages;
  data?: unknown;
  URLPrefix?: string;
  mobileTitle?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  partial?: boolean;
  onLogin?: (response: object) => void;
  onRegister?: (response: object) => void;
  onLink?: (response: object) => void;
  onRecover?: (response: object) => void;
}

export interface IPartialConfig {
  language?: Languages;
  data?: unknown,
  mobileTitle?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  onLogin?: (response: object) => void;
  onRegister?: (response: object) => void;
  onLink?: (response: object) => void;
  onRecover?: (response: object) => void;
}

