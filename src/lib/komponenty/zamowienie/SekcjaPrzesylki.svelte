<script>
  import { getContext, tick } from "svelte";
  import TabelaPrzesylek from "./TabelaPrzesylek.svelte";
  import SzczegolyPrzesylki from "./SzczegolyPrzesylki.svelte";

  // Pobieramy stan zamówienia z contextu.
  const { dane, zaktualizuj } = getContext("zamowienie");

  // id aktywnej przesyłki — która kolumna jest wyróżniona i której szczegóły są widoczne.
  // Inicjalizujemy od razu id pierwszej przesyłki — layout gwarantuje że lista nie jest pusta.
  let aktywnaId = $state(dane().przesylki[0]?.id ?? null);

  // Czy panel szczegółów jest widoczny.
  // Domyślnie true gdy jest aktywna przesyłka — użytkownik może zamknąć przez [×].
  let panelWidoczny = $state(aktywnaId !== null);

  // Oblicza ile każdego produktu jest jeszcze "dostępne" (nie przypisane do żadnej przesyłki).
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
      nazwa: null,
      typDostawy: 'kurier',
      adres: null,
      kurier: null,
      uwagi: '',
      pozycje: dane().produkty
        .filter(function(p) { return dostepne[p.id] > 0; })
        .map(function(p) {
          return { produkt_id: p.id, ilosc: dostepne[p.id] };
        })
    };

    zaktualizuj({ przesylki: [...dane().przesylki, nowaPrzesylka] });
    aktywnaId = noweId;
    panelWidoczny = true;
  }

  // Usuwa przesyłkę o podanym id. Zawsze zostaje przynajmniej jedna.
  // TODO: dodać potwierdzenie usunięcia
  function usunPrzesylke(id) {
    if (dane().przesylki.length <= 1) return;
    const nowe = dane().przesylki.filter(function(p) { return p.id !== id; });
    zaktualizuj({ przesylki: nowe });
    if (aktywnaId === id) {
      aktywnaId = nowe[0].id;
    }
  }

  // Aktywuje przesyłkę — otwiera panel szczegółów jeśli był zamknięty.
  function aktywujPrzesylke(id) {
    aktywnaId = id;
    panelWidoczny = true;
  }

  // Aktualizuje dane konkretnej przesyłki.
  function zaktualizujPrzesylke(id, zmiany) {
    const nowe = dane().przesylki.map(function(p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, zmiany);
    });
    zaktualizuj({ przesylki: nowe });
  }

  // Aktualizuje ilość produktu w zamówieniu.
  function zmienIloscProduktu(produktId, ilosc) {
    const nowe = dane().produkty.map(function(p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { ilosc: ilosc });
    });
    zaktualizuj({ produkty: nowe });
  }

  // Aktualizuje nazwę produktu w zamówieniu.
  function zmienNazweProduktu(produktId, nazwa) {
    const nowe = dane().produkty.map(function(p) {
      if (p.id !== produktId) return p;
      return Object.assign({}, p, { nazwa: nazwa });
    });
    zaktualizuj({ produkty: nowe });
  }
</script>

<!-- Zewnętrzny kontener — wypełnia całą przestrzeń PG.
     overflow-y-auto: ten kontener scrolluje gdy tabela jest długa.
     relative: wymagane żeby sticky działało względem tego kontenera. -->
<div class="relative h-full overflow-y-auto">

  <!-- Wewnętrzny padding — tabela z nagłówkiem -->
  <div class="p-6">
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
  </div>

  <!-- Panel szczegółów — sticky bottom.
       Lepi się do dołu widocznego obszaru gdy tabela jest długa.
       Przy krótkiej tabeli siedzi naturalnie pod tabelą (spacer rezerwuje miejsce).
       mx-6 pb-6: marginesy boczne i dolny padding — wizualnie odróżniony od tabeli.
       Zamykany przez [×] w nagłówku — kliknięcie w kolumnę przesyłki ponownie otwiera. -->
  {#if aktywnaId !== null && panelWidoczny}
    <div
      class="sticky bottom-0 mx-6 pb-6"
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
              onZamknij={() => panelWidoczny = false}
            />
          {/if}
        {/each}
      </div>
    </div>
  {/if}

</div>
