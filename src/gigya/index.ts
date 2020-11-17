import OwnIDUiSdk from '../ownid-web-ui-sdk';
import OwnIDUiSdkGigya from './ownid-web-ui-sdk-gigya';

interface IMyWindow extends Window {
  ownid: IOwnIDUiSdkGigya;
}

interface IOwnIDUiSdkGigya extends OwnIDUiSdk {
  gigya?: OwnIDUiSdkGigya;
}

declare let window: IMyWindow;

window.ownid = window.ownid instanceof OwnIDUiSdk ? window.ownid : new OwnIDUiSdk();

window.ownid.gigya = window.ownid.gigya instanceof OwnIDUiSdkGigya ? window.ownid.gigya : new OwnIDUiSdkGigya();

if (window.ownidAsyncInit) {
  window.ownidAsyncInit();
} else {
  // eslint-disable-next-line no-console
  console.log('OwnID sdk is loaded, ownidAsyncInit function was not found');
}
