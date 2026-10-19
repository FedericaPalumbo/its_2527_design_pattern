// TurnstilePro SDK (simulato), versione 2.
// Le corsie sono numerate e il contenuto letto arriva in base64. API asincrona.

export interface TpBadgeRead {
  lane: number;
  payload: string;
  readAt: Date;
}

export type TpAction =
  | { lane: number; type: 'UNLOCK'; holdMs: number }
  | { lane: number; type: 'DENY'; message: string };

export class TurnstileProController {
  private readonly handlers: ((read: TpBadgeRead) => Promise<void> | void)[] = [];
  private readonly actions: TpAction[] = [];

  constructor(
    readonly host: string,
    readonly port: number,
  ) {}

  onBadge(handler: (read: TpBadgeRead) => Promise<void> | void): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index >= 0) this.handlers.splice(index, 1);
    };
  }

  async unlock(lane: number, holdMs: number): Promise<void> {
    this.actions.push({ lane, type: 'UNLOCK', holdMs });
  }

  async deny(lane: number, message: string): Promise<void> {
    this.actions.push({ lane, type: 'DENY', message });
  }

  history(lane: number): TpAction[] {
    return this.actions.filter((a) => a.lane === lane);
  }

  // Simulatore: la corsia indicata legge un testo.
  async emulateRead(lane: number, text: string): Promise<void> {
    const read: TpBadgeRead = { lane, payload: Buffer.from(text, 'utf8').toString('base64'), readAt: new Date() };
    for (const handler of this.handlers) {
      await handler(read);
    }
  }
}
