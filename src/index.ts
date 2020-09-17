import OwnIDUiSdk from './ownid-web-ui-sdk';

window.ownid = window.ownid instanceof OwnIDUiSdk ? window.ownid : new OwnIDUiSdk();

if (window.ownidAsyncInit) {
  window.ownidAsyncInit();
} else {
  // eslint-disable-next-line no-console
  console.log('OwnID sdk is loaded, ownidAsyncInit function was not found');
}
