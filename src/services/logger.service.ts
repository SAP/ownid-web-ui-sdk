import { LogLevel, ILogger } from '../interfaces/i-logger.interfaces';

export default class LoggerDecorator implements ILogger {
  constructor(private externalLogger: ILogger, private logLevel: LogLevel) {}

  logDebug(message: string): void {
    if (this.logLevel > LogLevel.debug) {
      return;
    }

    this.externalLogger.logDebug(message);
  }

  logInfo(message: string): void {
    if (this.logLevel > LogLevel.info) {
      return;
    }

    this.externalLogger.logInfo(message);
  }

  logError(message: string): void {
    this.externalLogger.logError(message);
  }
}
