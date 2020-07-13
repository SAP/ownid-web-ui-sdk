import RequestService from "./request.service";

describe('RequestService', () => {
  beforeEach(() => {
    window.fetch = jest.fn().mockReturnValue(new Promise((resolve) => resolve({
      ok: true,
      status: 200,
      json: jest.fn().mockReturnValue({
        context: 'contextID',
        url: 'challengeUrlMock',
      }),
    })));
  });

  describe('post', () => {
    it('should call fetch with provided body', async () => {
      const sut = new RequestService();

      const res = await sut.post('url', { data: true });

      expect(window.fetch).toBeCalledWith('url', { body: '{"data":true}', cache: 'no-cache', headers: { 'Content-Type': 'application/json' }, method: 'POST', mode: 'cors', redirect: 'follow', referrerPolicy: 'no-referrer' });

      expect(res).toEqual({
        context: 'contextID',
        url: 'challengeUrlMock',
      });
    });

    it('should call fetch with out provided body', async () => {
      const sut = new RequestService();

      const res = await sut.post('url');

      expect(window.fetch).toBeCalledWith('url', { body: '{}', cache: 'no-cache', headers: { 'Content-Type': 'application/json' }, method: 'POST', mode: 'cors', redirect: 'follow', referrerPolicy: 'no-referrer' });

      expect(res).toEqual({
        context: 'contextID',
        url: 'challengeUrlMock',
      });
    });

    it('should return null', async () => {
      window.fetch = jest.fn().mockReturnValue(new Promise((resolve) => resolve({
        ok: false,
        json: jest.fn(),
      })));

      const sut = new RequestService();

      const res = await sut.post('url');

      expect(res).toEqual(null);
    });

    it('should log request url', async () => {
      // arrange
      const logger = {
        logDebug: () => {},
        logInfo: () => {},
        logError: () => {}
      };
      logger.logInfo = jest.fn();
      const requestService = new RequestService(logger);

      // act
      await requestService.post('url');

      // assert
      expect(logger.logInfo).toBeCalledWith('request: url');
    });
  });
});
