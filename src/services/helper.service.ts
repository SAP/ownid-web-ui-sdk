export function validateUrl(url: string): boolean {
  const regex = /^https?:\/\/.+/;

  return regex.test(url);
}
