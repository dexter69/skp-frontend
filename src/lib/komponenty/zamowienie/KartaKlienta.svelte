<script>
  import WyborKlienta from "$lib/komponenty/WyborKlienta.svelte";

  // let { klient = $bindable(null) } = $props();
  let { klient = null, onWybor } = $props();

  let modalOtwarty = $state(false);

  function handleWybor(wybranyKlient) {
    // klient = wybranyKlient;
    onWybor?.(wybranyKlient);
  }

  function otworzModal(e) {
    e.currentTarget.blur();
    modalOtwarty = true;
  }
</script>

<button
  type="button"
  onclick={otworzModal}
  class="w-full h-full min-h-36 rounded-lg bg-white shadow-sm text-left p-4 hover:bg-bg-primary transition-colors"
>
  <p class="text-xs text-text-muted">
    Zamówienie dla:
    <span class="text-text-muted"
      >(kliknij aby {klient ? "zmienić" : "wybrać"})</span
    >
  </p>

  {#if klient}
    <div class="mt-3">
      <p class="text-base font-bold text-text-heading">{klient.nazwa}</p>
      <p class="mt-1 text-sm text-text-secondary">{klient.miasto}</p>
      <p class="text-sm text-text-secondary">NIP: {klient.nip}</p>
    </div>
  {:else}
    <div class="mt-3">
      <p class="text-sm text-text-muted italic">Nie wybrano klienta...</p>
    </div>
  {/if}
</button>

<WyborKlienta bind:otwarty={modalOtwarty} onWybor={handleWybor} />
