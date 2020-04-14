import {BaseComponent} from "./base.component";
import LinkButton from "./common/link-button.component";
import Qr from "./common/qr.component";
import ConfigurationService from "../services/configuration.service";


export default class LoginComponent extends BaseComponent{
  constructor(parent: HTMLElement) {
    super(parent);
    this.render();
  }

  private render(): void{
    // get application URL
    if(this.isMobile()) {
      const button = new LinkButton({href: ConfigurationService.webApplicationUrl, className: 'link-button', textContent: 'Sign In without password'});
      this.addChild(button);
    }
    else
      this.addChild(new Qr({className: 'qr'}));
  }

  // logged in Handle & logic
}
