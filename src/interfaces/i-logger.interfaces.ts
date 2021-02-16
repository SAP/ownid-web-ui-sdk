export enum LogLevel {
  trace,
  debug,
  information,
  warning,
  error,
  critical,
  none,
}

export interface ILogger {
  logDebug<T>(message: string, data: T): void;
  logInfo<T>(message: string, data: T): void;
  logWarning<T>(message: string, data: T): void;
  logError<T>(message: string, data: T): void;
  setLogLevel?(logLevel: number): void
}
