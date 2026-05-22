// +layout.js — ładuje dane zamówienia dla widoku edycji.
// Funkcja load() jest wywoływana przez SvelteKit przed renderowaniem layoutu.
// Na razie zwraca mock — docelowo fetch do CakePHP API na podstawie params.id.
//
// Dane trafiają do +layout.svelte przez $props() jako `data`.

import { znajdzKlienta } from '$lib/api/mockDane.js';

export async function load({ params }) {
  // TODO: zastąpić fetch do API:
  // const res = await fetch(`/api/zamowienia/${params.id}`);
  // const zamowienie = await res.json();
  // return { zamowienie };

  // Mock — symuluje odpowiedź API dla zamówienia z wybranym klientem.
  // Klient id: 2 (Zakład Produkcyjny XYZ) — ma dwa adresy, dobry do testowania.
  const klient = znajdzKlienta(2);

  return {
    zamowienie: {
      id: params.id,
      // klient: klient,
      klient: null,
      produkty: [
        { id: -1, nazwa: 'Karty wizytowe', ilosc: 500, cena: 2.69 },
        { id: -2, nazwa: 'Ulotki A5', ilosc: 500, cena: 1.20 },
      ],
    }
  };
}
