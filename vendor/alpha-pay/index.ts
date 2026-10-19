// AlphaPay SDK (simulato), versione 3.2.
// Importi in centesimi di euro.
// Carte di prova:
//   4242424242424242  addebito riuscito
//   4000000000000002  addebito rifiutato
//   4000000000000119  la prima chiamata di ogni client va in timeout
import { createHmac } from 'node:crypto';

export interface AlphaChargeRequest {
  amountCents: number;
  currency: 'EUR';
  reference: string;
  card: string;
}

export interface AlphaCharge {
  chargeId: string;
  status: 'succeeded' | 'declined';
  amountCents: number;
  reference: string;
}

export interface AlphaRefund {
  refundId: string;
  chargeId: string;
  amountCents: number;
}

export class AlphaTimeoutError extends Error {
  constructor() {
    super('AlphaPay: timeout');
    this.name = 'AlphaTimeoutError';
  }
}

export class AlphaApiError extends Error {
  constructor(message: string) {
    super(`AlphaPay: ${message}`);
    this.name = 'AlphaApiError';
  }
}

let chargeSeq = 0;
let refundSeq = 0;
const charges = new Map<string, AlphaCharge>();

export class AlphaPayClient {
  private calls = 0;

  constructor(private readonly apiKey: string) {
    if (!apiKey.startsWith('sk_')) {
      throw new AlphaApiError('chiave API non valida');
    }
  }

  async charge(req: AlphaChargeRequest): Promise<AlphaCharge> {
    this.calls++;
    if (req.card === '4000000000000119' && this.calls === 1) {
      throw new AlphaTimeoutError();
    }
    if (!Number.isInteger(req.amountCents) || req.amountCents <= 0) {
      throw new AlphaApiError('importo non valido');
    }
    chargeSeq++;
    const charge: AlphaCharge = {
      chargeId: `ch_${String(chargeSeq).padStart(6, '0')}`,
      status: req.card === '4000000000000002' ? 'declined' : 'succeeded',
      amountCents: req.amountCents,
      reference: req.reference,
    };
    charges.set(charge.chargeId, charge);
    return charge;
  }

  async refund(chargeId: string, amountCents: number): Promise<AlphaRefund> {
    this.calls++;
    const charge = charges.get(chargeId);
    if (!charge || charge.status !== 'succeeded') {
      throw new AlphaApiError('addebito non rimborsabile');
    }
    if (amountCents > charge.amountCents) {
      throw new AlphaApiError("importo superiore all'addebito");
    }
    refundSeq++;
    return { refundId: `re_${String(refundSeq).padStart(6, '0')}`, chargeId, amountCents };
  }
}

export interface AlphaWebhookEvent {
  type: 'charge.refunded' | 'charge.disputed';
  chargeId: string;
}

export const AlphaWebhook = {
  sign(event: AlphaWebhookEvent, secret: string): string {
    return createHmac('sha256', secret).update(JSON.stringify(event)).digest('hex');
  },

  verify(event: AlphaWebhookEvent, signature: string, secret: string): boolean {
    return AlphaWebhook.sign(event, secret) === signature;
  },
};
