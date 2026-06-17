<script>
  // TabPakowanieUwagi — zawartość taba "Pakowanie i uwagi" w panelu szczegółów przesyłki.
  // Lewa kolumna: pakowanie (tryb paczki lub palety).
  // Prawa kolumna: uwagi — zawsze widoczna niezależnie od trybu.
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.

  import Toggle from '$lib/komponenty/Toggle.svelte';

  let {
    przesylka,   // obiekt przesyłki { uwagi, palety, pakowanie }
    styleKolumn, // CSS variables dla proporcji kolumn (--col-lewa, --col-prawa)
    onZmiana,    // callback(zmiany) — aktualizuje dane przesyłki
  } = $props();

  // Tryb palet — gdy true, tabela paczek znika, zostaje tylko pole uwag.
  const czyPalety = $derived(przesylka.palety ?? false);
</script>

<div class="flex h-full" style={styleKolumn}>

  <!-- Lewa kolumna: Pakowanie -->
  <div
    class="flex flex-col border-r border-gray-200 px-4 py-3 gap-3 overflow-y-auto"
    style="width: var(--col-lewa)"
  >
    <!-- Nagłówek: tytuł + przycisk Przelicz + toggle Palety -->
    <div class="flex items-center gap-6">
      <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Pakowanie
      </p>
      {#if !czyPalety}
        <button
          type="button"
          onclick={() => console.log('TODO: przelicz')}
          class="ml-6 text-xs text-accent hover:text-accent-hover transition-colors"
        >
          Przelicz
        </button>
      {/if}
      <div class="flex-1"></div>
      <Toggle
        etykieta="Palety"
        wartosc={czyPalety}
        onZmiana={(v) => onZmiana({ palety: v })}
      />
    </div>

    {#if czyPalety}
      <!-- Tryb palet — tylko informacja -->
      <p class="text-sm text-text-muted italic">
        Przesyłka na palecie — szczegóły w polu uwag.
      </p>
    {:else}
      <!-- Tryb paczek — TODO: tabela paczek -->
      <p class="text-sm text-text-muted italic">
        Pakowanie — do zaimplementowania
      </p>
    {/if}
  </div>

  <!-- Prawa kolumna: Uwagi — zawsze widoczna -->
  <div
    class="flex flex-col px-4 py-3 gap-2 min-h-0 flex-1"
    style="width: var(--col-prawa)"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary shrink-0">
      Uwagi
    </p>
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