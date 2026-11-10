import { Module } from '@nestjs/common';
import { AlphaPayClient } from '../../vendor/alpha-pay';
import { BetaPayments } from '../../vendor/beta-pay';
import { AlphaPaymentGateway } from './alpha-payment-gateway';
import { AlphaWebhookController } from './alpha-webhook.controller';
import { BetaPaymentGateway } from './beta-payment-gateway';
import { PAYMENT_GATEWAY, type PaymentGateway } from './payment-gateway';

function paymentGateway(): PaymentGateway {
  const provider = process.env.PAYMENT_PROVIDER ?? 'alpha';
  switch (provider) {
    case 'alpha':
      return new AlphaPaymentGateway(new AlphaPayClient(process.env.ALPHA_API_KEY ?? 'sk_test_tickethub'));
    case 'beta':
      return new BetaPaymentGateway(new BetaPayments(process.env.BETA_MERCHANT_ID ?? 'tickethub'));
    default:
      throw new Error(`PAYMENT_PROVIDER non valido: ${provider} (valori ammessi: alpha, beta)`);
  }
}

@Module({
  controllers: [AlphaWebhookController],
  providers: [{ provide: PAYMENT_GATEWAY, useFactory: paymentGateway }],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentsModule {}
