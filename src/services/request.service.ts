import { ILogger } from '../interfaces/i-logger.interfaces';
import 'whatwg-fetch'

export default class RequestService {
  constructor(private logger?: ILogger) {}

  public async post(url: string, data = {}) {
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
}
