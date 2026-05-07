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

// Tworzy jedną domyślną przesyłkę z wszystkimi produktami w pełnych ilościach.
// Wywoływana przy pierwszym wejściu do sekcji Przesyłki (gdy przesylki = []).
// Adres ustawiany osobno po załadowaniu książki adresowej klienta.
function tworzDomyslnaPrzesylke(produkty) {
  return {
    // Ujemne id = nowa przesyłka (nie zapisana w bazie).
    // Ten sam schemat co dla produktów — zastępowane przez API po zapisie.
    id: -1,
    adres: null,      // null do czasu załadowania książki adresowej klienta
    uwagi: '',
    // Pozycje: każdy produkt z zamówienia w pełnej ilości.
    // produkt_id odpowiada id produktu z listy zamowienie.produkty.
    pozycje: produkty.map(function(p) {
      return {
        produkt_id: p.id,
        nazwa: p.nazwa,           // denormalizacja — gotowe do wyświetlenia w tabeli
        ilosc_zamowiona: p.ilosc, // ile zamówiono — potrzebne do obliczenia "dostępnych"
        ilosc: p.ilosc            // domyślnie: cała ilość trafia do tej przesyłki
      };
    })
  };
}

// Usuwa z przesyłek pozycje powiązane z usuniętym produktem (logika A1).
// Wywoływana przez zaktualizuj() gdy zmienia się lista produktów.
// Nie modyfikuje przesyłek jeśli produkt nie był w żadnej z nich.
function synchronizujPrzesylkiZProduktami(przesylki, produkty) {
  // Zbiór id aktualnych produktów — do szybkiego sprawdzania
  const aktualneId = new Set(produkty.map(function(p) { return p.id; }));

  return przesylki.map(function(przesylka) {
    // Filtrujemy pozycje — zostawiamy tylko te których produkt nadal istnieje
    const nowePozycje = przesylka.pozycje.filter(function(poz) {
      return aktualneId.has(poz.produkt_id);
    });

    // Aktualizujemy ilosc_zamowiona dla produktów których ilość mogła się zmienić
    const zaktualizowanePozycje = nowePozycje.map(function(poz) {
      const produkt = produkty.find(function(p) { return p.id === poz.produkt_id; });
      return Object.assign({}, poz, { ilosc_zamowiona: produkt.ilosc });
    });

    return Object.assign({}, przesylka, { pozycje: zaktualizowanePozycje });
  });
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
    // Lista przesyłek. Pusta przy starcie — SekcjaPrzesylki tworzy domyślną
    // przy pierwszym wejściu do sekcji (gdy klient i produkty są już znane).
    przesylki: dane.przesylki ?? [],
  });

  // Zwracamy reaktywny obiekt — każda zmiana jego pól
  // automatycznie odświeża komponenty które go używają
  return zamowienie;
}

// Eksportujemy pomocnicze funkcje — używane przez SekcjaPrzesylki
export { tworzDomyslnaPrzesylke, synchronizujPrzesylkiZProduktami };
