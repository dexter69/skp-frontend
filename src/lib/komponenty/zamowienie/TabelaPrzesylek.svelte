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
    produkty, // lista produktów z zamówienia [{ id, nazwa, ilosc }]
    przesylki, // lista przesyłek [{ id, pozycje: [{ produkt_id, ilosc }] }]
    aktywnaId, // id aktywnej przesyłki (wyróżniona kolumna)
    moznaUtworzycPrzesylke, // bool — czy przycisk "Dodaj" jest aktywny
    onAktywuj, // callback(id) — kliknięcie nagłówka przesyłki
    onDodaj, // callback() — kliknięcie "Dodaj przesyłkę"
    onZmianaIlosci, // callback(przesylka_id, produkt_id, ilosc) — zmiana ilości w przesyłce
    onZmianaIlosciProduktu, // callback(produkt_id, ilosc) — zmiana zamówionej ilości produktu
    onZmianaUazwyProduktu, // callback(produkt_id, nazwa) — zmiana nazwy produktu
  } = $props();

  const PROG_SKRACANIA = 4;
  const skrocone = $derived(przesylki.length > PROG_SKRACANIA);

  function pobierzIlosc(przesylka, produktId) {
    const pozycja = przesylka.pozycje.find(function (poz) {
      return poz.produkt_id === produktId;
    });
    return pozycja ? pozycja.ilosc : 0;
  }

  function obliczDostepne(produkt) {
    const przypisane = przesylki.reduce(function (suma, przesylka) {
      return suma + pobierzIlosc(przesylka, produkt.id);
    }, 0);
    return produkt.ilosc - przypisane;
  }

  function sumaPrzesylki(przesylka) {
    return przesylka.pozycje.reduce(function (suma, poz) {
      return suma + poz.ilosc;
    }, 0);
  }

  function parsujIlosc(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 1 ? 1 : n;
  }

  function parsujIloscPrzesylki(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function parsujPodglad(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function naZmianeIlosciPodglad(przesylkaId, produktId, event) {
    onZmianaIlosci(przesylkaId, produktId, parsujPodglad(event.target.value));
  }

  function naZmianeIlosci(przesylkaId, produktId, event) {
    const ilosc = parsujIloscPrzesylki(event.target.value);
    event.target.value = ilosc;
    onZmianaIlosci(przesylkaId, produktId, ilosc);
  }

  function naZmianeIlosciProduktuPodglad(produktId, event) {
    onZmianaIlosciProduktu(produktId, parsujPodglad(event.target.value));
  }

  function naZmianeIlosciProduktu(produktId, event) {
    const ilosc = parsujIlosc(event.target.value);
    event.target.value = ilosc;
    onZmianaIlosciProduktu(produktId, ilosc);
  }

  function naZmianeNazwyProduktu(produktId, event) {
    onZmianaUazwyProduktu(produktId, event.target.value);
  }
</script>

<!-- Karta tabeli — uproszczony wrapper bez negatywnych marginesów TP.
     Negatywne marginesy (-mx-4, -mx-6, -mx-8) z oryginalnego wzorca TP powodowały
     poziomy scroll na całym dokumencie — usunięte na rzecz prostszej struktury.
     overflow-x-auto: scroll poziomy tylko wewnątrz karty gdy jest dużo przesyłek.
     overflow-y-auto: scroll pionowy gdy jest dużo produktów. -->
<div class="rounded-lg shadow-sm outline-1 outline-black/5">
  <table class="min-w-full border-separate border-spacing-0">
    <!-- colgroup definiuje szerokości kolumn raz dla całej tabeli.
         Kolumna "Produkt" bez szerokości — rozciąga się na dostępną przestrzeń.
         Wszystkie kolumny numeryczne: w-32 (obsługuje do 8 cyfr + separator). -->
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
        <th
          scope="col"
          class="sticky top-0 z-20 left-0 bg-gray-50 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-text-heading sm:pl-6"
        >
          Produkt
        </th>

        <th
          scope="col"
          class="sticky top-0 z-20 bg-gray-50 px-3 py-3.5 text-right text-sm font-semibold text-text-secondary"
        >
          Zamów.
        </th>

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
          <td
            class="sticky left-0 z-10 bg-white py-2 pl-4 pr-3 text-sm font-medium whitespace-nowrap text-text-primary sm:pl-6"
          >
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

          {#each przesylki as przesylka}
            <td
              class="px-2 py-2 text-center whitespace-nowrap
                     {aktywnaId === przesylka.id ? 'bg-accent/5' : ''}"
            >
              <input
                type="text"
                value={pobierzIlosc(przesylka, produkt.id)}
                onfocus={(e) => e.target.select()}
                oninput={(e) =>
                  naZmianeIlosciPodglad(przesylka.id, produkt.id, e)}
                onblur={(e) => naZmianeIlosci(przesylka.id, produkt.id, e)}
                class="w-full rounded border border-transparent bg-transparent px-2 py-1.5
                       text-center text-sm text-text-primary
                       focus:border-border-focus focus:bg-input-bg focus:outline-none"
              />
            </td>
          {/each}

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

    <tfoot>
      <tr class="border-t-2 border-border-strong">
        <td
          class="sticky left-0 z-10 bg-gray-50 py-3.5 pl-4 pr-3 text-sm font-semibold text-text-secondary sm:pl-6"
        >
          Razem
        </td>

        <td class="bg-gray-50 px-3 py-3.5"></td>

        {#each przesylki as przesylka}
          <td
            class="px-3 py-3.5 text-center text-sm font-semibold text-text-primary
                   {aktywnaId === przesylka.id ? 'bg-accent/5' : 'bg-gray-50'}"
          >
            {sumaPrzesylki(przesylka)}
          </td>
        {/each}

        <td class="sticky right-0 z-10 bg-gray-50 py-3.5 pl-3 pr-4 sm:pr-6"
        ></td>
      </tr>
    </tfoot>
  </table>
</div>
