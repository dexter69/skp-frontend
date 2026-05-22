<script>
  // WyborAdresu — modal wyboru adresu dostawy z książki adresowej klienta.
  // Struktura wzorowana na WyborKlienta (Command Palette).
  // Lista adresów widoczna od razu — wyszukiwanie filtruje na żywo.
  // Filtry typów adresów generowane dynamicznie z dostępnych typów.

  let {
    adresy = [],         // lista adresów klienta — tablica obiektów adresu
    wybranyAdres = null, // aktualnie wybrany adres — podświetlony na liście
    otwarty = $bindable(false),
    onWybor,             // callback(adres) — wywoływany po wyborze
  } = $props();

  let fraza = $state('');
  let aktywnyFiltr = $state(null); // null = wszystkie typy

  // Unikalne typy adresów z listy — do generowania pill-buttonów filtrów.
  // Dynamiczne — nie hardkodujemy typów, bo będą pochodzić z API.
  const dostepneTypy = $derived(
    [...new Set(adresy.map(function(a) { return a.typ; }))]
  );

  // Filtrowanie po frazie (min. 2 znaki) i aktywnym typie.
  // Gdy fraza krótsza niż 2 znaki — pokazujemy wszystkie (tylko filtr typem).
  const widoczneAdresy = $derived(
    adresy.filter(function(a) {
      const pasujeFraza = fraza.length < 2 ||
        a.nazwa.toLowerCase().includes(fraza.toLowerCase()) ||
        a.miasto.toLowerCase().includes(fraza.toLowerCase());
      const pasujeTyp = aktywnyFiltr === null || a.typ === aktywnyFiltr;
      return pasujeFraza && pasujeTyp;
    })
  );

  // Etykiety typów adresów — wyświetlane na pill-buttonach filtrów i przy wierszach.
  // Docelowo mogą przyjść z API jako słownik — wtedy zastąpić ten obiekt.
  const ETYKIETY_TYPOW = {
    domyslny: 'Domyślny',
    dostawa: 'Dostawa',
    do_faktury: 'Do faktury',
    siedziba: 'Siedziba',
  };

  // Zwraca etykietę typu lub sam klucz gdy typ nieznany (przyszłe typy z API).
  function etykietaTypu(typ) {
    return ETYKIETY_TYPOW[typ] || typ;
  }

  function zamknij() {
    otwarty = false;
    fraza = '';
    aktywnyFiltr = null;
  }

  function wybierz(adres) {
    onWybor?.(adres);
    zamknij();
  }

  function handleKlawisz(e) {
    if (e.key === 'Escape' && otwarty) zamknij();
  }
</script>

<svelte:window onkeydown={handleKlawisz} />

{#if otwarty}
  <!-- Backdrop — przykrywa obszar roboczy (z pominięciem sidebara) -->
  <button
    type="button"
    onclick={zamknij}
    class="fixed inset-y-0 right-0 z-50 bg-gray-500/25 cursor-default left-(--sidebar-width)"
  ></button>

  <!-- Kontener modala — centrowany w obszarze roboczym -->
  <div class="fixed inset-y-0 right-0 z-50 overflow-y-auto p-20 pointer-events-none left-(--sidebar-width)">
    <div class="mx-auto max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl outline-1 outline-black/5 pointer-events-auto">

      <!-- Pole wyszukiwania z ikoną lupy -->
      <div class="grid grid-cols-1 border-b border-border-default">
        <input
          type="text"
          autofocus
          bind:value={fraza}
          placeholder="Szukaj po nazwie lub mieście..."
          class="col-start-1 row-start-1 h-12 w-full pr-4 pl-11 text-sm text-text-primary outline-hidden placeholder:text-text-muted"
        />
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          class="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-text-muted"
        >
          <path
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clip-rule="evenodd"
            fill-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Filtry typów — widoczne tylko gdy dostępny więcej niż jeden typ -->
      {#if dostepneTypy.length > 1}
        <div class="flex flex-wrap gap-2 border-b border-border-default px-4 py-2.5">
          <label class="group relative flex items-center justify-center rounded-md border px-3 py-1.5 cursor-pointer transition-colors
            {aktywnyFiltr === null ? 'border-accent bg-accent' : 'border-border-default bg-white hover:border-border-strong'}">
            <input
              type="radio"
              checked={aktywnyFiltr === null}
              onchange={() => { aktywnyFiltr = null; }}
              class="absolute inset-0 appearance-none focus:outline-none cursor-pointer"
            />
            <span class="text-sm font-medium {aktywnyFiltr === null ? 'text-white' : 'text-text-secondary'}">
              Wszystkie
            </span>
          </label>

          {#each dostepneTypy as typ}
            <label class="group relative flex items-center justify-center rounded-md border px-3 py-1.5 cursor-pointer transition-colors
              {aktywnyFiltr === typ ? 'border-accent bg-accent' : 'border-border-default bg-white hover:border-border-strong'}">
              <input
                type="radio"
                checked={aktywnyFiltr === typ}
                onchange={() => { aktywnyFiltr = typ; }}
                class="absolute inset-0 appearance-none focus:outline-none cursor-pointer"
              />
              <span class="text-sm font-medium {aktywnyFiltr === typ ? 'text-white' : 'text-text-secondary'}">
                {etykietaTypu(typ)}
              </span>
            </label>
          {/each}
        </div>
      {/if}

      <!-- Lista adresów -->
      <ul class="max-h-80 overflow-y-auto py-2">
        {#if widoczneAdresy.length === 0}
          <li class="px-4 py-3 text-sm text-text-muted">Brak wyników.</li>
        {:else}
          {#each widoczneAdresy as adres}
            <li>
              <button
                type="button"
                onclick={() => wybierz(adres)}
                class="w-full px-4 py-2.5 text-left transition-colors
                  {wybranyAdres && wybranyAdres.id === adres.id
                    ? 'bg-accent/10'
                    : 'hover:bg-bg-primary'}"
              >
                <!-- Linia 1: nazwa + etykieta typu po prawej -->
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium text-text-primary">{adres.nazwa}</span>
                  <span class="shrink-0 text-xs text-text-muted">{etykietaTypu(adres.typ)}</span>
                </div>
                <!-- Linia 2: ulica, kod pocztowy, miasto -->
                <p class="text-sm text-text-secondary">
                  {adres.ulica}, {adres.kodPocztowy} {adres.miasto}
                </p>
              </button>
            </li>
          {/each}
        {/if}
      </ul>

    </div>
  </div>
{/if}
