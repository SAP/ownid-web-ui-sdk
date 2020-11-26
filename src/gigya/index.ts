import OwnIDUiSdk from '../ownid-web-ui-sdk';
import OwnIDUiSdkGigya from './ownid-web-ui-sdk-gigya';
import OwnIDUiSdkGigyaScreenSets from './ownid-web-ui-sdk-gigya-screen-sets';

interface IMyWindow extends Window {
  ownid: IOwnIDUiSdkGigya;
}

interface IOwnIDUiSdkGigya extends OwnIDUiSdk {
  gigya?: {
    screenSets: OwnIDUiSdkGigyaScreenSets;
  };
}

declare let window: IMyWindow;

window.ownid = window.ownid instanceof OwnIDUiSdkGigya ? window.ownid : new OwnIDUiSdkGigya();

window.ownid.gigya = {
  screenSets: new OwnIDUiSdkGigyaScreenSets(),
};

if (window.ownidAsyncInit) {
  window.ownidAsyncInit();
} else {
  // eslint-disable-next-line no-console
  console.log('OwnID sdk is loaded, ownidAsyncInit function was not found');
}
