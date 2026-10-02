<script>
  import { getContext } from "svelte";
  import Przycisk from '$lib/komponenty/Przycisk.svelte';
  import TabelaPrzesylek from "./TabelaPrzesylek.svelte";
  import SzczegolyPrzesylki from "./SzczegolyPrzesylki.svelte";
  import WyborAdresu from "./WyborAdresu.svelte";
  import PotwierdzenieDialog from "$lib/komponenty/PotwierdzenieDialog.svelte";
  import { wybierzDomyslnyAdres } from "$lib/algorytmy/adresy.js";

  const { dane, zaktualizuj } = getContext("zamowienie");

  // id aktywnej przesyłki — która kolumna jest wyróżniona i której szczegóły są widoczne.
  let aktywnaId = $state(dane().przesylki[0]?.id ?? null);

  let modalAdresuOtwarty = $state(false);
  let aktywnaIdPrzesylkiDlaModala = $state(null);

  // Czy panel szczegółów (C) jest widoczny.
  // Użytkownik może go zamknąć przez [×] — ponownie otwiera się po kliknięciu w kolumnę przesyłki.
  let panelWidoczny = $state(aktywnaId !== null);

  // Czy panel jest rozwinięty (duża wysokość).
  // Przełączane przez przycisk IconArrowsMaximize/Minimize w nagłówku panelu.
  let panelRozwiniety = $state(false);

  // Referencje do kontenerów A i B — potrzebne dla ResizeObserver i obliczania pozycji C.
  let refA = $state(null);
  let refB = $state(null);

  // Pozycja top panelu C — obliczana dynamicznie przez ResizeObserver.
  let topC = $state(0);

  // Wysokości panelu C — muszą odpowiadać zmiennym CSS w app.css.
  const WYSOKOSC_C_MALA = 280; // --szczegoly-przesylki-h
  const WYSOKOSC_C_DUZA = null; // --szczegoly-przesylki-h-duze (60vh — obliczana dynamicznie)
  // Margines od dołu kontenera A.
  const MARGINES = 16;
  // Odstęp między tabelą a panelem szczegółów.
  const ODSTEP = 24;

  // Aktualna wysokość panelu — zależy od stanu rozwinięcia.
  // Przy dużym panelu używamy offsetHeight A minus margines (odpowiednik 60vh w kontekście A).
  function pobierzWysokoscC() {
    if (!panelRozwiniety) return WYSOKOSC_C_MALA;
    if (!refA) return WYSOKOSC_C_MALA;
    // Duży panel: 60% wysokości kontenera A
    return Math.floor(refA.offsetHeight * 0.6);
  }

  // Oblicza pozycję top panelu C.
  // C siedzi tuż pod tabelą B, chyba że B jest za duże —
  // wtedy C przykleja się do dołu A z marginesem i przykrywa dolne wiersze tabeli.
  function obliczTopC() {
    if (!refA || !refB) return;
    const wysokoscA = refA.offsetHeight;
    const wysokoscB = refB.offsetHeight;
    const wysokoscC = pobierzWysokoscC();
    topC = Math.min(wysokoscB + ODSTEP, wysokoscA - wysokoscC - MARGINES);
  }

  // ResizeObserver obserwuje B — gdy tabela zmienia wysokość, przeliczamy pozycję C.
  // $effect używany tylko do podpięcia observera (reakcja na mount), nie do synchronizacji stanu.
  $effect(() => {
    if (!refB) return;
    const observer = new ResizeObserver(function () {
      obliczTopC();
    });
    observer.observe(refB);
    obliczTopC();
    return function () {
      observer.disconnect();
    };
  });

  // Oblicza ile każdego produktu jest jeszcze "dostępne" (nie przypisane do żadnej przesyłki).
  // Wynik: mapa { produkt_id → dostępna_ilość }
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

  // Czy można dodać nową przesyłkę?
  function moznaUtworzycPrzesylke() {
    const dostepne = obliczDostepne();
    return Object.values(dostepne).some(function (ilosc) {
      return ilosc > 0;
    });
  }

  // Dodaje nową przesyłkę z dostępnymi ilościami produktów.
  function dodajPrzesylke() {
    if (!moznaUtworzycPrzesylke()) return;
    const dostepne = obliczDostepne();
    const minId = dane().przesylki.reduce(function (min, p) {
      return p.id < min ? p.id : min;
    }, 0);
    const noweId = minId - 1;
    // Nowa przesyłka jest kurierska — dostaje domyślny adres wysyłki klienta
    // (reguła w $lib/algorytmy/adresy.js); bez klienta — brak adresu.
    const domyslnyAdres = dane().klient
      ? wybierzDomyslnyAdres(dane().klient.adresy)
      : null;
    const nowaPrzesylka = {
      id: noweId,
      nazwa: null,
      typDostawy: "kurier",
      adres: domyslnyAdres,
      kurier: null,
      uwagi: "",
      palety: false,
      pakowanie: [],
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

  // Potwierdzenie usunięcia przesyłki — przesyłka czekająca na decyzję
  // użytkownika: { id, tresc }. null = okno zamknięte.
  let doUsuniecia = $state(null);

  // Czy przesyłka zawiera coś, co użytkownik straciłby przy usunięciu:
  // przypisane ilości, pakowanie albo uwagi. Pustą usuwamy bez pytania
  // (np. dodaną przez pomyłkę) — żeby nie klikać "Usuń" bez potrzeby.
  function czyPrzesylkaMaZawartosc(przesylka) {
    const maIlosci = przesylka.pozycje.some(function (p) {
      return p.ilosc > 0;
    });
    const maPakowanie = przesylka.pakowanie.length > 0;
    const maUwagi = (przesylka.uwagi || "").trim() !== "";
    return maIlosci || maPakowanie || maUwagi;
  }

  // Prośba o usunięcie przesyłki — z kosza w nagłówku panelu albo z kosza
  // przy ostatnim produkcie na liście "Co jedzie" (powod = "ostatniProdukt").
  // Zawsze zostaje przynajmniej jedna przesyłka.
  // Uwaga: kosz w nagłówku przekazuje jako argument zdarzenie kliknięcia,
  // dlatego sprawdzamy dokładnie powod === "ostatniProdukt".
  function usunPrzesylke(id, powod) {
    if (dane().przesylki.length <= 1) return;

    const indeks = dane().przesylki.findIndex(function (p) {
      return p.id === id;
    });
    if (indeks === -1) return;

    if (!czyPrzesylkaMaZawartosc(dane().przesylki[indeks])) {
      usunPrzesylkeTeraz(id);
      return;
    }

    const numer = indeks + 1; // numeracja jak w tabeli i panelu ("Przesyłka 2")
    doUsuniecia = {
      id: id,
      tresc:
        powod === "ostatniProdukt"
          ? `To ostatni produkt w przesyłce ${numer} — jego usunięcie usunie całą przesyłkę razem z adresem, pakowaniem i uwagami.`
          : `Przesyłka ${numer} zostanie usunięta razem z adresem, pakowaniem i uwagami. Przypisane do niej ilości wrócą do kolumny „dostępne”.`,
    };
  }

  // Użytkownik potwierdził w oknie — usuwamy.
  function potwierdzUsuniecie() {
    const id = doUsuniecia.id;
    doUsuniecia = null;
    usunPrzesylkeTeraz(id);
  }

  // Właściwe usunięcie przesyłki ze stanu (bez pytania).
  function usunPrzesylkeTeraz(id) {
    const nowe = dane().przesylki.filter(function (p) {
      return p.id !== id;
    });
    zaktualizuj({ przesylki: nowe });
    if (aktywnaId === id) {
      aktywnaId = nowe[0].id;
    }
  }

  // Aktywuje przesyłkę — wyróżnia kolumnę w tabeli i otwiera panel szczegółów.
  function aktywujPrzesylke(id) {
    aktywnaId = id;
    panelWidoczny = true;
  }

  // Aktualizuje dane konkretnej przesyłki (adres, uwagi, typDostawy itp.).
  function zaktualizujPrzesylke(id, zmiany) {
    // Gdy zmieniamy typ dostawy na 'kurier' — przywracamy domyślny adres klienta.
    // Przy innych typach adres jest już resetowany przez TabDostawa (adres: null).
    if (zmiany.typDostawy === "kurier" && dane().klient) {
      // Domyślny adres wysyłki klienta (reguła w $lib/algorytmy/adresy.js).
      const domyslnyAdres = wybierzDomyslnyAdres(dane().klient.adresy);
      zmiany = Object.assign({}, zmiany, { adres: domyslnyAdres });
    }
    const nowe = dane().przesylki.map(function (p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, zmiany);
    });
    zaktualizuj({ przesylki: nowe });
  }
  // function zaktualizujPrzesylke(id, zmiany) {
  //   const nowe = dane().przesylki.map(function (p) {
  //     if (p.id !== id) return p;
  //     return Object.assign({}, p, zmiany);
  //   });
  //   zaktualizuj({ przesylki: nowe });
  // }

  // Aktualizuje ilość produktu w przesyłce.
  // Jeśli produkt nie ma jeszcze pozycji w przesyłce — dodaje nową.
  // Używane zarówno przez tabelę krzyżową jak i panel szczegółów.
  function zmienIloscWPrzesylce(przesylkaId, produktId, ilosc) {
    const nowe = dane().przesylki.map(function (p) {
      if (p.id !== przesylkaId) return p;
      const istnieje = p.pozycje.some(function (poz) {
        return poz.produkt_id === produktId;
      });
      let nowePozycje;
      if (istnieje) {
        nowePozycje = p.pozycje.map(function (poz) {
          if (poz.produkt_id !== produktId) return poz;
          return Object.assign({}, poz, { ilosc: ilosc });
        });
      } else {
        // Produkt nie miał pozycji w tej przesyłce — dodajemy nową
        nowePozycje = [...p.pozycje, { produkt_id: produktId, ilosc: ilosc }];
      }
      return Object.assign({}, p, { pozycje: nowePozycje });
    });
    zaktualizuj({ przesylki: nowe });
  }

  // Aktualizuje ilość produktu w zamówieniu (single source of truth).
  function zmienIloscProduktu(produktId, ilosc) {
    const nowe = dane().produkty.map(function (p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { ilosc: ilosc });
    });
    zaktualizuj({ produkty: nowe });
  }

  // Aktualizuje nazwę produktu w zamówieniu (single source of truth).
  function zmienNazweProduktu(produktId, nazwa) {
    const nowe = dane().produkty.map(function (p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { nazwa: nazwa });
    });
    zaktualizuj({ produkty: nowe });
  }

  // Przełącza między małym a dużym panelem i przelicza pozycję C.
  function przelaczRozwiniety() {
    panelRozwiniety = !panelRozwiniety;
    // Przeliczamy topC po zmianie stanu — panel ma inną wysokość
    obliczTopC();
  }
</script>

<!-- Nagłówek sekcji — poza kontenerem A, nie scrolluje wraz z tabelą. -->
<div
  class="shrink-0 flex items-center justify-between px-8 py-4 border-b border-border-default"
>
  <div>
    <h2 class="text-base font-semibold text-text-heading">Przesyłki</h2>
    <p class="mt-1 text-sm text-text-secondary">
      Rozdysponuj produkty zamówienia między przesyłki.
    </p>
  </div>
  <Przycisk onclick={dodajPrzesylke} disabled={!moznaUtworzycPrzesylke()} rozmiar="lg">+ Dodaj przesyłkę</Przycisk>
</div>

<!-- A: kontener główny — punkt odniesienia dla absolutnie pozycjonowanego panelu C. -->
<div bind:this={refA} class="relative flex-1 overflow-hidden px-8 pb-4">
  <!-- B: kontener tabeli — rośnie z zawartością, scrolluje gdy za duża. -->
  <div bind:this={refB} class="overflow-y-auto max-h-full">
    <TabelaPrzesylek
      produkty={dane().produkty}
      przesylki={dane().przesylki}
      {aktywnaId}
      moznaUtworzycPrzesylke={moznaUtworzycPrzesylke()}
      onAktywuj={aktywujPrzesylke}
      onDodaj={dodajPrzesylke}
      onZmianaIlosci={(przesylkaId, produktId, ilosc) =>
        zmienIloscWPrzesylce(przesylkaId, produktId, ilosc)}
      onZmianaIlosciProduktu={zmienIloscProduktu}
      onZmianaUazwyProduktu={zmienNazweProduktu}
    />
  </div>

  <!-- C: panel szczegółów — absolutnie pozycjonowany, top obliczany przez ResizeObserver.
       Wysokość zależy od stanu rozwinięcia:
       - mały: --szczegoly-przesylki-h (~285px)
       - duży: 60% wysokości kontenera A (~60vh) -->
  {#if aktywnaId !== null && panelWidoczny}
    <!-- left-x i right-y decydują o szerokości panelu. -->
    <div class="absolute left-14 right-14 z-10" style="top: {topC}px">
      <div
        class="overflow-hidden rounded-lg bg-white shadow-sm outline-1 outline-black/5"
        style="height: {panelRozwiniety
          ? pobierzWysokoscC() + 'px'
          : 'var(--szczegoly-przesylki-h)'}"
      >
        {#each dane().przesylki as przesylka, i}
          {#if przesylka.id === aktywnaId}
            <SzczegolyPrzesylki
              {przesylka}
              maKlienta={!!dane().klient}
              produkty={dane().produkty}
              numerPrzesylki={i + 1}
              rozwiniety={panelRozwiniety}
              onZmiana={(zmiany) => zaktualizujPrzesylke(przesylka.id, zmiany)}
              onZmianaIlosci={(produktId, ilosc) =>
                zmienIloscWPrzesylce(przesylka.id, produktId, ilosc)}
              onUsun={(powod) => usunPrzesylke(przesylka.id, powod)}
              onZamknij={() => {
                panelWidoczny = false;
                aktywnaId = null;
              }}
              onRozwin={przelaczRozwiniety}
              onOtworzWyborAdresu={() => {
                aktywnaIdPrzesylkiDlaModala = aktywnaId;
                modalAdresuOtwarty = true;
              }}
              czyJedynaPrzesylka={dane().przesylki.length <= 1}
            />
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<WyborAdresu
  adresy={dane().klient?.adresy ?? []}
  wybranyAdres={dane().przesylki.find(function (p) {
    return p.id === aktywnaIdPrzesylkiDlaModala;
  })?.adres ?? null}
  bind:otwarty={modalAdresuOtwarty}
  onWybor={(adres) =>
    zaktualizujPrzesylke(aktywnaIdPrzesylkiDlaModala, { adres })}
/>

<!-- Potwierdzenie usunięcia przesyłki -->
<PotwierdzenieDialog
  otwarty={doUsuniecia !== null}
  tytul="Usunąć przesyłkę?"
  tresc={doUsuniecia ? doUsuniecia.tresc : ""}
  etykietaPotwierdz="Usuń przesyłkę"
  onPotwierdz={potwierdzUsuniecie}
  onAnuluj={() => {
    doUsuniecia = null;
  }}
/>
