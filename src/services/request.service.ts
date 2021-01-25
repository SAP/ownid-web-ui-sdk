import { ILogger } from '../interfaces/i-logger.interfaces';
import 'whatwg-fetch';

export default class RequestService {
  constructor(private logger?: ILogger) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async post(url: string, data = {}): Promise<any> {
    this.logger?.logInfo(`request: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',

      body: JSON.stringify(data),
    });

    if (response.status === 200) {
      return response.json();
    }

    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async get(url: string, options?: { headers: { [key: string]: string } }): Promise<any | null> {
    this.logger?.logInfo(`request: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      ...options,
    });

    if (response.status === 200) {
      return response.json();
    }

    return null;
  }
}
