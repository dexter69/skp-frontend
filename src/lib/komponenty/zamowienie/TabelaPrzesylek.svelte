<script>
  // TabelaPrzesylek — tabela krzyżowa: wiersze = produkty, kolumny = przesyłki.
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.
  // Nie sięga do contextu zamówienia bezpośrednio.

  let {
    produkty,       // lista produktów z zamówienia [{ id, nazwa, ilosc }]
    przesylki,      // lista przesyłek [{ id, pozycje: [{ produkt_id, ilosc, ilosc_zamowiona }] }]
    aktywnaId,      // id aktywnej przesyłki (wyróżniona kolumna)
    onAktywuj,      // callback(id) — kliknięcie nagłówka/kolumny przesyłki
    onZmianaIlosci, // callback(przesylka_id, produkt_id, ilosc) — zmiana ilości w inputcie
  } = $props();

  // Próg zmiany nagłówków: powyżej tej liczby przesyłek skracamy do P1, P2...
  const PROG_SKRACANIA = 4;

  // Czy nagłówki mają być skrócone?
  const skrocone = $derived(przesylki.length > PROG_SKRACANIA);

  // Zwraca ilość produktu w danej przesyłce (lub 0 jeśli produktu nie ma w przesyłce).
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

  // Oblicza sumę ilości w danej przesyłce (wszystkich produktów łącznie).
  function sumaPrzesylki(przesylka) {
    return przesylka.pozycje.reduce(function(suma, poz) {
      return suma + poz.ilosc;
    }, 0);
  }

  // Parsuje wartość inputu na liczbę całkowitą >= 0.
  // Nieprawidłowe wartości (puste, ujemne, NaN) korygowane do 0.
  function parsujIlosc(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  // Obsługa zmiany ilości w inputcie — wywołuje callback rodzica przy blur.
  function naZmianeIlosci(przesylkaId, produktId, event) {
    const ilosc = parsujIlosc(event.target.value);
    // Korygujemy wartość w inpucie jeśli była nieprawidłowa
    event.target.value = ilosc;
    onZmianaIlosci(przesylkaId, produktId, ilosc);
  }
</script>

<!-- Kontener tabeli — overflow-auto w obu osiach.
     h-full: wypełnia przestrzeń przydzieloną przez rodzica (flex-1 w SekcjaPrzesylki).
     Osobny div na rounded + shadow żeby nie ucinać sticky elementów. -->
<div class="h-full overflow-auto rounded-lg bg-white shadow-sm">
  <table class="w-full border-collapse text-sm">

    <thead>
      <tr class="border-b border-border-default">

        <!-- Kolumna: nazwa produktu — sticky left -->
        <th class="sticky left-0 z-20 bg-white px-4 py-3 text-left font-semibold text-text-heading">
          Produkt
        </th>

        <!-- Kolumna: zamówiona ilość — sticky, obok nazwy -->
        <th class="sticky left-0 z-20 bg-white px-4 py-3 text-right font-semibold text-text-secondary">
          Zamów.
        </th>

        <!-- Kolumny przesyłek — klikalne, wyróżnione gdy aktywna -->
        {#each przesylki as przesylka, i}
          <th
            onclick={() => onAktywuj(przesylka.id)}
            class="cursor-pointer px-4 py-3 text-center font-semibold transition-colors
                   {aktywnaId === przesylka.id
                     ? 'bg-accent/10 text-accent'
                     : 'text-text-heading hover:bg-bg-secondary'}"
          >
            {skrocone ? `P${i + 1}` : `Przesyłka ${i + 1}`}
          </th>
        {/each}

        <!-- Kolumna: dostępne — sticky right -->
        <th class="sticky right-0 z-20 bg-white px-4 py-3 text-right font-semibold text-text-secondary">
          Dostępne
        </th>

      </tr>
    </thead>

    <tbody>
      {#each produkty as produkt}
        {@const dostepne = obliczDostepne(produkt)}
        <tr class="border-b border-border-default last:border-0 hover:bg-bg-secondary/40">

          <!-- Nazwa produktu — sticky left -->
          <td class="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-text-primary">
            {produkt.nazwa}
          </td>

          <!-- Zamówiona ilość -->
          <td class="sticky left-0 z-10 bg-white px-4 py-2 text-right text-text-secondary">
            {produkt.ilosc}
          </td>

          <!-- Ilości w każdej przesyłce — edytowalne inputy -->
          {#each przesylki as przesylka}
            <td
              class="px-2 py-2 text-center
                     {aktywnaId === przesylka.id ? 'bg-accent/5' : ''}"
            >
              <input
                type="text"
                value={pobierzIlosc(przesylka, produkt.id)}
                onfocus={(e) => e.target.select()}
                onblur={(e) => naZmianeIlosci(przesylka.id, produkt.id, e)}
                class="w-20 rounded border border-transparent bg-transparent px-2 py-1
                       text-center text-text-primary
                       focus:border-border-focus focus:bg-input-bg focus:outline-none"
              />
            </td>
          {/each}

          <!-- Dostępne — sticky right, kolor zależny od wartości -->
          <td
            class="sticky right-0 z-10 px-4 py-2 text-right font-medium
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
      <tr class="border-t-2 border-border-strong bg-bg-secondary/30">

        <td class="sticky left-0 z-10 bg-bg-secondary/30 px-4 py-2 font-semibold text-text-secondary">
          Razem
        </td>

        <!-- Pusta komórka pod kolumną "Zamów." -->
        <td class="sticky left-0 z-10 bg-bg-secondary/30 px-4 py-2"></td>

        {#each przesylki as przesylka}
          <td
            class="px-4 py-2 text-center font-semibold text-text-primary
                   {aktywnaId === przesylka.id ? 'bg-accent/5' : ''}"
          >
            {sumaPrzesylki(przesylka)}
          </td>
        {/each}

        <td class="sticky right-0 z-10 bg-bg-secondary/30 px-4 py-2"></td>

      </tr>
    </tfoot>

  </table>
</div>
