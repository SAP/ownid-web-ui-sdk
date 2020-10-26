import { ILogger } from '../../interfaces/i-logger.interfaces';
import { IUserHandler } from '../../interfaces/i-user-handler.interfaces';

export default class GigyaUserHandler implements IUserHandler {
  constructor(private logger: ILogger) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isUserExists(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      window.gigya.accounts.isAvailableLoginID({
        loginID: userId,
        callback: (response: IIsAvailableLoginIDResponse) => {
          if (response.errorCode !== 0) {
            const errorText = `Gigya.isAvailableLoginID -> ${response.errorCode}: ${response.errorMessage}`;
            this.logger.logError(errorText);
            reject(new Error(errorText));
          }

          resolve(!response.isAvailable);
        },
      });
    });
  }
}

interface IIsAvailableLoginIDResponse {
  errorCode: number;
  errorMessage: string;
  isAvailable: boolean;
}
