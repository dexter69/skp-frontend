<script>
  // SzczegolyPrzesylki — panel szczegółów aktywnej przesyłki.
  // Dwa taby: "Dostawa + Co jedzie" oraz "Pakowanie + Uwagi".
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.

  import WyborOpcji from "$lib/komponenty/WyborOpcji.svelte";
  import { IconArrowsMaximize, IconArrowsMinimize, IconTrash, IconX } from "@tabler/icons-svelte-runes";

  let {
    przesylka,        // obiekt przesyłki { id, nazwa, typDostawy, adres, kurier, uwagi, pozycje }
    produkty,         // lista wszystkich produktów zamówienia
    numerPrzesylki,   // numer porządkowy (1, 2, ...) — wyświetlany subtelnie w nagłówku
    rozwiniety,       // bool — czy panel jest w stanie rozwiniętym (duża wysokość)
    onZmiana,         // callback(zmiany) — aktualizuje dane przesyłki
    onZmianaIlosci,   // callback(produkt_id, ilosc) — zmiana ilości produktu w przesyłce
    onUsun,           // callback() — usuwa przesyłkę
    onZamknij,        // callback() — zamyka panel
    onRozwin,         // callback() — przełącza między małym a dużym panelem
  } = $props();

  // Definicja tabów — łatwo dodać nowy tab lub zmienić kolejność.
  const TABY = [
    { klucz: "dostawa", etykieta: "Dostawa" },
    { klucz: "szczegoly", etykieta: "Pakowanie i uwagi" },
  ];

  // Aktywny tab — domyślnie pierwszy.
  let aktywnyTab = $state(TABY[0].klucz);

  // Proporcje kolumn w tabsach — jako zmienne CSS łatwe do zmiany.
  // Lewa kolumna (Dostawa / Pakowanie): --col-lewa
  // Prawa kolumna (Co jedzie / Uwagi): --col-prawa
  // Suma musi wynosić 100%.
  const styleKolumn = "--col-lewa: 40%; --col-prawa: 60%;";

  // Opcje typu dostawy — docelowo z API, na razie mock.
  const OPCJE_TYPU_DOSTAWY = [
    { id: "kurier", label: "Kurier" },
    { id: "magazyn", label: "Magazyn" },
    { id: "odbior_osobisty", label: "Odbiór osobisty" },
    { id: "kurier_klienta", label: "Kurier klienta" },
  ];

  // Lista kurierów — docelowo z API, na razie mock.
  const KURIERZY = [
    { value: "ups", label: "UPS" },
    { value: "dhl", label: "DHL" },
    { value: "dpd", label: "DPD" },
    { value: "fedex", label: "FedEx" },
    { value: "inpost", label: "InPost" },
    { value: "nietypowy", label: "Nietypowy" },
  ];

  // Czy typ dostawy wymaga wyboru kuriera?
  const czyWyborKuriera = $derived(przesylka.typDostawy === "kurier");

  // Zmiana typu dostawy resetuje adres i kuriera.
  function zmienTypDostawy(nowyTyp) {
    onZmiana({ typDostawy: nowyTyp, adres: null, kurier: null });
  }

  // Produkty które jadą tą przesyłką (ilość > 0).
  // Łączymy pozycje przesyłki z danymi produktów z zamówienia (nazwa).
  const pozycjeDoWyswietlenia = $derived(
    przesylka.pozycje
      .filter(function(poz) { return poz.ilosc > 0; })
      .map(function(poz) {
        const produkt = produkty.find(function(p) { return p.id === poz.produkt_id; });
        return {
          produkt_id: poz.produkt_id,
          nazwa: produkt ? produkt.nazwa : "(usunięty)",
          ilosc: poz.ilosc,
        };
      })
  );

  // Próg przełączenia na dwie kolumny w "Co jedzie".
  // Zależy od wysokości panelu (~280px) i wiersza (~28px) — ok. 7 wierszy w jednej kolumnie.
  // Przy rozwiniętym panelu można by użyć wyższego progu, ale dla uproszczenia zostawiamy stały.
  const PROG_DWOCH_KOLUMN = 7;

  // Parsuje ilość przy oninput — bez walidacji minimum (podgląd na żywo).
  function parsujPodglad(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  // Parsuje ilość przy onblur — walidacja minimum 0.
  function parsujIlosc(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }
</script>

<!-- Kontener panelu — h-full wypełnia wysokość przyznaną przez SekcjaPrzesylki. -->
<div class="flex h-full flex-col" style={styleKolumn}>

  <!-- NAGŁÓWEK: taby po lewej, kontrolki po prawej -->
  <div class="flex shrink-0 items-center justify-between border-b border-gray-200 px-4">

    <!-- Taby — styl z NotatkaZamowienia.svelte -->
    <nav class="flex">
      <ul class="flex gap-x-6 text-sm/6 font-semibold text-gray-500">
        {#each TABY as tab}
          <li>
            <button
              onclick={() => aktywnyTab = tab.klucz}
              class="py-3 transition-colors duration-150
                     {aktywnyTab === tab.klucz
                       ? 'border-b-2 text-accent'
                       : 'hover:text-gray-700'}"
              style={aktywnyTab === tab.klucz ? "border-color: var(--accent)" : ""}
            >
              {tab.etykieta}
            </button>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- Kontrolki: numer przesyłki + rozwiń + usuń + zamknij -->
    <div class="flex items-center gap-1">

      <!-- Numer przesyłki — subtelny, tylko informacyjny -->
      <span class="text-xs font-medium text-text-muted mr-1">#{numerPrzesylki}</span>

      <!-- Rozwiń/zwiń panel — przełącza między małą a dużą wysokością -->
      <button
        type="button"
        onclick={onRozwin}
        title={rozwiniety ? "Zmniejsz panel" : "Rozwiń panel"}
        class="rounded p-1 text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
      >
        {#if rozwiniety}
          <IconArrowsMinimize size={16} stroke={1.5} />
        {:else}
          <IconArrowsMaximize size={16} stroke={1.5} />
        {/if}
      </button>

      <!-- Usuń przesyłkę -->
      <button
        type="button"
        onclick={onUsun}
        title="Usuń przesyłkę"
        class="rounded p-1 text-error-text hover:bg-error-bg transition-colors"
      >
        <IconTrash size={16} stroke={1.5} />
      </button>

      <!-- Zamknij panel -->
      <button
        type="button"
        onclick={onZamknij}
        title="Zamknij panel"
        class="rounded p-1 text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
      >
        <IconX size={16} stroke={1.5} />
      </button>

    </div>
  </div>

  <!-- ZAWARTOŚĆ TABÓW — min-h-0 dla poprawnego scroll wewnątrz flex -->
  <div class="min-h-0 flex-1">

    <!-- TAB 1: Dostawa + Co jedzie -->
    {#if aktywnyTab === "dostawa"}
      <div class="flex h-full">

        <!-- Lewa kolumna: Dostawa -->
        <div
          class="flex flex-col border-r border-gray-200 px-4 py-3 gap-3 overflow-y-auto"
          style="width: var(--col-lewa)"
        >
          <WyborOpcji
            opcje={OPCJE_TYPU_DOSTAWY}
            wartosc={przesylka.typDostawy}
            onZmiana={zmienTypDostawy}
          />

          {#if czyWyborKuriera}
            <div class="flex flex-col gap-1">
              <p class="text-xs font-medium text-text-secondary">Firma kurierska</p>
              <select
                value={przesylka.kurier ?? ""}
                onchange={(e) => onZmiana({ kurier: e.target.value || null })}
                class="rounded border border-input-border bg-input-bg px-2 py-1.5
                       text-sm text-input-text
                       focus:outline-none focus:border-border-focus"
              >
                <option value="">— wybierz —</option>
                {#each KURIERZY as k}
                  <option value={k.value}>{k.label}</option>
                {/each}
              </select>
            </div>
          {/if}

          {#if czyWyborKuriera}
            <div class="flex flex-col gap-1">
              <p class="text-xs font-medium text-text-secondary">Adres dostawy</p>
              <!-- TODO: kliknięcie otwiera WyborAdresu (Command Palette z książką adresową) -->
              <button
                type="button"
                onclick={() => console.log("TODO: otwórz WyborAdresu")}
                class="rounded border border-input-border bg-input-bg px-2 py-1.5
                       text-left text-sm text-text-secondary
                       hover:border-border-strong transition-colors"
              >
                {przesylka.adres ? przesylka.adres.nazwa : "— wybierz adres —"}
              </button>
            </div>
          {/if}
        </div>

        <!-- Prawa kolumna: Co jedzie.
             Warunkowy układ: jedna kolumna gdy produktów <= PROG_DWOCH_KOLUMN,
             dwie kolumny gdy więcej. -->
        <div
          class="flex flex-col px-4 py-3 gap-2 overflow-y-auto"
          style="width: var(--col-prawa)"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Co jedzie
          </p>

          {#if pozycjeDoWyswietlenia.length === 0}
            <p class="text-sm text-text-muted">
              Brak produktów — wpisz ilości w tabeli powyżej.
            </p>
          {:else}
            {#if pozycjeDoWyswietlenia.length > PROG_DWOCH_KOLUMN}
              <div class="columns-2 gap-x-3">
                {#each pozycjeDoWyswietlenia as poz}
                  <div class="flex items-center gap-1 min-w-0 break-inside-avoid mb-1">
                    <span class="flex-1 min-w-0 truncate text-sm text-text-primary" title={poz.nazwa}>
                      {poz.nazwa}
                    </span>
                    <input
                      type="text"
                      value={poz.ilosc}
                      onfocus={(e) => e.target.select()}
                      oninput={(e) => onZmianaIlosci(poz.produkt_id, parsujPodglad(e.target.value))}
                      onblur={(e) => { const ilosc = parsujIlosc(e.target.value); e.target.value = ilosc; onZmianaIlosci(poz.produkt_id, ilosc); }}
                      class="w-16 shrink-0 rounded border border-transparent bg-transparent
                             px-1.5 py-0.5 text-right text-sm text-text-primary
                             focus:border-border-focus focus:bg-input-bg focus:outline-none"
                    />
                  </div>
                {/each}
              </div>
            {:else}
              <div class="flex flex-col gap-1">
                {#each pozycjeDoWyswietlenia as poz}
                  <div class="flex items-center gap-1 min-w-0">
                    <span class="flex-1 min-w-0 truncate text-sm text-text-primary" title={poz.nazwa}>
                      {poz.nazwa}
                    </span>
                    <input
                      type="text"
                      value={poz.ilosc}
                      onfocus={(e) => e.target.select()}
                      oninput={(e) => onZmianaIlosci(poz.produkt_id, parsujPodglad(e.target.value))}
                      onblur={(e) => { const ilosc = parsujIlosc(e.target.value); e.target.value = ilosc; onZmianaIlosci(poz.produkt_id, ilosc); }}
                      class="w-16 shrink-0 rounded border border-transparent bg-transparent
                             px-1.5 py-0.5 text-right text-sm text-text-primary
                             focus:border-border-focus focus:bg-input-bg focus:outline-none"
                    />
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
        </div>

      </div>
    {/if}

    <!-- TAB 2: Pakowanie + Uwagi -->
    {#if aktywnyTab === "szczegoly"}
      <div class="flex h-full">

        <!-- Lewa kolumna: Pakowanie -->
        <div
          class="flex flex-col border-r border-gray-200 px-4 py-3 gap-3"
          style="width: var(--col-lewa)"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Pakowanie
          </p>
          <!-- TODO: pakowanie
               Dwie opcje do wyboru:
               1. Standardowe — algorytm automatycznie rozkłada do paczek (5k/3k/2k/1k szt.)
                  z możliwością ręcznej korekty przez użytkownika
               2. Palety — pole na uwagi/notatkę
               Rozmiary paczek i algorytm docelowo konfigurowalne z API.
               Szczegóły do omówienia przed implementacją. -->
          <p class="text-sm text-text-muted italic">
            Pakowanie — do zaimplementowania
          </p>
        </div>

        <!-- Prawa kolumna: Uwagi -->
        <div
          class="flex flex-col px-4 py-3 gap-2 min-h-0 flex-1"
          style="width: var(--col-prawa)"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary shrink-0">
            Uwagi
          </p>
          <!-- textarea wypełnia dostępną przestrzeń i scrolluje gdy tekst jest długi.
               Bez auto-resize — panel ma stałą wysokość więc textarea ma stały rozmiar.
               resize-none — ręczne przeciąganie wyłączone. -->
          <textarea
            value={przesylka.uwagi}
            oninput={(e) => onZmiana({ uwagi: e.target.value })}
            placeholder="Uwagi do przesyłki..."
            class="flex-1 min-h-0 w-full resize-none rounded-lg bg-input-bg px-3 py-2
                   text-sm text-text-primary placeholder:text-text-muted
                   border border-input-border
                   focus:outline-none focus:border-border-focus"
          ></textarea>
        </div>

      </div>
    {/if}

  </div>

</div>
