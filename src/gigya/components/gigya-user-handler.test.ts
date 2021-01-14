import { ILogger } from '../../interfaces/i-logger.interfaces';
import GigyaUserHandler from './gigya-user-handler';

describe('GigyaUserHandler', () => {
  it('isUserExists: should call accounts.isAvailableLoginID', (done) => {
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
    const handler = new GigyaUserHandler();

    handler.isUserExists('test').then((userExists) => {
      // @ts-ignore
      expect(window.gigya.accounts.isAvailableLoginID).toBeCalledTimes(1);
      expect(userExists).toBe(false);

      done();
    });
  });

  it('isUserExists: should process error without logger', (done) => {
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
    const handler = new GigyaUserHandler();

    handler.isUserExists('test').catch(() => {
      // @ts-ignore
      expect(window.gigya.accounts.isAvailableLoginID).toBeCalledTimes(1);

      done();
    });
  });

  it('isUserExists: should process error', (done) => {
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

      done();
    });
  });
});
