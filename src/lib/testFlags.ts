class TestFlags {
  public queryParams: { [key: string]: string };

  private isValueExplicitlyFalse = (value: string) =>
    ['false', '0', 'no', 'off'].includes(value.toLowerCase());

  private booleanFlag = (value?: string, defaultTrue?: boolean) => {
    if (!value) return defaultTrue ?? false;
    return !this.isValueExplicitlyFalse(value);
  };

  constructor() {
    this.queryParams = {};

    if (import.meta.env.VITE_ROUTER_TYPE === 'hash') {
      const hash = window.location.hash;
      const queryIndex = hash.indexOf('?');
      if (queryIndex === -1) return;

      const queryParamsString = hash.substring(queryIndex + 1);
      const params = new URLSearchParams(queryParamsString);

      params.forEach((value, key) => {
        this.queryParams[key.toLowerCase()] = value;
      });
    } else {
      const params = new URLSearchParams(window.location.search);

      params.forEach((value, key) => {
        this.queryParams[key.toLowerCase()] = value;
      });
    }
  }

  get displayInitializingMarkets() {
    return this.booleanFlag(this.queryParams.displayinitializingmarkets);
  }

  get addressOverride(): string | undefined {
    return this.queryParams.address;
  }

  get enableVaults() {
    return true;
  }

  get referrer() {
    return this.queryParams.utm_source;
  }

  get pml() {
    return true;
  }

  get showLimitClose() {
    return this.booleanFlag(this.queryParams.limitclose);
  }

  get referralCode() {
    return this.queryParams.ref;
  }

  get enableStaticTyping() {
    return true;
  }

  get uiRefresh() {
    return true;
  }

  get onboardingRewrite() {
    return !!this.queryParams.onboarding_rewrite;
  }

  get showInstantDepositToggle() {
    return !!this.queryParams.funkit_toggle;
  }
}

export const testFlags = new TestFlags();
