import { LogLevel, ILogger } from '../interfaces/i-logger.interfaces';

export default class LoggerDecorator implements ILogger {
  constructor(private externalLogger: ILogger, private logLevel: LogLevel) {}

  logDebug<T>(message: string, data: T): void {
    if (this.logLevel > LogLevel.debug) {
      return;
    }

    this.externalLogger.logDebug(message, data);
  }

  logInfo<T>(message: string, data: T): void {
    if (this.logLevel > LogLevel.information) {
      return;
    }

    this.externalLogger.logInfo(message, data);
  }

  logWarning<T>(message: string, data: T): void {
    if (this.logLevel > LogLevel.warning) {
      return;
    }

    this.externalLogger.logInfo(message, data);
  }

  logError<T>(message: string, data: T): void {
    this.externalLogger.logError(message, data);
  }
}
