declare module '@cashfreepayments/cashfree-js' {
  interface LoadOptions {
    mode: 'sandbox' | 'production';
  }

  interface CheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_top' | '_parent' | string;
  }

  interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<{ error?: unknown; paymentDetails?: unknown }>;
  }

  export function load(options: LoadOptions): Promise<CashfreeInstance>;
}
