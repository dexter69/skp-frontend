<script>
  import { getContext, onDestroy, tick } from "svelte";
  import TabelaPrzesylek from "./TabelaPrzesylek.svelte";
  import SzczegolyPrzesylki from "./SzczegolyPrzesylki.svelte";

  const { dane, zaktualizuj } = getContext("zamowienie");

  // id aktywnej przesyłki — która kolumna jest wyróżniona i której szczegóły są widoczne.
  let aktywnaId = $state(dane().przesylki[0]?.id ?? null);

  // Czy panel szczegółów jest widoczny.
  let panelWidoczny = $state(aktywnaId !== null);

  // Referencje do kontenerów A i B — potrzebne dla ResizeObserver i obliczania pozycji C.
  let refA = $state(null);
  let refB = $state(null);

  // Pozycja top panelu C — obliczana dynamicznie przez ResizeObserver.
  // Domyślnie 0 — zaktualizowane po pierwszym renderze.
  let topC = $state(0);

  // Wysokość panelu szczegółów — pobierana z CSS variable.
  // Używamy stałej bo ResizeObserver nie śledzi zmian CSS variables.
  const WYSOKOSC_C = 280; // musi odpowiadać --szczegoly-przesylki-h w app.css
  const MARGINES = 24; // px-6 = 24px odstęp od dołu kontenera A

  // Oblicza pozycję top panelu C.
  // C siedzi tuż pod tabelą B, chyba że B jest za duże —
  // wtedy C przykleja się do dołu A z marginesem.
  function obliczTopC() {
    if (!refA || !refB) return;
    const wysokoscA = refA.offsetHeight;
    const wysokoscB = refB.offsetHeight;
    topC = Math.min(wysokoscB, wysokoscA - WYSOKOSC_C - MARGINES);
  }

  // ResizeObserver obserwuje B — gdy tabela zmienia wysokość (dodano/usunięto produkt),
  // przeliczamy pozycję C. Używamy ResizeObserver zamiast $effect bo reaguje
  // na zmiany rozmiaru DOM, nie na zmiany stanu Svelte.
  let observer = null;

  // Uruchamiamy observer gdy refB jest dostępne.
  // $effect odpala się po każdym renderze — sprawdzamy czy refB się zmieniło.
  $effect(() => {
    if (!refB) return;

    observer = new ResizeObserver(function () {
      obliczTopC();
    });
    observer.observe(refB);

    // Pierwsze obliczenie po zamontowaniu
    obliczTopC();

    return function () {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
  });

  // Oblicza ile każdego produktu jest jeszcze "dostępne".
  function obliczDostepne() {
    const dostepne = {};
    dane().produkty.forEach(function (p) {
      dostepne[p.id] = p.ilosc;
    });
    dane().przesylki.forEach(function (przesylka) {
      przesylka.pozycje.forEach(function (poz) {
        if (dostepne[poz.produkt_id] !== undefined) {
          dostepne[poz.produkt_id] -= poz.ilosc;
        }
      });
    });
    return dostepne;
  }

  function moznaUtworzycPrzesylke() {
    const dostepne = obliczDostepne();
    return Object.values(dostepne).some(function (ilosc) {
      return ilosc > 0;
    });
  }

  function dodajPrzesylke() {
    if (!moznaUtworzycPrzesylke()) return;

    const dostepne = obliczDostepne();
    const minId = dane().przesylki.reduce(function (min, p) {
      return p.id < min ? p.id : min;
    }, 0);
    const noweId = minId - 1;

    const nowaPrzesylka = {
      id: noweId,
      nazwa: null,
      typDostawy: "kurier",
      adres: null,
      kurier: null,
      uwagi: "",
      pozycje: dane()
        .produkty.filter(function (p) {
          return dostepne[p.id] > 0;
        })
        .map(function (p) {
          return { produkt_id: p.id, ilosc: dostepne[p.id] };
        }),
    };

    zaktualizuj({ przesylki: [...dane().przesylki, nowaPrzesylka] });
    aktywnaId = noweId;
    panelWidoczny = true;
  }

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

  function aktywujPrzesylke(id) {
    aktywnaId = id;
    panelWidoczny = true;
  }

  function zaktualizujPrzesylke(id, zmiany) {
    const nowe = dane().przesylki.map(function (p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, zmiany);
    });
    zaktualizuj({ przesylki: nowe });
  }

  function zmienIloscProduktu(produktId, ilosc) {
    const nowe = dane().produkty.map(function (p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { ilosc: ilosc });
    });
    zaktualizuj({ produkty: nowe });
  }

  function zmienNazweProduktu(produktId, nazwa) {
    const nowe = dane().produkty.map(function (p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { nazwa: nazwa });
    });
    zaktualizuj({ produkty: nowe });
  }
</script>

<!-- Nagłówek sekcji — poza kontenerem A, nie scrolluje.
     px-8: wyrównany z nagłówkiem zamówienia. -->
<div
  class="shrink-0 flex items-center justify-between px-8 py-4 border-b border-border-default"
>
  <div>
    <h2 class="text-base font-semibold text-text-heading">Przesyłki</h2>
    <p class="mt-1 text-sm text-text-secondary">
      Rozdysponuj produkty zamówienia między przesyłki.
    </p>
  </div>
  <button
    type="button"
    onclick={dodajPrzesylke}
    disabled={!moznaUtworzycPrzesylke()}
    class="block rounded-md bg-accent px-3 py-2 text-center text-sm font-semibold
           text-text-on-dark shadow-xs
           hover:enabled:bg-accent-hover
           disabled:cursor-not-allowed disabled:opacity-40"
  >
    + Dodaj przesyłkę
  </button>
</div>

<!-- A: kontener główny — zajmuje całą pozostałą przestrzeń.
     position relative — punkt odniesienia dla absolutnie pozycjonowanego C.
     overflow-hidden — C nie wychodzi poza A. -->
<div bind:this={refA} class="relative flex-1 overflow-hidden" id="kontener-A">
  <!-- B: kontener tabeli — naturalna wysokość, rośnie z zawartością.
       overflow-y-auto — scroll pojawia się gdy B przekracza dostępną przestrzeń w A.
       px-8 py-6: padding wyrównany z resztą sekcji. -->
  <div
    bind:this={refB}
    class="overflow-y-auto px-8 py-6 max-h-full"
    id="kontener-B"
  >
    <TabelaPrzesylek
      produkty={dane().produkty}
      przesylki={dane().przesylki}
      {aktywnaId}
      moznaUtworzycPrzesylke={moznaUtworzycPrzesylke()}
      onAktywuj={aktywujPrzesylke}
      onDodaj={dodajPrzesylke}
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
      onZmianaIlosciProduktu={zmienIloscProduktu}
      onZmianaUazwyProduktu={zmienNazweProduktu}
    />
  </div>

  <!-- C: panel szczegółów — absolutnie pozycjonowany względem A.
       top obliczany dynamicznie przez ResizeObserver:
       - normalnie: tuż pod tabelą B
       - gdy B za duże: przyklejony do dołu A z marginesem
       mx-6: węższy niż tabela (wyrównany z wewnętrznym paddingiem)
       Ukryty gdy panelWidoczny = false (zamknięty przez użytkownika). -->
  {#if aktywnaId !== null && panelWidoczny}
    <div
      class="absolute left-6 right-6 z-10"
      style="top: {topC}px"
      id="kontener-C"
    >
      <div
        class="overflow-hidden rounded-lg bg-white shadow-sm outline-1 outline-black/5"
        style="height: var(--szczegoly-przesylki-h)"
      >
        {#each dane().przesylki as przesylka, i}
          {#if przesylka.id === aktywnaId}
            <SzczegolyPrzesylki
              {przesylka}
              produkty={dane().produkty}
              numerPrzesylki={i + 1}
              onZmiana={(zmiany) => zaktualizujPrzesylke(przesylka.id, zmiany)}
              onUsun={() => usunPrzesylke(przesylka.id)}
              onZamknij={() => (panelWidoczny = false)}
            />
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
