export function validateUrl(url: string): boolean {
  const regex = /^https?:\/\/.+/;

  return regex.test(url);
}

export function find<T>(collection: T[], predicate: (item: T, index: number, collection: T[]) => boolean): T | null {
  const { length } = collection;
  for (let i = 0; i < length; i++) {
    const element = collection[i];
    if (predicate.call(null, element, i, collection)) {
      return element;
    }
  }

  return null;
}

export function findIndex<T>(collection: T[], predicate: (item: T, index: number, collection: T[]) => boolean): number {
  const { length } = collection;
  for (let i = 0; i < length; i++) {
    const element = collection[i];
    if (predicate.call(null, element, i, collection)) {
      return i;
    }
  }

  return -1;
}

export function setCookie(name: string, value: string, lifetime?: number): void {
  let expires = '';
  if (lifetime) {
    const date = new Date();
    date.setTime(date.getTime() + lifetime);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Strict`;
}

export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');

  // eslint-disable-next-line no-restricted-syntax
  for (let c of ca) {
    while (c.charAt(0) === ' ') c = c.slice(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.slice(nameEQ.length, c.length);
  }
  return null;
}
