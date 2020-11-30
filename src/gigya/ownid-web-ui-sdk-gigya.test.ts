import OwnIDUiSdkGigya from './ownid-web-ui-sdk-gigya';

describe('OwnIDUiSdkGigya instances test', () => {
  let sdk: OwnIDUiSdkGigya;

  // eslint-disable-next-line no-console
  console.error = jest.fn();

  beforeEach(() => {
    sdk = new OwnIDUiSdkGigya();
  });

  it('OwnIDUiSdkGigya is instantiable', () => {
    expect(sdk).toBeInstanceOf(OwnIDUiSdkGigya);
  });
});
