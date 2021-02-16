import 'whatwg-fetch';
import { ILogger, LogLevel } from '../interfaces/i-logger.interfaces';
import ConfigurationService from './configuration.service';

export default class BackendLogger implements ILogger {
  constructor(private logLevel: LogLevel, private URLPrefix: string) {
  }

  setLogLevel(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  logDebug<T>(message: string, data: T): void {
    if (this.logLevel > LogLevel.debug) {
      return;
    }

    this.logToBackend(message, data, LogLevel.debug);
  }

  logInfo<T>(message: string, data: T): void {
    if (this.logLevel > LogLevel.information) {
      return;
    }

    this.logToBackend(message, data, LogLevel.information);
  }

  logWarning<T>(message: string, data: T): void {
    if (this.logLevel > LogLevel.warning) {
      return;
    }

    this.logToBackend(message, data, LogLevel.warning);
  }

  logError<T>(message: string, data: T): void {
    this.logToBackend(message, data, LogLevel.error);
  }

  private logToBackend<T>(message: string, data: T, level: LogLevel): void {
    const logLevel = LogLevel[level];
    const source = 'UI SDK';
    const url = (this.URLPrefix || ConfigurationService.URLPrefix).replace(/\/+$/, '') + '/logs'

    fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',

      body: JSON.stringify({ message, data, logLevel, source }),
    });
  }
}
