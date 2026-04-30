<script>
  import { getContext } from 'svelte';
  import WyborKlienta from '$lib/komponenty/WyborKlienta.svelte';

  const { aktywnaSekcja } = getContext('zamowienie');
</script>

{#if aktywnaSekcja() === 'klient'}
  <div class="p-8">
    <h2 class="text-lg font-semibold text-text-heading mb-4">Klient i produkty</h2>
    <WyborKlienta />
  </div>
{:else if aktywnaSekcja() === 'przesylki'}
  <div class="p-8">
    <h2 class="text-lg font-semibold text-text-heading">Przesyłki</h2>
    <p class="mt-2 text-sm text-text-secondary">Tu będzie sekcja przesyłek.</p>
  </div>
{/if}