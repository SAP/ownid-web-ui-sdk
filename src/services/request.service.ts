import { ILogger } from '../interfaces/i-logger.interfaces';

export default class RequestService {
  constructor(private logger?: ILogger) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async post(url: string, data = {}): Promise<any> {
    this.logger?.logInfo(`request: ${url}`);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    return new Promise((resolve) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return;
        }

        if (xhr.status !== 200) {
          // eslint-disable-next-line no-console
          console.error(`${xhr.status}: ${xhr.statusText}`);
          resolve(null);
        } else {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('not JSON response', xhr.responseText, error);
            resolve(xhr.responseText);
          }
        }
      };

      xhr.send(JSON.stringify(data));
    });
  }
}
