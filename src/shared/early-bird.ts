// Regole dello sconto early bird di "Nebbia Elettrica Tour".
// Il conteggio conta i biglietti emessi, annullati compresi: un annullamento non libera il posto scontato.

export const EARLY_BIRD_EVENT_ID = 'e-1';
export const EARLY_BIRD_LIMIT = 500;
export const EARLY_BIRD_DISCOUNT_PERCENT = 20;

// Prezzo di settore scontato, arrotondato al centesimo. La commissione si applica dopo, sul prezzo scontato.
export function applyEarlyBirdDiscount(price: number): number {
    return Math.round(price * (100 - EARLY_BIRD_DISCOUNT_PERCENT)) / 100;
}

// Lo sconto è ancora attivo se i biglietti emessi non hanno raggiunto la soglia.
export function isEarlyBirdActive(eventId: string, issuedCount: number): boolean {
    return eventId === EARLY_BIRD_EVENT_ID && issuedCount < EARLY_BIRD_LIMIT;
}

// Prezzo di un singolo biglietto. `ordinal` è la posizione di vendita, a partire da 1
// (emessi prima dell'ordine + indice del posto nell'ordine + 1).
export function earlyBirdPrice(eventId: string, basePrice: number, ordinal: number): number {
    const eligible = eventId === EARLY_BIRD_EVENT_ID && ordinal <= EARLY_BIRD_LIMIT;
    return eligible ? applyEarlyBirdDiscount(basePrice) : basePrice;
}