export enum LogLevel {
  debug = 1,
  info = 2,
  error = 3
}

export interface ILogger {
  logDebug(message: string): void;
  logInfo(message: string): void;
  logError(message: string): void;
}
