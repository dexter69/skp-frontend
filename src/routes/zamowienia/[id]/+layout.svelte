<script>
  import { getContext, onDestroy, setContext } from 'svelte';
  import { tworzStanZamowienia } from '$lib/stany/zamowienie.svelte.js';

  let { children } = $props();

  // Stan zamówienia tworzony przez dedykowaną funkcję z osobnego pliku.
  // TODO: zamiast mock danych, pobierać z API na podstawie id z URL
  const zamowienie = tworzStanZamowienia({ id: 123 });

  // Definicja sekcji formularza zamówienia.
  // disabled: true — sekcja widoczna ale niedostępna (placeholder na przyszłość)
  const sekcje = [
    { id: 'klient', label: 'Klient i produkty' },
    { id: 'przesylki', label: 'Przesyłki' },
    { id: 'podsumowanie', label: 'Podsumowanie', disabled: true },
  ];

  // Aktywna sekcja — domyślnie pierwsza
  let aktywnaSekcja = $state('klient');

  function wybierzSekcje(sekcja) {
    if (!sekcja.disabled) aktywnaSekcja = sekcja.id;
  }

  // badge: pokazuje 'Szkic' gdy zamówienie nie ma numeru (nieopublikowane).
  // Gdy zamówienie ma numer — badge znika (null = nie renderujemy).
  const badge = $derived(zamowienie.numer ? null : 'Szkic');

  // Tytuł w headerze PG:
  // — zamówienie z numerem: 'Zamówienie 256/26 MS'
  // — szkic bez numeru: 'Nowe zamówienie'
  const tytul = $derived(
    zamowienie.numer
      ? `Zamówienie ${zamowienie.numer}`
      : 'Nowe zamówienie'
  );

  // Wstrzykujemy nawigację sekcji do górnej strefy globalnego sidebara.
  // Snippet nawigacjaSekcji jest zdefiniowany poniżej w HTML.
  // onDestroy czyści górną strefę gdy użytkownik opuszcza widok zamówienia.
  const sidebar = getContext('sidebar');
  sidebar.ustawKontekst(nawigacjaSekcji);
  onDestroy(() => sidebar.wyczyscKontekst());

  // Udostępniamy stan zamówienia i aktywną sekcję dla podstron przez context.
  // dane() — funkcja (nie wartość) żeby zawsze zwracać aktualny stan
  // zaktualizuj() — częściowa aktualizacja stanu (tylko podane pola)
  setContext('zamowienie', {
    aktywnaSekcja: () => aktywnaSekcja,
    dane: () => zamowienie,
    zaktualizuj: (zmiany) => Object.assign(zamowienie, zmiany)
  });
</script>

<!-- Snippet renderowany w górnej strefie globalnego sidebara.
     Musi być zdefiniowany przed użyciem w sidebar.ustawKontekst() — 
     w Svelte 5 snippety są hoistowane więc kolejność w pliku nie ma znaczenia. -->
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

  <!-- Przycisk zapisu — stały na dole górnej strefy sidebara.
       Dostępny z każdej sekcji formularza. -->
  <div class="mt-4">
    <button class="w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-text-on-dark hover:bg-accent-hover transition-colors">
      Zapisz zamówienie
    </button>
  </div>
{/snippet}

<!-- Header PG: tytuł zamówienia + opcjonalny badge statusu.
     Badge pojawia się tylko gdy ma wartość (np. 'Szkic').
     Gdy zamówienie otrzyma numer po publikacji — badge znika automatycznie. -->
<div class="border-b border-border-default bg-bg-primary px-8 py-4 flex items-center gap-x-3">
  <h1 class="text-lg font-semibold text-text-heading">{tytul}</h1>
  {#if badge}
    <span class="inline-flex items-center rounded-md bg-border-default px-2 py-1 text-xs font-medium text-text-secondary">
      {badge}
    </span>
  {/if}
</div>

<!-- Treść aktywnej podstrony (edycja, podgląd, historia itp.) -->
<div class="flex-1 overflow-y-auto">
  {@render children()}
</div>