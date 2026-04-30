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

  // Mock danych — później przyjdą z API
  let zamowienie = $state({
    id: 123,
    numer: null,   // null = szkic, '256/26 MS' = opublikowane
  });

  const badge = $derived(zamowienie.numer ? null : 'Szkic');

  const tytul = $derived(
    zamowienie.numer
      ? `Zamówienie ${zamowienie.numer}`
      : 'Nowe zamówienie'
  );

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
    <button class="w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-text-on-dark hover:bg-accent-hover transition-colors">
      Zapisz zamówienie
    </button>
  </div>
{/snippet}

<!-- Header PG -->
<div class="border-b border-border-default bg-bg-primary px-8 py-4 flex items-center gap-x-3">
  <h1 class="text-lg font-semibold text-text-heading">{tytul}</h1>
  {#if zamowienie.badge}
    <span class="inline-flex items-center rounded-md bg-border-default px-2 py-1 text-xs font-medium text-text-secondary">
      {badge}
    </span>
  {/if}
</div>

<!-- Treść strony -->
<div class="flex-1 overflow-y-auto">
  {@render children()}
</div>