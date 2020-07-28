import OwnIDUiSdk from './ownid-web-ui-sdk';

interface IMyWindow extends Window {
  ownid: OwnIDUiSdk;
  ownidAsyncInit: () => void;
}

declare let window: IMyWindow;

window.ownid = window.ownid instanceof OwnIDUiSdk ? window.ownid : new OwnIDUiSdk();

if (window.ownidAsyncInit) {
  window.ownidAsyncInit();
} else {
  console.log(
    'OwnID sdk is loaded, ownidAsyncInit function was not found',
  );
}
