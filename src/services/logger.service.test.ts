import LoggerDecorator from "./logger.service";
import { LogLevel, ILogger } from '../interfaces/i-logger.interfaces';

describe('LoggerDecorator', () => {
  function getExternalLog() : ILogger {
    return {
      logDebug: () => {},
      logInfo: () => {},
      logWarning: () => {},
      logError: () => {}
    };
  }

  describe('logDebug', () => {
    it('log debug if log level debug', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logDebug = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.debug);

      logDecorator.logDebug('debug', 'data');

      expect(externalLogger.logDebug).toBeCalledWith('debug', 'data');
    });

    it('does not log debug if log level is info', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logDebug = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.information);

      logDecorator.logDebug('debug', 'data');

      expect(externalLogger.logDebug).toBeCalledTimes(0);
    });

    it('does not log debug if log level is error', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logDebug = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.error);

      logDecorator.logDebug('debug', 'data');

      expect(externalLogger.logDebug).toBeCalledTimes(0);
    });
  });

  describe('logInfo', () => {
    it('log info if log level debug', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logInfo = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.debug);

      logDecorator.logInfo('info', 'data');

      expect(externalLogger.logInfo).toBeCalledWith('info', 'data');
    });

    it('log info if log level debug info', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logInfo = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.information);

      logDecorator.logInfo('info', 'data');

      expect(externalLogger.logInfo).toBeCalledWith('info', 'data');
    });

    it('does not log info if log level is error', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logInfo = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.error);

      logDecorator.logInfo('info', 'data');

      expect(externalLogger.logInfo).toBeCalledTimes(0);
    });
  });

  describe('logError', () => {
    it('log error if log level debug', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logError = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.debug);

      logDecorator.logError('error', 'data');

      expect(externalLogger.logError).toBeCalledWith('error', 'data');
    });

    it('log error if log level info', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logError = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.information);

      logDecorator.logError('error', 'data');

      expect(externalLogger.logError).toBeCalledWith('error', 'data');
    });

    it('log error if log level error', async() =>{
      const externalLogger = getExternalLog();
      externalLogger.logError = jest.fn();
      const logDecorator = new LoggerDecorator(externalLogger, LogLevel.error);

      logDecorator.logError('error', 'data');

      expect(externalLogger.logError).toBeCalledWith('error', 'data');
    });
  });
});
