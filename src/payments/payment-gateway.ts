export interface PaymentRequest {
  /** Importo in euro */
  amount: number;
  reference: string;
  /** Numero di carta (Alpha) o token carta (Beta), così come arriva dal client */
  card: string;
}

export interface PaymentResult {
  /** Identificativo del pagamento presso il provider */
  id: string;
  approved: boolean;
}

export interface PaymentGateway {
  charge(request: PaymentRequest): Promise<PaymentResult>;
  refund(paymentId: string, amount: number): Promise<void>;
}

export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';
