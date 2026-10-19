// Gatekeeper SDK (simulato), controllo varchi.
// Il simulatore hardware chiama la callback registrata quando un varco legge un codice.

export interface GkScanEvent {
  gate: string;
  raw: string;
  ts: number;
}

export type GkDecision = { gate: string; action: 'open' } | { gate: string; action: 'reject'; code: number };

export const GK_REJECT_INVALID = 12;
export const GK_REJECT_ALREADY_USED = 21;
export const GK_REJECT_VOID = 22;

export class Gatekeeper {
  private readonly handlers = new Map<string, (event: GkScanEvent) => void>();
  private readonly decisions = new Map<string, GkDecision>();

  constructor(readonly options: { site: string }) {}

  connect(gate: string, onScan: (event: GkScanEvent) => void): void {
    this.handlers.set(gate, onScan);
  }

  open(gate: string): void {
    this.decisions.set(gate, { gate, action: 'open' });
  }

  reject(gate: string, code: number): void {
    this.decisions.set(gate, { gate, action: 'reject', code });
  }

  lastDecision(gate: string): GkDecision | undefined {
    return this.decisions.get(gate);
  }

  // Simulatore: il varco indicato legge un codice.
  simulate(gate: string, raw: string): void {
    const handler = this.handlers.get(gate);
    if (!handler) {
      throw new Error(`Gatekeeper: varco ${gate} non collegato`);
    }
    this.decisions.delete(gate);
    handler({ gate, raw, ts: Date.now() });
  }
}
