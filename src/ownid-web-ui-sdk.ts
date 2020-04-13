import RegisterComponent from "./components/register.component";

export default class OwnIDUiSdk {
  addRegisterWidget(parent: Element): RegisterComponent{
    return new RegisterComponent(parent as HTMLElement);
  }
}
