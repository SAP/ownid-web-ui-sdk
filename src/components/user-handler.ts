import { IUserHandler } from '../interfaces/i-user-handler.interfaces';

export default class UserHandler implements IUserHandler {
  isUserExists(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
}
