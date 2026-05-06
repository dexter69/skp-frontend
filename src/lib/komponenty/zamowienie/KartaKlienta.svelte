<script>
  import WyborKlienta from "$lib/komponenty/WyborKlienta.svelte";
  import WyborOpcji from "$lib/komponenty/WyborOpcji.svelte";

  // klient — dane wybranego klienta lub null gdy nie wybrano.
  // Przekazywany z +page.svelte przez dane().klient
  // onWybor — callback wywoływany gdy użytkownik wybierze klienta z modala.
  // Aktualizuje stan zamówienia w [id]/+layout.svelte przez zaktualizuj()
  let { klient = null, typKlienta = null, onWybor, onZmianaTypu } = $props();

  // Stan otwarcia modala wyszukiwania klienta.
  // Przekazywany do WyborKlienta przez bind:otwarty
  let modalOtwarty = $state(false);

  function handleWybor(wybranyKlient) {
    // Przekazujemy wybranego klienta do rodzica (+page.svelte)
    // który aktualizuje globalny stan zamówienia
    onWybor?.(wybranyKlient);
  }

  function otworzModal(e) {
    // blur() zdejmuje focus z karty — bez tego po zamknięciu modala
    // przez Escape na karcie zostaje czarna ramka focusu
    e.currentTarget.blur();
    modalOtwarty = true;
  }
</script>

<!-- Cała karta jest klikalnym przyciskiem otwierającym modal wyboru klienta.
     min-h-36 zapewnia stałą minimalną wysokość niezależnie od zawartości —
     karta nie "skacze" gdy zmienia się między empty state a danymi klienta. -->

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  role="button"
  tabindex="-1"
  onclick={otworzModal}
  class="relative w-full h-full min-h-36 rounded-lg bg-white shadow-sm text-left p-4 hover:bg-bg-primary transition-colors cursor-pointer"
>
  <p class="text-xs text-text-muted">
    Zamówienie dla:
    <!-- Tekst zmienia się dynamicznie zależnie od stanu -->
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
    <!-- Typ klienta — pływa w prawym dolnym rogu karty.
         stopPropagation zapobiega otwarciu modala przy kliknięciu w WyborOpcji. -->
    <div class="absolute bottom-3 right-3" onclick={(e) => e.stopPropagation()}>
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

<!-- Modal wyszukiwania klienta.
     bind:otwarty — dwukierunkowe powiązanie stanu otwarcia modala.
     Karta otwiera modal przez modalOtwarty = true,
     modal zamyka się przez otwarty = false (Escape lub kliknięcie backdropu) -->
<WyborKlienta bind:otwarty={modalOtwarty} onWybor={handleWybor} />
