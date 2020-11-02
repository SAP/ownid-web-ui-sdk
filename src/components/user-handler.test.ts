import UserHandler from './user-handler';

describe('UserHandler', () => {
  it('isUserExists should return true', () =>
    new Promise((resolve) => {
      const userHandler = new UserHandler();
      userHandler.isUserExists().then((result) => {
        expect(result).toEqual(true);
        resolve();
      });
    }));
});
