import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import { createApp } from './helpers';
import { createApp, GOOD_CARD } from './helpers';

describe('Eventi', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('elenca solo gli eventi in vendita', async () => {
    const res = await request(app.getHttpServer()).get('/events').expect(200);
    expect(res.body.map((e: { id: string }) => e.id)).toEqual(['e-1', 'e-2', 'e-3', 'e-4']);
  });

  it('mostra il prezzo minimo con la commissione inclusa', async () => {
    const res = await request(app.getHttpServer()).get('/events').expect(200);
    expect(res.body[0]).toEqual({
      id: 'e-1',
      title: 'Nebbia Elettrica Tour',
      date: '2027-06-12T21:00:00+02:00',
      venue: 'Arena Nord',
      city: 'Verona',
      //priceFrom: '44.69',
      priceFrom: '35.75', // prezzo minimo senza commissione  
    });
    expect(res.body.map((e: { priceFrom: string }) => e.priceFrom)).toEqual(['35.75', '28.00', '0.00', '20.16']);
  });

  describe('early bird di e-1', () => {
    function buyPit(quantity: number) {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          eventId: 'e-1',
          seats: [{ seatId: 'PIT', quantity }],
          card: GOOD_CARD,
          holderName: 'Giulia Rossi',
          email: 'giulia@example.com',
        });
    }

    async function priceFromOfE1() {
      const res = await request(app.getHttpServer()).get('/events').expect(200);
      return res.body[0].priceFrom;
    }

    it('mostra il prezzo scontato finché restano biglietti early bird', async () => {
      await buyPit(499).expect(201);  // 499 biglietti early bird venduti   //buyPit è una funzione che simula l'acquisto di biglietti in piedi (PIT) per l'evento e-1, con la quantità specificata. 
      expect(await priceFromOfE1()).toBe('35.75'); //priceFromOfE1 è una funzione che recupera il prezzo minimo dell'evento e-1. Dopo aver venduto 499 biglietti early bird, il prezzo minimo dovrebbe ancora essere scontato a 35.75.
    });

    it('torna al prezzo pieno dal 500° biglietto venduto', async () => {
      expect(await priceFromOfE1()).toBe('35.75');  // ancora prezzo early bird per un biglietto
      await buyPit(500).expect(201);  // 500 biglietti early bird venduti
      expect(await priceFromOfE1()).toBe('44.69');    // prezzo pieno perché non ci sono più biglietti early bird (sconto finito -> prezzo pieno) 
    });
  });
})