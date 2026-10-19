// Sconto fedeltà: 1 euro ogni 100 punti, massimo il 20% del totale.
// Usato dalla vecchia app mobile.
export function applyLoyaltyDiscount(total: number, points: number): number {
  const discount = Math.floor(points / 100);
  const max = total * 0.2;
  return total - Math.min(discount, max);
}

export function loyaltyPointsFor(total: number): number {
  return Math.floor(total / 10);
}
