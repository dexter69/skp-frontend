export function tworzStanZamowienia(dane = {}) {
  let zamowienie = $state({
    id: dane.id ?? null,
    numer: dane.numer ?? null,
    klient: dane.klient ?? null,
    dataRealizacji: dane.dataRealizacji ?? null,
    ekspresowe: dane.ekspresowe ?? false,
    typKlienta: dane.typKlienta ?? null,
    platnosci: dane.platnosci ?? {},
    daneDoFaktury: dane.daneDoFaktury ?? '',
    uwagi: dane.uwagi ?? '',
    produkty: dane.produkty ?? [],
  });

  return zamowienie;
}