import { ILogger } from '../interfaces/i-logger.interfaces';

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

    if (response.ok) {
      return response.json();
    }

    return null;
  }
}
