import { ServiceUnavailableException } from '@nestjs/common';
import { BetaError, BetaPayments } from '../../vendor/beta-pay';
import type { PaymentGateway, PaymentRequest, PaymentResult } from './payment-gateway';

export class BetaPaymentGateway implements PaymentGateway {
  constructor(private readonly client: BetaPayments) {}

  async charge({ amount, reference, card }: PaymentRequest): Promise<PaymentResult> {
    try {
      const payment = await this.client.createPayment({
        amount: amount.toFixed(2),
        currencyCode: 'EUR',
        orderRef: reference,
        cardToken: card,
      });
      return { id: payment.id, approved: payment.outcome === 'APPROVED' };
    } catch (err) {
      if (err instanceof BetaError) {
        console.log('[beta] errore', err);
        throw new ServiceUnavailableException('servizio di pagamento non disponibile');
      }
      throw err;
    }
  }

  async refund(paymentId: string, amount: number): Promise<void> {
    try {
      await this.client.reverse(paymentId, { amount: amount.toFixed(2) });
    } catch (err) {
      if (err instanceof BetaError) {
        console.log('[beta] errore rimborso', err);
        throw new ServiceUnavailableException('rimborso non riuscito');
      }
      throw err;
    }
  }
}
