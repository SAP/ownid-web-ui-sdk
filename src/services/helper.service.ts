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
