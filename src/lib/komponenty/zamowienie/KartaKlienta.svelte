<script>
  import WyborKlienta from "$lib/komponenty/WyborKlienta.svelte";
  import WyborOpcji from "$lib/komponenty/WyborOpcji.svelte";

  // Props przekazywane z +page.svelte:
  // — klient: dane wybranego klienta lub null gdy nie wybrano
  // — typKlienta: 'nowy' / 'stały' / null — resetowany do null przy zmianie klienta
  // — onWybor: callback wywoływany po wyborze klienta z modala
  // — onZmianaTypu: callback wywoływany przy zmianie typu klienta
  let { klient = null, typKlienta = null, onWybor, onZmianaTypu } = $props();

  // Stan otwarcia modala wyszukiwania klienta.
  let modalOtwarty = $state(false);

  function handleWybor(wybranyKlient) {
    onWybor?.(wybranyKlient);
  }

  function otworzModal(e) {
    // blur() zdejmuje focus z karty — bez tego po zamknięciu modala
    // przez Escape na karcie zostaje czarna ramka focusu
    e.currentTarget.blur();
    modalOtwarty = true;
  }
</script>

<!-- Karta klienta — cały obszar klikalny, otwiera modal wyboru klienta.
     relative — potrzebne dla absolutnego pozycjonowania WyborOpcji w rogu.
     min-h-36 — stała minimalna wysokość, karta nie "skacze" między stanami. -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  role="button"
  tabindex="-1"
  onclick={otworzModal}
  class="relative w-full h-full min-h-36 rounded-lg bg-white shadow-sm text-left p-4 hover:bg-bg-primary transition-colors cursor-pointer"
>
  <p class="text-xs text-text-muted">
    Zamówienie dla:
    <span class="text-text-muted">
      (kliknij aby {klient ? "zmienić" : "wybrać"})
    </span>
  </p>

  {#if klient}
    <!-- Stan: klient wybrany — pokazujemy jego dane -->
    <div class="mt-3">
      <p class="text-base font-bold text-text-heading">{klient.nazwa}</p>
      <p class="mt-1 text-sm text-text-secondary">{klient.miasto}</p>
      <p class="text-sm text-text-secondary">NIP: {klient.nip}</p>
      <!-- TODO: dodać więcej danych gdy będą dostępne z API (telefon, email itp.) -->
    </div>
  {:else}
    <!-- Stan: brak klienta (empty state) -->
    <div class="mt-3">
      <p class="text-sm text-text-muted italic">Nie wybrano klienta...</p>
    </div>
  {/if}

  {#if klient}
    <!-- Wybór typu klienta — widoczny tylko gdy klient jest wybrany.
         Pozycjonowany absolutnie w prawym dolnym rogu karty.
         stopPropagation — kliknięcie w WyborOpcji nie propaguje się do karty
         i nie otwiera modala wyboru klienta. -->
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      role="presentation"
      class="absolute bottom-3 right-3"
      onclick={(e) => e.stopPropagation()}
    >
      <WyborOpcji
        opcje={[
          { id: "nowy", label: "Nowy" },
          { id: "stały", label: "Stały" },
        ]}
        wartosc={typKlienta}
        onZmiana={(v) => onZmianaTypu?.(v)}
      />
    </div>
  {/if}
</div>

<!-- Modal wyszukiwania klienta (Command Palette).
     bind:otwarty — dwukierunkowe powiązanie stanu otwarcia.
     Modal zamyka się przez Escape lub kliknięcie backdropu (otwarty = false). -->
<WyborKlienta bind:otwarty={modalOtwarty} onWybor={handleWybor} />
