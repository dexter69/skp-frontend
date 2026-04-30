<script>
  import { getContext } from 'svelte';
  import WyborKlienta from '$lib/komponenty/WyborKlienta.svelte';

  const { aktywnaSekcja } = getContext('zamowienie');

  let wybranyKlient = $state(null);

  function handleWyborKlienta(klient) {
    wybranyKlient = klient;
  }
</script>

{#if aktywnaSekcja() === 'klient'}
  <div class="flex h-full gap-4 p-6">

    <!-- Lewa kolumna: grid 2-kolumnowy (70% → 50% przy małym oknie) -->
    <div class="flex w-1/2 shrink-0 flex-col gap-4 overflow-y-auto xl:w-7/10">
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">

        <!-- Wiersz 1: Karta klienta -->
        <div class="overflow-hidden rounded-lg bg-white shadow-sm">
          <div class="p-4">
            <WyborKlienta onWybor={handleWyborKlienta} />
            {#if wybranyKlient}
              <div class="mt-4">
                <p class="text-xs text-text-muted">Zamówienie dla:</p>
                <p class="mt-1 text-lg font-bold text-text-heading">{wybranyKlient.nazwa}</p>
                <p class="text-sm text-text-secondary">{wybranyKlient.miasto}</p>
                <p class="text-sm text-text-secondary">NIP: {wybranyKlient.nip}</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Wiersz 1: Data + Ekspresowe + Nowy/Stały -->
        <div class="overflow-hidden rounded-lg bg-white shadow-sm">
          <div class="p-4">
            <p class="text-sm text-text-muted">Tu będzie: data realizacji, ekspresowe, nowy/stały...</p>
          </div>
        </div>

        <!-- Wiersz 2: Płatności -->
        <div class="overflow-hidden rounded-lg bg-white shadow-sm">
          <div class="p-4">
            <p class="text-sm text-text-muted">Tu będą płatności...</p>
          </div>
        </div>

        <!-- Wiersz 2: Dane do faktury -->
        <div class="overflow-hidden rounded-lg bg-white shadow-sm">
          <div class="p-4">
            <p class="text-sm text-text-muted">Tu będą dane do faktury...</p>
          </div>
        </div>

        <!-- Wiersz 3: Uwagi (cała szerokość) -->
        <div class="col-span-1 overflow-hidden rounded-lg bg-white shadow-sm xl:col-span-2">
          <div class="p-4">
            <p class="text-sm text-text-muted">Tu będą uwagi...</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Prawa kolumna: produkty (30% → 50% przy małym oknie) -->
    <div class="flex w-1/2 shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm xl:w-3/10">
      <div class="border-b border-border-default px-4 py-3">
        <h3 class="text-sm font-semibold text-text-heading">Produkty</h3>
      </div>
      <div class="flex-1 overflow-y-auto px-4 py-3">
        <p class="text-sm text-text-muted">Tu będzie lista produktów...</p>
      </div>
    </div>

  </div>

{:else if aktywnaSekcja() === 'przesylki'}
  <div class="p-8">
    <h2 class="text-lg font-semibold text-text-heading">Przesyłki</h2>
    <p class="mt-2 text-sm text-text-secondary">Tu będzie sekcja przesyłek.</p>
  </div>
{/if}