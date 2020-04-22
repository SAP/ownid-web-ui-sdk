import OwnIDUiSdk from "./ownid-web-ui-sdk";
import WidgetComponent from "./components/widget.component";
import {IWidgetConfig, WidgetType} from "./interfaces/i-widget.interfeces";

describe("OwnIDUiSdk instances test", () => {

  const sdk = new OwnIDUiSdk();

  it("DummyClass is instantiable", () => {
    expect(sdk).toBeInstanceOf(OwnIDUiSdk)
  });

  it("init should call WidgetComponent", () => {
    const params = {
      element: document.createElement('div'),
      type: WidgetType.Login,
    };
    const sut = sdk.init(params);

    expect(sut).toBeInstanceOf(WidgetComponent);
  });

  it("init should return null", () => {
    const params: IWidgetConfig = {
      // @ts-ignore
      element: null,
      type: WidgetType.Login,
    };
    const sut = sdk.init(params);

    expect(sut).toBe(null);
  })
});


