import LoginComponent from "./login.component";

interface IMyNavigator extends Navigator {
  userAgent: string;
}

declare let navigator: IMyNavigator;

Object.defineProperty(navigator, "userAgent", ((value) => ({
  bValue: value,
  get() { return this.bValue; },
  set(v: string) { this.bValue = v; }
}))(navigator.userAgent));

describe('ctor-> render', ()=>{
  it('mobi', ()=> {
    navigator.userAgent = 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

    const parent = document.createElement('div');
    document.body.append(parent);

    const loginComponent = new LoginComponent(parent);

    // just to disable linter
    expect(loginComponent).not.toBeNull();
    expect(parent.children.length).toBe(1);
    expect(parent.children[0].tagName.toLowerCase()).toEqual('a');
    expect(parent.children[0].className).toEqual('link-button');
  });

  it('desktop', ()=> {
    navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';

    const parent = document.createElement('div');
    document.body.append(parent);

    const loginComponent = new LoginComponent(parent);

    // just to disable linter
    expect(loginComponent).not.toBeNull();
    expect(parent.children.length).toBe(1);
    expect(parent.children[0].tagName.toLowerCase()).toEqual('button');
    expect(parent.children[0].className).toEqual('qr');
  });
});
