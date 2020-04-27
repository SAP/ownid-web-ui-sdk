export default class RequestService {
  public async post(url: string, data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',

      body: JSON.stringify(data)
    });

    if (response.ok) {
      return response.json();
    }

    return null;
  }
}
