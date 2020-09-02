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
  note?: boolean | null | undefined | string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  partial?: boolean;
  tooltip?:
    | boolean
    | null
    | undefined
    | {
        targetEl?: string | false | null | undefined;
        offset?: [number, number];
      };
  toggleElement?: HTMLInputElement;
  onLogin?: (response: unknown) => void;
  onRegister?: (response: unknown) => void;
  onLink?: (response: unknown) => void;
  onRecover?: (response: unknown) => void;
  onError?: (error: string) => void;
}

export interface IPartialConfig {
  language?: Languages;
  data?: unknown;
  mobileTitle?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  onLogin?: (response: unknown) => void;
  onRegister?: (response: unknown) => void;
  onLink?: (response: unknown) => void;
  onRecover?: (response: unknown) => void;
  onError?: (error: string) => void;
}
