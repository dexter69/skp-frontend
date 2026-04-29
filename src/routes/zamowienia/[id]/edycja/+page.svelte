<script>
  import { getContext } from 'svelte';
  const { aktywnaSekcja } = getContext('zamowienie');
</script>

{#if aktywnaSekcja() === 'klient'}
  <div class="p-8">
    <h2 class="text-lg font-semibold text-gray-900">Klient i produkty</h2>
    <p class="mt-2 text-sm text-gray-500">Tu będzie sekcja klienta i produktów.</p>
  </div>
{:else if aktywnaSekcja() === 'przesylki'}
  <div class="p-8">
    <h2 class="text-lg font-semibold text-gray-900">Przesyłki</h2>
    <p class="mt-2 text-sm text-gray-500">Tu będzie sekcja przesyłek.</p>
  </div>
{/if}
