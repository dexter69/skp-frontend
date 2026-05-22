// mockDane.js — centralne źródło danych mockowych dla developmentu.
// Docelowo dane będą pobierane z CakePHP API.
// Importowany przez +layout.js (dane zamówienia) i WyborKlienta.svelte (wyszukiwanie klientów).

// Lista klientów z adresami.
// Każdy klient ma co najmniej jeden adres.
// Adres z typ: 'domyslny' jest pokazywany domyślnie w panelu szczegółów przesyłki.
export const MOCK_KLIENCI = [
  {
    id: 1,
    nazwa: 'Firma ABC Sp. z o.o.',
    adresy: [
      {
        id: 101,
        typ: 'domyslny',
        nazwa: 'Firma ABC Sp. z o.o.',
        ulica: 'ul. Marszałkowska 10',
        kodPocztowy: '00-001',
        miasto: 'Warszawa',
      },
    ],
  },
  {
    id: 2,
    nazwa: 'Zakład Produkcyjny XYZ',
    adresy: [
      {
        id: 201,
        typ: 'domyslny',
        nazwa: 'Zakład Produkcyjny XYZ',
        ulica: 'ul. Przemysłowa 5',
        kodPocztowy: '30-001',
        miasto: 'Kraków',
      },
      {
        id: 202,
        typ: 'do_faktury',
        nazwa: 'XYZ Biuro Rachunkowe',
        ulica: 'ul. Księgowa 3',
        kodPocztowy: '30-002',
        miasto: 'Kraków',
      },
    ],
  },
  {
    id: 3,
    nazwa: 'Sklepy Kowalski S.A.',
    adresy: [
      {
        id: 301,
        typ: 'domyslny',
        nazwa: 'Sklepy Kowalski — Centrala',
        ulica: 'ul. Główna 1',
        kodPocztowy: '60-001',
        miasto: 'Poznań',
      },
      {
        id: 302,
        typ: 'siedziba',
        nazwa: 'Sklepy Kowalski S.A.',
        ulica: 'ul. Rejestrowa 7',
        kodPocztowy: '60-002',
        miasto: 'Poznań',
      },
      {
        id: 303,
        typ: 'dostawa',
        nazwa: 'Sklep Kowalski — Oddział Wrocław',
        ulica: 'ul. Świdnicka 15',
        kodPocztowy: '50-001',
        miasto: 'Wrocław',
      },
    ],
  },
];

// Zwraca klienta po id lub null gdy nie znaleziono.
export function znajdzKlienta(id) {
  return MOCK_KLIENCI.find(function(k) { return k.id === id; }) ?? null;
}

// Zwraca domyślny adres klienta lub pierwszy z listy gdy brak domyślnego.
export function pobierzDomyslnyAdres(klient) {
  if (!klient || !klient.adresy || klient.adresy.length === 0) return null;
  return klient.adresy.find(function(a) { return a.typ === 'domyslny'; })
    ?? klient.adresy[0];
}
