<script>
  import { getContext, onDestroy, setContext } from "svelte";
  import {
    tworzStanZamowienia,
    tworzDomyslnaPrzesylke,
  } from "$lib/stany/zamowienie.svelte.js";

  let { children } = $props();

  // Stan zamówienia tworzony przez dedykowaną funkcję z osobnego pliku.
  // TODO: zamiast mock danych, pobierać z API na podstawie id z URL
  const zamowienie = tworzStanZamowienia({
    id: 123,
    produkty: [
      { id: -1, nazwa: "Karty wizytowe", ilosc: 500, cena: 2.69 },
      { id: -2, nazwa: "Ulotki A5", ilosc: 500, cena: 1.2 },
    ],
  });

  // Definicja sekcji formularza zamówienia.
  // disabled: true — sekcja widoczna w sidebarze ale niedostępna (placeholder na przyszłość)
  const sekcje = [
    { id: "klient", label: "Klient i produkty" },
    { id: "przesylki", label: "Przesyłki" },
    { id: "podsumowanie", label: "Podsumowanie", disabled: true },
  ];

  // Aktywna sekcja — domyślnie pierwsza
  let aktywnaSekcja = $state("klient");

  // Przełącza aktywną sekcję.
  // Przy pierwszym wejściu do sekcji "przesylki": inicjalizuje domyślną przesyłkę
  // jeśli lista jest pusta i są produkty w zamówieniu.
  // Inicjalizacja tu (nie w SekcjaPrzesylki) — dane gotowe zanim komponent się zamontuje,
  // dzięki czemu SekcjaPrzesylki nie potrzebuje $effect.
  function wybierzSekcje(sekcja) {
    if (sekcja.disabled) return;

    if (
      sekcja.id === "przesylki" &&
      zamowienie.przesylki.length === 0 &&
      zamowienie.produkty.length > 0
    ) {
      zamowienie.przesylki = [tworzDomyslnaPrzesylke(zamowienie.produkty)];
    }

    aktywnaSekcja = sekcja.id;
  }

  // badge: pokazuje 'Szkic' gdy zamówienie nie ma numeru (nieopublikowane).
  const badge = $derived(zamowienie.numer ? null : "Szkic");

  // Tytuł w headerze PG:
  // — zamówienie z numerem: 'Zamówienie 256/26 MS'
  // — szkic bez numeru: 'Nowe zamówienie'
  const tytul = $derived(
    zamowienie.numer ? `Zamówienie ${zamowienie.numer}` : "Nowe zamówienie",
  );

  // Wstrzykujemy snippet nawigacjaSekcji do górnej strefy globalnego sidebara.
  // onDestroy czyści górną strefę gdy użytkownik opuszcza widok zamówienia.
  const sidebar = getContext("sidebar");
  sidebar.ustawKontekst(nawigacjaSekcji);
  onDestroy(() => sidebar.wyczyscKontekst());

  // Udostępniamy stan zamówienia dla podstron przez Context API.
  // dane() — funkcja zwracająca aktualny stan — zawsze świeże dane
  // zaktualizuj() — częściowa aktualizacja, obsługuje zagnieżdżone obiekty przez merge
  setContext("zamowienie", {
    aktywnaSekcja: () => aktywnaSekcja,
    dane: () => zamowienie,
    zaktualizuj: (zmiany) => {
      for (const [klucz, wartosc] of Object.entries(zmiany)) {
        if (
          wartosc !== null &&
          typeof wartosc === "object" &&
          !Array.isArray(wartosc)
        ) {
          zamowienie[klucz] = { ...zamowienie[klucz], ...wartosc };
        } else {
          zamowienie[klucz] = wartosc;
        }
      }
    },
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
    <button
      class="w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-text-on-dark hover:bg-accent-hover transition-colors"
    >
      Zapisz zamówienie
    </button>
  </div>
{/snippet}

<div
  class="shrink-0 border-b border-border-default bg-bg-primary px-8 py-4 flex items-center gap-x-3"
>
  <h1 class="text-lg font-semibold text-text-heading">{tytul}</h1>
  {#if badge}
    <span
      class="inline-flex items-center rounded-md bg-border-default px-2 py-1 text-xs font-medium text-text-secondary"
    >
      {badge}
    </span>
  {/if}
</div>

<div class="flex-1 overflow-clip">
  {@render children()}
</div>
