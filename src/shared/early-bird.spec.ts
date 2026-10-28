import {
    EARLY_BIRD_LIMIT,
    applyEarlyBirdDiscount,
    earlyBirdPrice,
    isEarlyBirdActive,
} from './early-bird';

describe('early bird', () => {
    it('toglie il 20% arrotondando al centesimo', () => {
        expect(applyEarlyBirdDiscount(49.9)).toBe(39.92);
        expect(applyEarlyBirdDiscount(69.9)).toBe(55.92);
        expect(applyEarlyBirdDiscount(39.9)).toBe(31.92);
    });

    it('è attivo solo su e-1 e finché i biglietti emessi sono meno di 500', () => {
        expect(isEarlyBirdActive('e-1', 0)).toBe(true);
        expect(isEarlyBirdActive('e-1', EARLY_BIRD_LIMIT - 1)).toBe(true);
        expect(isEarlyBirdActive('e-1', EARLY_BIRD_LIMIT)).toBe(false);
        expect(isEarlyBirdActive('e-2', 0)).toBe(false);
    });

    it('sconta fino al 500° biglietto compreso, dal 501° è prezzo pieno', () => {
        expect(earlyBirdPrice('e-1', 69.9, 500)).toBe(55.92);
        expect(earlyBirdPrice('e-1', 69.9, 501)).toBe(69.9);
    });

    it('non tocca gli altri eventi', () => {
        expect(earlyBirdPrice('e-2', 69.9, 1)).toBe(69.9);
    });
});