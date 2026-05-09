<script>
  import { getContext, tick } from "svelte";
  import TabelaPrzesylek from "./TabelaPrzesylek.svelte";
  import SzczegolyPrzesylki from "./SzczegolyPrzesylki.svelte";

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
  // Nowa przesyłka ma wszystkie pola ze struktury ustalonej w zamowienie.svelte.js.
  function dodajPrzesylke() {
    if (!moznaUtworzycPrzesylke()) return;

    const dostepne = obliczDostepne();
    const minId = dane().przesylki.reduce(function (min, p) {
      return p.id < min ? p.id : min;
    }, 0);
    const noweId = minId - 1;

    const nowaPrzesylka = {
      id: noweId,
      nazwa: null, // nazwa własna — TODO UI na przyszłość
      typDostawy: "kurier", // domyślny typ
      adres: null,
      kurier: null,
      uwagi: "",
      pozycje: dane()
        .produkty.filter(function (p) {
          return dostepne[p.id] > 0;
        })
        .map(function (p) {
          return {
            produkt_id: p.id,
            ilosc: dostepne[p.id],
          };
        }),
    };

    zaktualizuj({ przesylki: [...dane().przesylki, nowaPrzesylka] });
    aktywnaId = noweId;
  }

  // Usuwa przesyłkę o podanym id. Zawsze zostaje przynajmniej jedna.
  // TODO: dodać potwierdzenie usunięcia
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

  // Aktywuje przesyłkę i scrolluje do panelu szczegółów.
  async function aktywujPrzesylke(id) {
    aktywnaId = id;
    await tick();
    if (refSzczegoly) {
      refSzczegoly.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // Aktualizuje dane konkretnej przesyłki (adres, uwagi, pozycje, typDostawy itp.).
  function zaktualizujPrzesylke(id, zmiany) {
    const nowe = dane().przesylki.map(function (p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, zmiany);
    });
    zaktualizuj({ przesylki: nowe });
  }

  // Aktualizuje ilość produktu w zamówieniu (kolumna "Zamów." w tabeli).
  function zmienIloscProduktu(produktId, ilosc) {
    const nowe = dane().produkty.map(function (p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { ilosc: ilosc });
    });
    zaktualizuj({ produkty: nowe });
  }

  // Aktualizuje nazwę produktu w zamówieniu (kolumna "Produkt" w tabeli).
  function zmienNazweProduktu(produktId, nazwa) {
    const nowe = dane().produkty.map(function (p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { nazwa: nazwa });
    });
    zaktualizuj({ produkty: nowe });
  }
</script>

<!-- Zewnętrzny kontener sekcji — wypełnia całą dostępną przestrzeń PG.
     flex-col: tabela na górze, szczegóły poniżej.
     h-full min-h-0: kluczowe dla poprawnego flex scroll w rodzicu. -->
<div class="flex h-full min-h-0 flex-col">
  <div class="flex min-h-0 flex-1 flex-col gap-6 p-6">
    <!-- Tabela krzyżowa.
         max-h-[40vh]: tabela zajmuje maksymalnie 40% wysokości okna —
         przy dużej liczbie produktów scrolluje wewnętrznie zamiast wypychać szczegóły. -->
    <div class="max-h-[40vh]">
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

    <!-- Panel szczegółów aktywnej przesyłki.
         flex-1 min-h-0: zajmuje całą pozostałą przestrzeń po tabeli.
         overflow-hidden: scroll obsługiwany wewnętrznie przez SzczegolyPrzesylki
         (kolumna "Co jedzie" scrolluje, reszta panelu nie). -->
    {#if aktywnaId !== null}
      <div
        bind:this={refSzczegoly}
        class="flex-1 min-h-0 overflow-hidden rounded-lg bg-white shadow-sm outline-1 outline-black/5"
      >
        {#each dane().przesylki as przesylka, i}
          {#if przesylka.id === aktywnaId}
            <SzczegolyPrzesylki
              {przesylka}
              produkty={dane().produkty}
              numerPrzesylki={i + 1}
              onZmiana={(zmiany) => zaktualizujPrzesylke(przesylka.id, zmiany)}
              onUsun={() => usunPrzesylke(przesylka.id)}
            />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
