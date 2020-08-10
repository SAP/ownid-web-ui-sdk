import OwnIDUiSdk from "./ownid-web-ui-sdk";
import * as i from '.';

interface IMyWindow extends Window {
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
