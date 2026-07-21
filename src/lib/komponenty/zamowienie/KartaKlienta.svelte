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

  // Składa linię z kodem pocztowym, miastem i krajem.
  function formatujAdres(klient) {
    const czesci = [];
    const miejscowosc = [klient.kod, klient.miasto].filter(Boolean).join(" ");
    if (miejscowosc) czesci.push(miejscowosc);
    if (klient.kraj) czesci.push(klient.kraj);
    return czesci.join(" · ");
  }

  // Składa linię z kodem kraju i numerem VAT.
  function formatujVat(klient) {
    if (!klient.vatNo) return null;
    return klient.vatKraj ? `${klient.vatKraj} ${klient.vatNo}` : klient.vatNo;
  }
</script>

<!-- Karta klienta — cały obszar klikalny, otwiera modal wyboru klienta.
     relative — potrzebne dla absolutnego pozycjonowania WyborOpcji w rogu.
     min-h-44 — stała minimalna wysokość, karta nie "skacze" między stanami.
     title — tooltip informujący o możliwości zmiany klienta. -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  role="button"
  tabindex="-1"
  onclick={otworzModal}
  title="Kliknij aby zmienić klienta"
  class="relative w-full h-full min-h-44 rounded-lg bg-white shadow-sm text-left p-4 hover:bg-bg-primary transition-colors cursor-pointer"
>
  <p class="text-xs text-text-muted mb-3">Zamówienie dla:</p>

  {#if klient}
    <!-- Stan: klient wybrany — 4 linie informacji -->
    <div class="pr-24 space-y-1">
      <!-- Linia 1: nazwa skrócona — duża, bold -->
      <p class="text-base font-bold text-text-heading leading-tight">
        {klient.nazwa}
      </p>

      <!-- Linia 2: pełna nazwa — tylko gdy różna od skróconej -->
      {#if klient.nazwaPelna && klient.nazwaPelna !== klient.nazwa}
        <p class="text-sm text-text-secondary truncate">
          {klient.nazwaPelna}
        </p>
      {/if}

      <!-- Linia 3: ulica -->
      {#if klient.ulica}
        <p class="text-sm text-text-secondary truncate">
          {klient.ulica}
        </p>
      {/if}

      <!-- Linia 4: kod pocztowy · miasto · kraj -->
      {#if formatujAdres(klient)}
        <p class="text-sm text-text-secondary">
          {formatujAdres(klient)}
        </p>
      {/if}

      <!-- Linia 5: VAT — na końcu -->
      {#if formatujVat(klient)}
        <p class="text-xs text-text-muted">
          {formatujVat(klient)}
        </p>
      {/if}
    </div>
  {:else}
    <!-- Stan: brak klienta (empty state) -->
    <p class="text-sm text-text-muted italic">Nie wybrano klienta...</p>
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
