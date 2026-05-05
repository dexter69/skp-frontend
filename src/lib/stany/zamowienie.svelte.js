// Stan zamówienia — osobny plik żeby nie rozrastał się [id]/+layout.svelte.
// Używa rozszerzenia .svelte.js (nie .js) bo korzysta z reaktywności Svelte ($state).
// Plik .js nie obsługuje $state poza komponentami — .svelte.js tak.

export function tworzStanZamowienia(dane = {}) {
  // Operator ?? (nullish coalescing) — używa wartości z 'dane' jeśli istnieje,
  // w przeciwnym razie ustawia wartość domyślną.
  // Przykład: dane.id = 123 → zamowienie.id = 123
  //           dane.id = undefined → zamowienie.id = null
  let zamowienie = $state({
    id: dane.id ?? null,                    // id zamówienia w bazie
    numer: dane.numer ?? null,              // numer zamówienia (np. '256/26 MS') — null gdy szkic
    klient: dane.klient ?? null,            // wybrany klient — null gdy nie wybrano
    dataRealizacji: dane.dataRealizacji ?? null,
    ekspresowe: dane.ekspresowe ?? false,   // czy zamówienie ekspresowe
    typKlienta: dane.typKlienta ?? null,    // 'nowy' lub 'stały' — null gdy nie wybrano
    platnosci: dane.platnosci ?? {},        // szczegóły płatności (do rozwinięcia)
    daneDoFaktury: dane.daneDoFaktury ?? '',
    uwagi: dane.uwagi ?? '',
    produkty: dane.produkty ?? [],          // lista produktów w zamówieniu
  });

  // Zwracamy reaktywny obiekt — każda zmiana jego pól
  // automatycznie odświeża komponenty które go używają
  return zamowienie;
}