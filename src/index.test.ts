import OwnIDUiSdk from "./ownid-web-ui-sdk";

window.ownid = new OwnIDUiSdk();
window.ownidAsyncInit = () => {};

import * as i from '.';

interface IMyWindow extends Window {
  ownidAsyncInit: () => void;
  ownid: OwnIDUiSdk;
}

declare let window: IMyWindow;

describe("OwnIDUiSdk global", () => {
  it("should init window.ownid", () => {
    expect(i).not.toBeNull();
    expect(window.ownid).not.toBeNull();
    expect(window.ownid).toBeInstanceOf(OwnIDUiSdk);
  });
});
