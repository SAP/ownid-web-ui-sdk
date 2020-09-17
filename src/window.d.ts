import OwnIDUiSdk from './ownid-web-ui-sdk';

export {};

declare global {
  interface Window {
    ownid: OwnIDUiSdk;
    ownidAsyncInit: () => void;
  }
}
