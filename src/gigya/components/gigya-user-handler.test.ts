import { ILogger } from '../../interfaces/i-logger.interfaces';
import GigyaUserHandler from './gigya-user-handler';

describe('GigyaUserHandler', () => {
  it('isUserExists: should call accounts.isAvailableLoginID', () => {
    return new Promise((resolve) => {
      // @ts-ignore
      window.gigya = {
        accounts: {
          isAvailableLoginID: jest.fn().mockImplementation((options) => {
            options.callback({
              errorCode: 0,
              errorMessage: '',
              isAvailable: true,
            });
          }),
        },
      };
      const handler = new GigyaUserHandler({} as ILogger);

      handler.isUserExists('test').then((userExists) => {
        // @ts-ignore
        expect(window.gigya.accounts.isAvailableLoginID).toBeCalledTimes(1);
        expect(userExists).toBe(false);

        resolve();
      });
    });
  });

  it('isUserExists: should process error', () => {
    return new Promise((resolve) => {
      // @ts-ignore
      window.gigya = {
        accounts: {
          isAvailableLoginID: jest.fn().mockImplementation((options) => {
            options.callback({
              errorCode: 1,
              errorMessage: 'my error',
            });
          }),
        },
      };
      const logger = {
        logError: jest.fn(),
        logDebug: jest.fn(),
        logInfo: jest.fn(),
      } as ILogger;
      const handler = new GigyaUserHandler(logger);

      handler.isUserExists('test').catch(() => {
        // @ts-ignore
        expect(window.gigya.accounts.isAvailableLoginID).toBeCalledTimes(1);
        expect(logger.logError).toBeCalledWith('Gigya.isAvailableLoginID -> 1: my error');

        resolve();
      });
    });
  });
});
