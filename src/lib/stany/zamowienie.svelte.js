// Stan zamówienia — osobny plik żeby nie rozrastał się [id]/+layout.svelte.
// Używa rozszerzenia .svelte.js (nie .js) bo korzysta z reaktywności Svelte ($state).
// Plik .js nie obsługuje $state poza komponentami — .svelte.js tak.

// Zwraca datę przesuniętą o podaną liczbę dni roboczych (pon–pt) od daty startowej.
// Wynik w formacie YYYY-MM-DD — format wymagany przez <input type="date">.
// Święta nie są uwzględniane — pomijamy tylko weekendy.
function dodajDniRobocze(dataStart, dni) {
  let wynik = new Date(dataStart);
  let dodane = 0;
  while (dodane < dni) {
    wynik.setDate(wynik.getDate() + 1);
    const dzienTygodnia = wynik.getDay();
    if (dzienTygodnia !== 0 && dzienTygodnia !== 6) {
      dodane++;
    }
  }
  return wynik.toISOString().split('T')[0];
}

export function tworzStanZamowienia(dane = {}) {
  // Operator ?? (nullish coalescing) — używa wartości z 'dane' jeśli istnieje,
  // w przeciwnym razie ustawia wartość domyślną.
  // Przykład: dane.id = 123 → zamowienie.id = 123
  //           dane.id = undefined → zamowienie.id = null
  let zamowienie = $state({
    id: dane.id ?? null,                    // id zamówienia w bazie
    numer: dane.numer ?? null,              // numer zamówienia (np. '256/26 MS') — null gdy szkic
    klient: dane.klient ?? null,            // wybrany klient — null gdy nie wybrano
    // Domyślna data realizacji: dziś + 10 dni roboczych (bez weekendów).
    // Dla istniejącego zamówienia — data z bazy. Dla nowego — obliczona automatycznie.
    dataRealizacji: dane.dataRealizacji ?? dodajDniRobocze(new Date(), 10),
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