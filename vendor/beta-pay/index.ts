// BetaPayments SDK (simulato), versione 1.0.
// Importi come stringhe decimali con due cifre ("12.50").
// Token carta di prova:
//   tok_ok      pagamento approvato
//   tok_refuse  pagamento rifiutato
import { createHash } from 'node:crypto';

export interface BetaPaymentInput {
  amount: string;
  currencyCode: 'EUR';
  orderRef: string;
  cardToken: string;
}

export interface BetaPayment {
  id: string;
  outcome: 'APPROVED' | 'REFUSED';
  amount: string;
  orderRef: string;
}

export interface BetaReversal {
  id: string;
  paymentId: string;
  amount: string;
}

export type BetaErrorCode = 'INVALID_AMOUNT' | 'NOT_FOUND' | 'NOT_REVERSIBLE';

export class BetaError extends Error {
  constructor(
    readonly code: BetaErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'BetaError';
  }
}

let seq = 0;
const payments = new Map<string, BetaPayment>();

export class BetaPayments {
  constructor(private readonly merchantId: string) {}

  async createPayment(input: BetaPaymentInput): Promise<BetaPayment> {
    if (!/^\d+\.\d{2}$/.test(input.amount)) {
      throw new BetaError('INVALID_AMOUNT', `importo non valido: ${input.amount}`);
    }
    seq++;
    const payment: BetaPayment = {
      id: `BP-${this.merchantId}-${seq}`,
      outcome: input.cardToken === 'tok_refuse' ? 'REFUSED' : 'APPROVED',
      amount: input.amount,
      orderRef: input.orderRef,
    };
    payments.set(payment.id, payment);
    return payment;
  }

  async reverse(paymentId: string, options: { amount: string }): Promise<BetaReversal> {
    const payment = payments.get(paymentId);
    if (!payment) {
      throw new BetaError('NOT_FOUND', `pagamento ${paymentId} inesistente`);
    }
    if (payment.outcome !== 'APPROVED') {
      throw new BetaError('NOT_REVERSIBLE', 'pagamento non stornabile');
    }
    seq++;
    return { id: `BR-${seq}`, paymentId, amount: options.amount };
  }
}

export interface BetaNotification {
  kind: 'REVERSAL' | 'CHARGEBACK';
  paymentId: string;
}

export const BetaSignature = {
  compute(notification: BetaNotification, secretKey: string, timestamp: string): string {
    return createHash('sha256')
      .update(`${timestamp}.${JSON.stringify(notification)}.${secretKey}`)
      .digest('base64');
  },

  check(
    headers: Record<string, string | undefined>,
    notification: BetaNotification,
    secretKey: string,
  ): boolean {
    const timestamp = headers['x-beta-timestamp'];
    const signature = headers['x-beta-signature'];
    if (!timestamp || !signature) return false;
    return BetaSignature.compute(notification, secretKey, timestamp) === signature;
  },
};
