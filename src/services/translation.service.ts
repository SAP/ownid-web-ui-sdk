import { Languages } from '../interfaces/i-widget.interfaces';
import ConfigurationService from './configuration.service';

import en from '../i18n/strings.json';
import ar from '../i18n/strings_ar.json';
import de from '../i18n/strings_de.json';
import enGB from '../i18n/strings_en_GB.json';
import es from '../i18n/strings_es.json';
import esMX from '../i18n/strings_es_MX.json';
import fr from '../i18n/strings_fr.json';
import id from '../i18n/strings_id.json';
import ja from '../i18n/strings_ja.json';
import ko from '../i18n/strings_ko.json';
import ms from '../i18n/strings_ms.json';
import pt from '../i18n/strings_pt.json';
import ptPT from '../i18n/strings_pt_PT.json';
import ru from '../i18n/strings_ru.json';
import th from '../i18n/strings_th.json';
import tr from '../i18n/strings_tr.json';
import vi from '../i18n/strings_vi.json';
import zhCN from '../i18n/strings_zh_CN.json';
import zhTW from '../i18n/strings_zh_TW.json';

interface ITranslationsTexts {
  [key: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export default class TranslationService {
  static readonly texts: ITranslationsTexts = {
    [Languages.ar]: ar,
    [Languages.de]: de,
    [Languages.en]: en,
    [Languages.enGB]: enGB,
    [Languages.es]: es,
    [Languages.esMX]: esMX,
    [Languages.fr]: fr,
    [Languages.id]: id,
    [Languages.ja]: ja,
    [Languages.ko]: ko,
    [Languages.ms]: ms,
    [Languages.pt]: pt,
    [Languages.ptPT]: ptPT,
    [Languages.ru]: ru,
    [Languages.th]: th,
    [Languages.tr]: tr,
    [Languages.vi]: vi,
    [Languages.zhCN]: zhCN,
    [Languages.zhTW]: zhTW,
  };

  static instant(lang: Languages = ConfigurationService.defaultLanguage, path: string): string {
    return (
      (TranslationService.texts[lang] && TranslationService.deepFind(TranslationService.texts[lang], path)) ??
      `${TranslationService.deepFind(TranslationService.texts[ConfigurationService.defaultLanguage], path)}&nbsp;`
    );
  }

  static deepFind(obj: { [key: string]: { [key: string]: string } }, translationPath: string): string | undefined {
    const paths = translationPath.split('.');
    let current: { [key: string]: { [key: string]: string } } | { [key: string]: string } | string = obj;

    // eslint-disable-next-line no-restricted-syntax
    for (const path of paths) {
      if (current[path] === undefined) {
        return;
      }
      current = current[path];
    }
    return (current as unknown) as string;
  }
}
