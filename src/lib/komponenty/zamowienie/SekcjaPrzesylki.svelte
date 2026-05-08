<script>
  import { getContext, tick } from "svelte";
  import TabelaPrzesylek from "./TabelaPrzesylek.svelte";

  // Pobieramy stan zamówienia z contextu.
  const { dane, zaktualizuj } = getContext("zamowienie");

  // id aktywnej przesyłki — która kolumna jest wyróżniona i której szczegóły są widoczne.
  // Inicjalizujemy od razu id pierwszej przesyłki — layout gwarantuje że lista nie jest pusta.
  let aktywnaId = $state(dane().przesylki[0]?.id ?? null);

  // Referencja do panelu szczegółów — potrzebna do auto-scroll po kliknięciu.
  let refSzczegoly = $state(null);

  // Oblicza ile każdego produktu jest jeszcze "dostępne" (nie przypisane do żadnej przesyłki).
  // Wynik: mapa { produkt_id → dostępna_ilość }.
  function obliczDostepne() {
    const dostepne = {};
    dane().produkty.forEach(function(p) {
      dostepne[p.id] = p.ilosc;
    });
    dane().przesylki.forEach(function(przesylka) {
      przesylka.pozycje.forEach(function(poz) {
        if (dostepne[poz.produkt_id] !== undefined) {
          dostepne[poz.produkt_id] -= poz.ilosc;
        }
      });
    });
    return dostepne;
  }

  // Czy można dodać nową przesyłkę?
  function moznaUtworzycPrzesylke() {
    const dostepne = obliczDostepne();
    return Object.values(dostepne).some(function(ilosc) { return ilosc > 0; });
  }

  // Dodaje nową przesyłkę z dostępnymi ilościami produktów.
  function dodajPrzesylke() {
    if (!moznaUtworzycPrzesylke()) return;

    const dostepne = obliczDostepne();
    const minId = dane().przesylki.reduce(function(min, p) {
      return p.id < min ? p.id : min;
    }, 0);
    const noweId = minId - 1;

    const nowaPrzesylka = {
      id: noweId,
      adres: null,
      uwagi: '',
      pozycje: dane().produkty
        .filter(function(p) { return dostepne[p.id] > 0; })
        .map(function(p) {
          return {
            produkt_id: p.id,
            ilosc: dostepne[p.id]
          };
        })
    };

    zaktualizuj({ przesylki: [...dane().przesylki, nowaPrzesylka] });
    aktywnaId = noweId;
  }

  // Usuwa przesyłkę o podanym id. Zawsze zostaje przynajmniej jedna.
  function usunPrzesylke(id) {
    if (dane().przesylki.length <= 1) return;
    const nowe = dane().przesylki.filter(function(p) { return p.id !== id; });
    zaktualizuj({ przesylki: nowe });
    if (aktywnaId === id) {
      aktywnaId = nowe[0].id;
    }
  }

  // Aktywuje przesyłkę i scrolluje do panelu szczegółów.
  async function aktywujPrzesylke(id) {
    aktywnaId = id;
    await tick();
    if (refSzczegoly) {
      refSzczegoly.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Aktualizuje dane konkretnej przesyłki (adres, uwagi, pozycje).
  function zaktualizujPrzesylke(id, zmiany) {
    const nowe = dane().przesylki.map(function(p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, zmiany);
    });
    zaktualizuj({ przesylki: nowe });
  }

  // Aktualizuje ilość produktu w zamówieniu (kolumna "Zamów." w tabeli).
  // Zmiana trafia do zamowienie.produkty — single source of truth.
  function zmienIloscProduktu(produktId, ilosc) {
    const nowe = dane().produkty.map(function(p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { ilosc: ilosc });
    });
    zaktualizuj({ produkty: nowe });
  }

  // Aktualizuje nazwę produktu w zamówieniu (kolumna "Produkt" w tabeli).
  // Zmiana trafia do zamowienie.produkty — single source of truth.
  function zmienNazweProduktu(produktId, nazwa) {
    const nowe = dane().produkty.map(function(p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { nazwa: nazwa });
    });
    zaktualizuj({ produkty: nowe });
  }
</script>

<!-- Zewnętrzny kontener sekcji — wypełnia całą dostępną przestrzeń PG. -->
<div class="flex h-full min-h-0 flex-col">

  <div class="flex min-h-0 flex-1 flex-col gap-6 p-6">

    <TabelaPrzesylek
      produkty={dane().produkty}
      przesylki={dane().przesylki}
      {aktywnaId}
      moznaUtworzycPrzesylke={moznaUtworzycPrzesylke()}
      onAktywuj={aktywujPrzesylke}
      onDodaj={dodajPrzesylke}
      onZmianaIlosci={(przesylkaId, produktId, ilosc) => {
        const nowe = dane().przesylki.map(function(p) {
          if (p.id !== przesylkaId) return p;
          const nowePozycje = p.pozycje.map(function(poz) {
            if (poz.produkt_id !== produktId) return poz;
            return Object.assign({}, poz, { ilosc: ilosc });
          });
          return Object.assign({}, p, { pozycje: nowePozycje });
        });
        zaktualizuj({ przesylki: nowe });
      }}
      onZmianaIlosciProduktu={zmienIloscProduktu}
      onZmianaUazwyProduktu={zmienNazweProduktu}
    />

    <!-- Panel szczegółów aktywnej przesyłki.
         flex-none: nie kurczy się na rzecz tabeli.
         max-h-[300px] overflow-y-auto: zabezpieczenie na ekrany 768p. -->
    {#if aktywnaId !== null}
      <div
        bind:this={refSzczegoly}
        class="flex-none overflow-y-auto rounded-lg bg-white shadow-sm max-h-[300px]"
      >
        <div class="p-4 text-sm text-text-secondary">
          [Szczegóły przesyłki {aktywnaId} — TODO]
        </div>
      </div>
    {/if}

  </div>
</div>
