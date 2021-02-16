import { LogLevel } from './i-logger.interfaces';

export interface IContext {
  context: string;
  nonce: string;
}

export interface IContextRS extends IContext {
  url: string;
  expiration: number;
  config: IContextConfig;
}

export interface IContextConfig {
  magicLink: boolean;
  logLevel: LogLevel;
}
