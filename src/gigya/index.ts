import '../index';
import OwnIDUiSdk from '../ownid-web-ui-sdk';
import OwnIDUiSdkGigya from './ownid-web-ui-sdk-gigya';

interface IMyWindow extends Window {
  ownid: IOwnIDUiSdkGigya;
}

interface IOwnIDUiSdkGigya extends OwnIDUiSdk {
  gigya: OwnIDUiSdkGigya;
}

declare let window: IMyWindow;

window.ownid.gigya = window.ownid.gigya instanceof OwnIDUiSdkGigya ? window.ownid.gigya : new OwnIDUiSdkGigya();
