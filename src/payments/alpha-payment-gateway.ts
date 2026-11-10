import { ServiceUnavailableException } from '@nestjs/common';
import { AlphaPayClient, AlphaTimeoutError } from '../../vendor/alpha-pay';
import type { PaymentGateway, PaymentRequest, PaymentResult } from './payment-gateway';

export class AlphaPaymentGateway implements PaymentGateway {
  constructor(private readonly client: AlphaPayClient) {}

  async charge({ amount, reference, card }: PaymentRequest): Promise<PaymentResult> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[alpha] addebito tentativo ${attempt} ${reference} ${amount}`);
        const charge = await this.client.charge({
          amountCents: Math.round(amount * 100),
          currency: 'EUR',
          reference,
          card,
        });
        console.log(`[alpha] esito ${charge.status} ${charge.chargeId}`);
        return { id: charge.chargeId, approved: charge.status === 'succeeded' };
      } catch (err) {
        if (err instanceof AlphaTimeoutError && attempt < 3) {
          console.log('[alpha] timeout, riprovo');
          continue;
        }
        console.log('[alpha] errore', err);
        throw new ServiceUnavailableException('servizio di pagamento non disponibile');
      }
    }
    throw new ServiceUnavailableException('servizio di pagamento non disponibile');
  }

  async refund(paymentId: string, amount: number): Promise<void> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[alpha] rimborso tentativo ${attempt} ${paymentId}`);
        await this.client.refund(paymentId, Math.round(amount * 100));
        return;
      } catch (err) {
        if (err instanceof AlphaTimeoutError) {
          console.log('[alpha] timeout rimborso');
          continue;
        }
        throw new ServiceUnavailableException('rimborso non riuscito');
      }
    }
    throw new ServiceUnavailableException('rimborso non riuscito');
  }
}
