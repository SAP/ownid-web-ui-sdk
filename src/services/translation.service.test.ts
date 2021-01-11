import TranslationService from './translation.service';
import { Languages } from '../interfaces/i-widget.interfaces';

describe('TranslationService', () => {
  describe('instant', () => {
    it('should return en Lang', async () => {
      const res = TranslationService.instant(Languages.en)['common']['undo'];

      expect(res).toEqual('Undo');
    });

    it('should return en Lang as default', async () => {
      const res = TranslationService.instant('qwerty' as Languages)['common']['undo'];

      expect(res).toEqual('Undo');
    });


  });
});
