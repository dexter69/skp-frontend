<script>
  // SzczegolyPrzesylki — panel szczegółów aktywnej przesyłki.
  // Orkiestrator: zarządza tabami i nagłówkiem, deleguje zawartość do podkomponentów.
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.

  import { IconArrowsMaximize, IconArrowsMinimize, IconTrash, IconX } from "@tabler/icons-svelte-runes";
  import TabDostawa from "./TabDostawa.svelte";
  import TabPakowanieUwagi from "./TabPakowanieUwagi.svelte";

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
    onOtworzWyborAdresu,  // callback() — otwiera modal wyboru adresu (renderowany wyżej)
  } = $props();

  // Definicja tabów — łatwo dodać nowy tab lub zmienić kolejność.
  const TABY = [
    { klucz: "dostawa", etykieta: "Dostawa" },
    { klucz: "szczegoly", etykieta: "Pakowanie i uwagi" },
  ];

  // Aktywny tab — domyślnie pierwszy.
  let aktywnyTab = $state(TABY[0].klucz);

  // Proporcje kolumn przekazywane do tabów jako CSS variables.
  // Lewa kolumna (Dostawa / Pakowanie): --col-lewa
  // Prawa kolumna (Co jedzie / Uwagi): --col-prawa
  // Suma musi wynosić 100%. Zmień tu żeby zmienić proporcje w obu tabach naraz.
  const styleKolumn = "--col-lewa: 40%; --col-prawa: 60%;";
</script>

<!-- Kontener panelu — h-full wypełnia wysokość przyznaną przez SekcjaPrzesylki. -->
<div class="flex h-full flex-col">

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

      <span class="text-xs font-medium text-text-muted mr-1">#{numerPrzesylki}</span>

      <!-- Rozwiń/zwiń panel -->
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

    {#if aktywnyTab === "dostawa"}
      <TabDostawa
        {przesylka}
        {produkty}
        {styleKolumn}
        {onZmiana}
        {onZmianaIlosci}
        {onOtworzWyborAdresu}
      />
    {/if}

    {#if aktywnyTab === "szczegoly"}
      <TabPakowanieUwagi
        {przesylka}
        {styleKolumn}
        {onZmiana}
      />
    {/if}

  </div>

</div>
