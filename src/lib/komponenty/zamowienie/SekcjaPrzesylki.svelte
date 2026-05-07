<script>
  import { getContext, tick } from "svelte";
  import {
    tworzDomyslnaPrzesylke,
    synchronizujPrzesylkiZProduktami,
  } from "$lib/stany/zamowienie.svelte.js";
  import TabelaPrzesylek from "./TabelaPrzesylek.svelte";

  // Pobieramy stan zamówienia z contextu — dane() i zaktualizuj() jak w sekcji 1.
  const { dane, zaktualizuj } = getContext("zamowienie");

  // id aktywnej przesyłki — która kolumna jest wyróżniona i której szczegóły są widoczne.
  // null = żadna nie jest wybrana (stan początkowy przed kliknięciem).
  let aktywnaId = $state(null);

  // Referencja do panelu szczegółów — potrzebna do auto-scroll po kliknięciu.
  let refSzczegoly = $state(null);

  // Przy pierwszym renderowaniu: jeśli przesyłki są puste, tworzymy domyślną.
  // $effect.pre odpala się przed pierwszym renderem — unikamy migotania pustego stanu.
  // Używamy $effect (nie callback) bo to reakcja na mount, nie na zdarzenie użytkownika.
  $effect(() => {
    if (dane().przesylki.length === 0 && dane().produkty.length > 0) {
      const domyslna = tworzDomyslnaPrzesylke(dane().produkty);
      zaktualizuj({ przesylki: [domyslna] });
      aktywnaId = domyslna.id;
    }
  });

  // Oblicza ile każdego produktu jest jeszcze "dostępne" (nie przypisane do żadnej przesyłki).
  // Wynik: mapa { produkt_id → dostępna_ilość }.
  // Używane przez tabelę (kolumna "Dostępne") i przez logikę dodawania przesyłki.
  function obliczDostepne() {
    const dostepne = {};

    // Startujemy od pełnej ilości każdego produktu
    dane().produkty.forEach(function (p) {
      dostepne[p.id] = p.ilosc;
    });

    // Odejmujemy co jest już przypisane w przesyłkach
    dane().przesylki.forEach(function (przesylka) {
      przesylka.pozycje.forEach(function (poz) {
        if (dostepne[poz.produkt_id] !== undefined) {
          dostepne[poz.produkt_id] -= poz.ilosc;
        }
      });
    });

    return dostepne;
  }

  // Czy można dodać nową przesyłkę?
  // Tak — gdy przynajmniej jeden produkt ma dostępną ilość > 0.
  function moznaUtworzycPrzesylke() {
    const dostepne = obliczDostepne();
    return Object.values(dostepne).some(function (ilosc) {
      return ilosc > 0;
    });
  }

  // Dodaje nową przesyłkę z dostępnymi ilościami produktów.
  // Nowe id: najmniejsze ujemne id minus 1 (żeby nie kolidować z istniejącymi).
  function dodajPrzesylke() {
    if (!moznaUtworzycPrzesylke()) return;

    const dostepne = obliczDostepne();

    // Generujemy unikalne ujemne id
    const minId = dane().przesylki.reduce(function (min, p) {
      return p.id < min ? p.id : min;
    }, 0);
    const noweId = minId - 1;

    const nowaPrzesylka = {
      id: noweId,
      adres: null,
      uwagi: "",
      // Pozycje: tylko produkty z dostępną ilością > 0
      pozycje: dane()
        .produkty.filter(function (p) {
          return dostepne[p.id] > 0;
        })
        .map(function (p) {
          return {
            produkt_id: p.id,
            nazwa: p.nazwa,
            ilosc_zamowiona: p.ilosc,
            ilosc: dostepne[p.id],
          };
        }),
    };

    zaktualizuj({ przesylki: [...dane().przesylki, nowaPrzesylka] });
    aktywnaId = noweId;
  }

  // Usuwa przesyłkę o podanym id.
  // Zawsze zostaje przynajmniej jedna — przycisk usuwania jest blokowany gdy jest tylko jedna.
  // Po usunięciu aktywnej: aktywujemy pierwszą z pozostałych.
  function usunPrzesylke(id) {
    if (dane().przesylki.length <= 1) return;
    const nowe = dane().przesylki.filter(function (p) {
      return p.id !== id;
    });
    zaktualizuj({ przesylki: nowe });
    if (aktywnaId === id) {
      aktywnaId = nowe[0].id;
    }
  }

  // Aktywuje przesyłkę (wyróżnia kolumnę + pokazuje szczegóły).
  // Po ustawieniu aktywnaId czekamy na render (tick) i scrollujemy do szczegółów.
  // block: 'nearest' — scrolluje tylko gdy szczegóły są poza widocznym obszarem.
  async function aktywujPrzesylke(id) {
    aktywnaId = id;
    await tick();
    if (refSzczegoly) {
      refSzczegoly.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // Aktualizuje dane konkretnej przesyłki (adres, uwagi, pozycje).
  // Pozostałe przesyłki zostają bez zmian.
  function zaktualizujPrzesylke(id, zmiany) {
    const nowe = dane().przesylki.map(function (p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, zmiany);
    });
    zaktualizuj({ przesylki: nowe });
  }
</script>

<!-- Zewnętrzny kontener sekcji — wypełnia całą dostępną przestrzeń PG.
     flex-col: nagłówek na górze, obszar roboczy poniżej.
     h-full min-h-0: kluczowe dla poprawnego flex scroll w rodzicu. -->
<div class="flex h-full min-h-0 flex-col">
  <!-- Nagłówek sekcji — stały, nie scrolluje.
       Przycisk "Dodaj przesyłkę" po prawej — zawsze dostępny bez scrollowania. -->
  <div
    class="flex shrink-0 items-center justify-between border-b border-border-default px-6 py-4"
  >
    <h2 class="text-2xl font-semibold text-text-heading">Przesyłki</h2>
    <button
      onclick={dodajPrzesylke}
      disabled={!moznaUtworzycPrzesylke()}
      class="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-text-on-dark
            disabled:cursor-not-allowed disabled:opacity-40
            hover:enabled:bg-accent-hover"
    >
      + Dodaj przesyłkę
    </button>
  </div>

  <!-- Obszar roboczy — scrolluje pionowo jako całość gdy zawartość nie mieści się na ekranie.
       flex-col z gap-6 między tabelą a szczegółami. -->
  <div class="flex min-h-0 flex-1 flex-col gap-6 p-6">
    <!-- Tabela krzyżowa — bierze całą dostępną przestrzeń, scrolluje w obu osiach.
         TODO: zastąpić TabelaPrzesylek.svelte -->
    <TabelaPrzesylek
      produkty={dane().produkty}
      przesylki={dane().przesylki}
      {aktywnaId}
      onAktywuj={aktywujPrzesylke}
      onZmianaIlosci={(przesylkaId, produktId, ilosc) => {
        const nowe = dane().przesylki.map(function (p) {
          if (p.id !== przesylkaId) return p;
          const nowePozycje = p.pozycje.map(function (poz) {
            if (poz.produkt_id !== produktId) return poz;
            return Object.assign({}, poz, { ilosc: ilosc });
          });
          return Object.assign({}, p, { pozycje: nowePozycje });
        });
        zaktualizuj({ przesylki: nowe });
      }}
    />
    <!-- <div class="min-h-0 flex-1 overflow-auto rounded-lg bg-white shadow-sm">
      <div class="p-4 text-sm text-text-secondary">
        [Tabela krzyżowa — TODO]
      </div>
    </div> -->

    <!-- Panel szczegółów aktywnej przesyłki.
         flex-none: nie kurczy się na rzecz tabeli.
         max-h-[300px] overflow-y-auto: zabezpieczenie na ekrany 768p.
         Ukryty gdy żadna przesyłka nie jest aktywna. -->
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
