<script>
  import { getContext, onDestroy, setContext } from 'svelte';

  let { children } = $props();

  const sekcje = [
    { id: 'klient', label: 'Klient i produkty' },
    { id: 'przesylki', label: 'Przesyłki' },
    { id: 'podsumowanie', label: 'Podsumowanie', disabled: true },
  ];

  let aktywnaSekcja = $state('klient');

  function wybierzSekcje(sekcja) {
    if (!sekcja.disabled) aktywnaSekcja = sekcja.id;
  }

  const sidebar = getContext('sidebar');
  sidebar.ustawKontekst(nawigacjaSekcji);
  onDestroy(() => sidebar.wyczyscKontekst());

  setContext('zamowienie', {
    aktywnaSekcja: () => aktywnaSekcja
  });
</script>

{#snippet nawigacjaSekcji()}
  <ul class="space-y-1">
    {#each sekcje as sekcja}
      <li>
        <button
          type="button"
          onclick={() => wybierzSekcje(sekcja)}
          class="w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors
            {sekcja.disabled
              ? 'cursor-not-allowed text-gray-500'
              : aktywnaSekcja === sekcja.id
                ? 'bg-white/10 text-white font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}"
        >
          {sekcja.label}
        </button>
      </li>
    {/each}
  </ul>

  <div class="mt-4">
    <button class="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
      Zapisz zamówienie
    </button>
  </div>
{/snippet}

{@render children()}
