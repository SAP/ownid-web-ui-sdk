// todo: implement in correct way
import { Languages } from '../interfaces/i-widget.interfaces';

import en from '../i18n/strings.json';
import ru from '../i18n/strings_ru.json';

interface ITranslationsTexts {
  [key: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export default class TranslationService {
  static readonly texts: ITranslationsTexts = {
    [Languages.en]: en,
    [Languages.ru]: ru,
  };
}
