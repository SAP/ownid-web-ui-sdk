import OwnIDUiSdk from "./ownid-web-ui-sdk";
import RegisterComponent from "./components/register.component";

describe("OwnIDUiSdk instances test", () => {

  const sdk = new OwnIDUiSdk();

  it("DummyClass is instantiable", () => {
    expect(sdk).toBeInstanceOf(OwnIDUiSdk)
  });

  it("addRegisterWidget should return RegisterComponent", ()=>{
    expect(sdk.addRegisterWidget(document.createElement('div'))).toBeInstanceOf(RegisterComponent);
  })
});


