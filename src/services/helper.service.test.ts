import { find, findIndex, validateUrl, setCookie, getCookie } from './helper.service';

describe('HelperService', () => {
  describe('validateUrl', () => {
    it('should validate url', async () => {
      const res = validateUrl('http://ownid.com');

      expect(res).toEqual(true);
    });

    it('should fail validation', async () => {
      const res = validateUrl('wrong string');

      expect(res).toEqual(false);
    });
  });

  describe('find', () => {
    const collection = [{ data: 'item1' }, { data: 'item2' }];

    it('should find item in collection', async () => {
      const res = find<{ data: string }>(collection, (item: { data: string }) => item.data === 'item1');

      expect(res).toEqual({ data: 'item1' });
    });

    it('should not find item in collection', async () => {
      const res = find<{ data: string }>(collection, (item: { data: string }) => item.data === 'item');

      expect(res).toEqual(null);
    });
  });

  describe('findIndex', () => {
    const collection = [{ data: 'item1' }, { data: 'item2' }];

    it('should find item in collection', async () => {
      const res = findIndex<{ data: string }>(collection, (item: { data: string }) => item.data === 'item2');

      expect(res).toEqual(1);
    });

    it('should not find item in collection', async () => {
      const res = findIndex<{ data: string }>(collection, (item: { data: string }) => item.data === 'item');

      expect(res).toEqual(-1);
    });
  });

  describe('setCookie', () => {
    it('should set cookie', () => {
      setCookie('name', 'value');

      expect(document.cookie).toEqual('name=value');
    });

    it('should set cookie with expired', () => {
      setCookie('name', 'value2', 2000);

      expect(document.cookie).toEqual('name=value2');
    });
  });

  describe('getCookie', () => {
    it('should get cookie', () => {
      setCookie('setCookieName', 'someValue');
      const res = getCookie('setCookieName');

      expect(res).toEqual('someValue');
    });

    it('should return null if no cookie', () => {
      const res = getCookie('setCookieNameNull');

      expect(res).toEqual(null);
    });
  });
});
