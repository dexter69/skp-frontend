<script>
  // TabelaPrzesylek — tabela krzyżowa: wiersze = produkty, kolumny = przesyłki.
  // Bazuje na komponencie tabeli z Tailwind Plus (struktura HTML i klasy).
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.
  //
  // Kolumny "Produkt" i "Zamów." są edytowalne inline — zmiany trafiają
  // bezpośrednio do zamowienie.produkty (single source of truth).
  // Pozycje przesyłek zawierają tylko produkt_id i ilosc — bez denormalizacji.
  //
  // Wzorzec dla pól z ilością:
  // - oninput: aktualizuje stan bez walidacji — "Dostępne" reaguje na żywo
  // - onblur:  waliduje i koryguje wartość w polu

  let {
    produkty,                // lista produktów z zamówienia [{ id, nazwa, ilosc }]
    przesylki,               // lista przesyłek [{ id, pozycje: [{ produkt_id, ilosc }] }]
    aktywnaId,               // id aktywnej przesyłki (wyróżniona kolumna)
    moznaUtworzycPrzesylke,  // bool — czy przycisk "Dodaj" jest aktywny (nieużywany tu, dla spójności API)
    onAktywuj,               // callback(id) — kliknięcie nagłówka przesyłki
    onDodaj,                 // callback() — kliknięcie "Dodaj przesyłkę" (nieużywany tu)
    onZmianaIlosci,          // callback(przesylka_id, produkt_id, ilosc) — zmiana ilości w przesyłce
    onZmianaIlosciProduktu,  // callback(produkt_id, ilosc) — zmiana zamówionej ilości produktu
    onZmianaUazwyProduktu,   // callback(produkt_id, nazwa) — zmiana nazwy produktu
  } = $props();

  // Próg skracania nagłówków przesyłek: powyżej tej liczby "Przesyłka N" → "PN"
  const PROG_SKRACANIA = 4;
  const skrocone = $derived(przesylki.length > PROG_SKRACANIA);

  // Zwraca ilość produktu w danej przesyłce (lub 0 gdy produkt nie jest w tej przesyłce).
  function pobierzIlosc(przesylka, produktId) {
    const pozycja = przesylka.pozycje.find(function(poz) {
      return poz.produkt_id === produktId;
    });
    return pozycja ? pozycja.ilosc : 0;
  }

  // Oblicza ile danego produktu jest jeszcze dostępne (nie przypisane do żadnej przesyłki).
  // Wynik może być ujemny — oznacza przekroczenie zamówionej ilości.
  function obliczDostepne(produkt) {
    const przypisane = przesylki.reduce(function(suma, przesylka) {
      return suma + pobierzIlosc(przesylka, produkt.id);
    }, 0);
    return produkt.ilosc - przypisane;
  }

  // Oblicza sumę ilości wszystkich produktów w danej przesyłce.
  function sumaPrzesylki(przesylka) {
    return przesylka.pozycje.reduce(function(suma, poz) {
      return suma + poz.ilosc;
    }, 0);
  }

  // Parsuje ilość zamówioną — minimum 1 (nie można zamówić 0 sztuk produktu).
  function parsujIlosc(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 1 ? 1 : n;
  }

  // Parsuje ilość w przesyłce — minimum 0 (produkt może nie jechać tą przesyłką).
  function parsujIloscPrzesylki(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  // Parsuje wartość bez wymuszania minimum — używane przy oninput dla podglądu na żywo.
  // Puste pole lub nie-liczba = 0, żeby "Dostępne" reagowało natychmiast podczas wpisywania.
  function parsujPodglad(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  // oninput: podgląd na żywo w kolumnie "Dostępne" — bez walidacji minimum
  function naZmianeIlosciPodglad(przesylkaId, produktId, event) {
    onZmianaIlosci(przesylkaId, produktId, parsujPodglad(event.target.value));
  }

  // onblur: walidacja i korekta wartości w polu (min. 0)
  function naZmianeIlosci(przesylkaId, produktId, event) {
    const ilosc = parsujIloscPrzesylki(event.target.value);
    event.target.value = ilosc;
    onZmianaIlosci(przesylkaId, produktId, ilosc);
  }

  // oninput: podgląd na żywo w kolumnie "Dostępne" — bez walidacji minimum
  function naZmianeIlosciProduktuPodglad(produktId, event) {
    onZmianaIlosciProduktu(produktId, parsujPodglad(event.target.value));
  }

  // onblur: walidacja i korekta wartości w polu (min. 1)
  function naZmianeIlosciProduktu(produktId, event) {
    const ilosc = parsujIlosc(event.target.value);
    event.target.value = ilosc;
    onZmianaIlosciProduktu(produktId, ilosc);
  }

  // oninput: zapis przy każdym znaku — nazwa nie wymaga walidacji
  function naZmianeNazwyProduktu(produktId, event) {
    onZmianaUazwyProduktu(produktId, event.target.value);
  }
</script>

<!-- Wrapper tabeli — rounded + shadow zgodnie z wzorcem TP.
     Brak overflow-auto — scroll jest obsługiwany przez kontener B w SekcjaPrzesylki.
     Usunięto negatywne marginesy z oryginalnego wzorca TP (-mx-4, -mx-6, -mx-8)
     bo powodowały poziomy scroll na całym dokumencie. -->
<div class="rounded-lg shadow-sm outline-1 outline-black/5">

  <!-- border-separate border-spacing-0: wymagane dla poprawnego działania sticky na th.
       sticky na thead nie działa niezawodnie — sticky musi być na każdym th osobno. -->
  <table class="min-w-full border-separate border-spacing-0">

    <!-- colgroup definiuje szerokości kolumn raz dla całej tabeli.
         Kolumna "Produkt" bez szerokości — rozciąga się na dostępną przestrzeń.
         Kolumny numeryczne: w-32 (obsługuje do 8 cyfr + separator tysięcy). -->
    <colgroup>
      <col />
      <col class="w-32" />
      {#each przesylki as _}
        <col class="w-32" />
      {/each}
      <col class="w-32" />
    </colgroup>

    <thead class="bg-gray-50">
      <tr>

        <!-- sticky top-0 z-20 na każdym th — pozostaje widoczny przy scrollowaniu tabeli.
             z-20 wyższy niż z-10 na sticky td w tbody — nagłówki zawsze nad wierszami. -->

        <!-- Kolumna: nazwa produktu — sticky left (zawsze widoczna przy scroll poziomym) -->
        <th
          scope="col"
          class="sticky top-0 z-20 left-0 bg-gray-50 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-text-heading sm:pl-6"
        >
          Produkt
        </th>

        <!-- Kolumna: zamówiona ilość — edytowalna inline -->
        <th
          scope="col"
          class="sticky top-0 z-20 bg-gray-50 px-3 py-3.5 text-right text-sm font-semibold text-text-secondary"
        >
          Zamów.
        </th>

        <!-- Kolumny przesyłek — klikalne, aktywna wyróżniona kolorem.
             bg-blue-50 zamiast bg-accent/10 — nieprzezroczyste tło dla poprawnego sticky. -->
        {#each przesylki as przesylka, i}
          <th
            scope="col"
            onclick={() => onAktywuj(przesylka.id)}
            class="sticky top-0 z-20 cursor-pointer px-3 py-3.5 text-center text-sm font-semibold
                   transition-colors select-none
                   {aktywnaId === przesylka.id
                     ? 'bg-blue-50 text-accent'
                     : 'text-text-heading hover:bg-gray-100'}"
          >
            {skrocone ? `P${i + 1}` : `Przesyłka ${i + 1}`}
          </th>
        {/each}

        <!-- Kolumna: dostępne — sticky right (zawsze widoczna przy scroll poziomym) -->
        <th
          scope="col"
          class="sticky top-0 z-20 right-0 bg-gray-50 py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-text-secondary sm:pr-6"
        >
          Dostępne
        </th>

      </tr>
    </thead>

    <tbody class="divide-y divide-gray-200 bg-white">
      {#each produkty as produkt}
        {@const dostepne = obliczDostepne(produkt)}
        <tr class="hover:bg-gray-50/60">

          <!-- Nazwa produktu — sticky left, edytowalna inline.
               oninput: zapis przy każdym znaku (bez walidacji). -->
          <td class="sticky left-0 z-10 bg-white py-2 pl-4 pr-3 text-sm font-medium whitespace-nowrap text-text-primary sm:pl-6">
            <input
              type="text"
              value={produkt.nazwa}
              onfocus={(e) => e.target.select()}
              oninput={(e) => naZmianeNazwyProduktu(produkt.id, e)}
              class="w-full rounded border border-transparent bg-transparent px-2 py-1.5
                     text-sm font-medium text-text-primary
                     focus:border-border-focus focus:bg-input-bg focus:outline-none"
            />
          </td>

          <!-- Zamówiona ilość — edytowalna inline.
               oninput: podgląd na żywo w "Dostępne".
               onblur: walidacja, minimum 1. -->
          <td class="bg-white px-2 py-2 text-right text-sm whitespace-nowrap">
            <input
              type="text"
              value={produkt.ilosc}
              onfocus={(e) => e.target.select()}
              oninput={(e) => naZmianeIlosciProduktuPodglad(produkt.id, e)}
              onblur={(e) => naZmianeIlosciProduktu(produkt.id, e)}
              class="w-full rounded border border-transparent bg-transparent px-2 py-1.5
                     text-right text-sm text-text-secondary
                     focus:border-border-focus focus:bg-input-bg focus:outline-none"
            />
          </td>

          <!-- Ilości w każdej przesyłce — edytowalne inputy inline.
               Aktywna kolumna wyróżniona subtelnym tłem.
               oninput: podgląd na żywo w "Dostępne".
               onblur: walidacja, minimum 0. -->
          {#each przesylki as przesylka}
            <td
              class="px-2 py-2 text-center whitespace-nowrap
                     {aktywnaId === przesylka.id ? 'bg-accent/5' : ''}"
            >
              <input
                type="text"
                value={pobierzIlosc(przesylka, produkt.id)}
                onfocus={(e) => e.target.select()}
                oninput={(e) => naZmianeIlosciPodglad(przesylka.id, produkt.id, e)}
                onblur={(e) => naZmianeIlosci(przesylka.id, produkt.id, e)}
                class="w-full rounded border border-transparent bg-transparent px-2 py-1.5
                       text-center text-sm text-text-primary
                       focus:border-border-focus focus:bg-input-bg focus:outline-none"
              />
            </td>
          {/each}

          <!-- Dostępne — sticky right.
               Trzy stany wizualne:
               - ujemne (przekroczenie): czerwony tekst + tło
               - zero (wszystko przypisane): zielony tekst ✓
               - dodatnie (nieprzypisane): pomarańczowy tekst ⚠ -->
          <td
            class="sticky right-0 z-10 py-4 pl-3 pr-4 text-right text-sm font-medium whitespace-nowrap sm:pr-6
                   {dostepne < 0
                     ? 'bg-error-bg text-error-text'
                     : dostepne === 0
                       ? 'bg-white text-success-text'
                       : 'bg-warning-bg text-warning-text'}"
          >
            {dostepne}
            {#if dostepne < 0}⚠{:else if dostepne === 0}✓{/if}
          </td>

        </tr>
      {/each}
    </tbody>

    <!-- Stopka: suma ilości w każdej przesyłce -->
    <tfoot>
      <tr class="border-t-2 border-border-strong">

        <td class="sticky left-0 z-10 bg-gray-50 py-3.5 pl-4 pr-3 text-sm font-semibold text-text-secondary sm:pl-6">
          Razem
        </td>

        <!-- Pusta komórka pod kolumną "Zamów." -->
        <td class="bg-gray-50 px-3 py-3.5"></td>

        {#each przesylki as przesylka}
          <td
            class="px-3 py-3.5 text-center text-sm font-semibold text-text-primary
                   {aktywnaId === przesylka.id ? 'bg-accent/5' : 'bg-gray-50'}"
          >
            {sumaPrzesylki(przesylka)}
          </td>
        {/each}

        <td class="sticky right-0 z-10 bg-gray-50 py-3.5 pl-3 pr-4 sm:pr-6"></td>

      </tr>
    </tfoot>

  </table>
</div>
