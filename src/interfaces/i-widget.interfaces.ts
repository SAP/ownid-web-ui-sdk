import { IUserHandler } from './i-user-handler.interfaces';
import { ILogger, LogLevel } from './i-logger.interfaces';

export enum WidgetType {
  Register = 'register',
  Login = 'login',
  Link = 'link',
  Recover = 'recover',
}

export enum Languages {
  ar = 'ar',
  de = 'de',
  en = 'en',
  enGB = 'en_GB',
  es = 'es',
  esMX = 'es_MX',
  fr = 'fr',
  id = 'id',
  ja = 'ja',
  ko = 'ko',
  ms = 'ms',
  pt = 'pt',
  ptPT = 'pt_PT',
  ru = 'ru',
  th = 'th',
  tr = 'tr',
  vi = 'vi',
  zhCN = 'zh_CN',
  zhTW = 'zh_TW',
}

export interface IInitConfig {
  URLPrefix?: string;
  language?: Languages;
  statusInterval?: number;
  logger?: ILogger;
  logLevel?: keyof typeof LogLevel;
  onMagicLinkLogin?: (response: unknown) => void;
}

export interface IWidgetConfig {
  element: HTMLElement;
  type: WidgetType;
  userHandler?: IUserHandler;
  language?: Languages;
  data?: {
    pwrt?: string;
    jwt?: string;
  };
  inline?: {
    targetElement: HTMLInputElement;
    userIdElement?: HTMLInputElement;
    additionalElements?: HTMLElement[];
    offset?: [number, number];
    credentialsAutoFillButtonOffset?: number;
  };
  URLPrefix?: string;
  mobileTitle?: string;
  note?:
    | boolean
    | null
    | string
    | {
        text: string;
        wrapperElement?: HTMLElement;
      };
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  partial?: boolean;
  tooltip?:
    | boolean
    | null
    | {
        targetEl?: string | false | null | undefined;
        offset?: [number, number];
        position?: string;
      };
  toggleElement?: HTMLInputElement;
  onLogin?: (response: unknown, metadata: string | null) => void;
  onRegister?: (response: unknown, metadata: string | null) => void;
  onLink?: (response: unknown, metadata: string | null) => void;
  onRecover?: (response: unknown, metadata: string | null) => void;
  onError?: (error: string) => void;
}

export interface IPartialConfig {
  language?: Languages;
  data?: {
    pwrt?: string;
    jwt?: string;
  };
  mobileTitle?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  onLogin?: (response: unknown, metadata: string | null) => void;
  onRegister?: (response: unknown, metadata: string | null) => void;
  onLink?: (response: unknown, metadata: string | null) => void;
  onRecover?: (response: unknown, metadata: string | null) => void;
  onError?: (error: string) => void;
}

export interface IWidgetPayload {
  error: null | true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  metadata?: string | null;
  message?: string;
}

export interface IFullWidgetConfig extends IWidgetConfig, IInitConfig {}
