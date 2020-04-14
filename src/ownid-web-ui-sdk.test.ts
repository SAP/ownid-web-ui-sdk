import OwnIDUiSdk from "./ownid-web-ui-sdk";
import RegisterComponent from "./components/register.component";
import LoginComponent from "./components/login.component";

describe("OwnIDUiSdk instances test", () => {

  const sdk = new OwnIDUiSdk();

  it("DummyClass is instantiable", () => {
    expect(sdk).toBeInstanceOf(OwnIDUiSdk)
  });

  it("addRegisterWidget should return RegisterComponent", ()=>{
    expect(sdk.addRegisterWidget(document.createElement('div'))).toBeInstanceOf(RegisterComponent);
  })

  it("addLoginWidget should return LoginComponent", ()=>{
    expect(sdk.addLoginWidget(document.createElement('div'))).toBeInstanceOf(LoginComponent);
  })
});


