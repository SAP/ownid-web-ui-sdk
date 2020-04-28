export enum WidgetType {
  Register = 'register',
  Login = 'login',
}

export interface IWidgetConfig {
  element: HTMLElement;
  type: WidgetType
  getContextURL?: string;
  getStatusURL?: string;
  mobileTitle?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  statusInterval?: number;
  onLogin?: (response: object) => void
  onRegister?: (response: object) => void
}
