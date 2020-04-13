import OwnIDUiSdk from "./ownid-web-ui-sdk";

interface IMyWindow extends Window {
  ownid: OwnIDUiSdk;
}

declare let window: IMyWindow;

window.ownid = window.ownid || new OwnIDUiSdk();
