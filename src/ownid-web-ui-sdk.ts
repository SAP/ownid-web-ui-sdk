import RegisterComponent from "./components/register.component";
import LoginComponent from "./components/login.component";

export default class OwnIDUiSdk {
  addRegisterWidget(parent: Element): RegisterComponent{
    return new RegisterComponent(parent as HTMLElement);
  }

  addLoginWidget(parent: Element): LoginComponent{
    return new LoginComponent(parent as HTMLElement);
  }
}
