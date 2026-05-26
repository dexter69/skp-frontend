<script>
  import { getContext, onDestroy, setContext } from "svelte";
  import {
    tworzStanZamowienia,
    tworzDomyslnaPrzesylke,
  } from "$lib/stany/zamowienie.svelte.js";

  // data pochodzi z load() w +layout.js — mock lub docelowo API.
  let { children, data } = $props();

  // Stan zamówienia tworzony na podstawie danych z load().
  // Gdy load() zostanie podpięty do API — tu nic się nie zmienia.
  const zamowienie = tworzStanZamowienia(data.zamowienie);

  // Definicja sekcji formularza zamówienia.
  const sekcje = [
    { id: "klient", label: "Klient i produkty" },
    { id: "przesylki", label: "Przesyłki" },
    { id: "podsumowanie", label: "Podsumowanie", disabled: true },
  ];

  let aktywnaSekcja = $state("klient");

  // Przełącza aktywną sekcję.
  // Przy pierwszym wejściu do "przesylki": inicjalizuje domyślną przesyłkę.
  function wybierzSekcje(sekcja) {
    if (sekcja.disabled) return;

    if (
      sekcja.id === "przesylki" &&
      zamowienie.przesylki.length === 0 &&
      zamowienie.produkty.length > 0
    ) {
      const domyslnyAdres = zamowienie.klient
        ? zamowienie.klient.adresy.find(function (a) {
            return a.typ === "domyslny";
          }) || zamowienie.klient.adresy[0]
        : null;
      const przesylka = tworzDomyslnaPrzesylke(zamowienie.produkty);
      przesylka.adres = domyslnyAdres;
      zamowienie.przesylki = [przesylka];
    }

    aktywnaSekcja = sekcja.id;
  }

  const badge = $derived(zamowienie.numer ? null : "Szkic");

  const tytul = $derived(
    zamowienie.numer ? `Zamówienie ${zamowienie.numer}` : "Nowe zamówienie",
  );

  const sidebar = getContext("sidebar");
  sidebar.ustawKontekst(nawigacjaSekcji);
  onDestroy(() => sidebar.wyczyscKontekst());

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

<div class="flex flex-col h-full">
  <div
    class="shrink-0 border-b border-border-default bg-bg-primary px-8 py-4 flex items-center gap-x-3"
  >
    <h1 class="text-2xl font-semibold text-text-heading">{tytul}</h1>
    {#if badge}
      <span
        class="inline-flex items-center rounded-md bg-border-default px-2 py-1 text-xs font-medium text-text-secondary"
      >
        {badge}
      </span>
    {/if}
  </div>

  <div class="flex flex-col flex-1 overflow-hidden">
    {@render children()}
  </div>
</div>
