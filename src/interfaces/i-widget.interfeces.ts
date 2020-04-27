export enum WidgetType {
  Register = 'register',
  Login = 'login',
}

export interface IWidgetConfig {
  element: HTMLElement;
  type: WidgetType
  getContextURL?: string;
  mobileTitle?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
}
