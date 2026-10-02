<script>
  // WyborAdresu — modal wyboru adresu dostawy z książki adresowej klienta.
  // Struktura wzorowana na WyborKlienta (Command Palette).
  // Lista adresów widoczna od razu — wyszukiwanie filtruje na żywo.
  //
  // Co pokazujemy:
  // — najpierw adresy wysyłki (isWysylka) — to z nich wybiera się adres przesyłki,
  //   z oznaczeniami "Domyślny" i "Siedziba";
  // — pozostałe adresy klienta są ukryte za przyciskiem "+N innych adresów — pokaż".
  //   Nie chowamy ich całkiem: handlowiec, który nie zna klienta (np. zastępstwo),
  //   musi zobaczyć, że adres już jest w książce — inaczej doda go drugi raz.
  //   Takie adresy też można wybrać (są oznaczone "Nie do wysyłki").
  // Gdy klient nie ma żadnego adresu wysyłki — od razu pokazujemy wszystkie.

  let {
    adresy = [],         // lista adresów klienta — tablica obiektów adresu (format API)
    wybranyAdres = null, // aktualnie wybrany adres — podświetlony na liście
    otwarty = $bindable(false),
    onWybor,             // callback(adres) — wywoływany po wyborze
  } = $props();

  let fraza = $state('');
  let pokazPozostale = $state(false); // czy pokazać adresy spoza wysyłki

  const adresyWysylki = $derived(adresy.filter(function(a) { return a.isWysylka; }));
  const pozostaleAdresy = $derived(adresy.filter(function(a) { return !a.isWysylka; }));

  // Pozostałe adresy widoczne po kliknięciu albo gdy nie ma żadnego adresu wysyłki.
  const widacPozostale = $derived(pokazPozostale || adresyWysylki.length === 0);

  // Filtrowanie po frazie (min. 2 znaki): nazwa, ulica, miasto.
  // Gdy fraza krótsza niż 2 znaki — pokazujemy wszystkie widoczne adresy.
  // API zwraca null dla pustych pól — stąd (a.nazwa || '') przed toLowerCase().
  const widoczneAdresy = $derived(
    (widacPozostale ? adresyWysylki.concat(pozostaleAdresy) : adresyWysylki)
      .filter(function(a) {
        if (fraza.length < 2) return true;
        const f = fraza.toLowerCase();
        return (a.nazwa || '').toLowerCase().includes(f) ||
          (a.ulica || '').toLowerCase().includes(f) ||
          (a.miasto || '').toLowerCase().includes(f);
      })
  );

  // Tekst przycisku dla ukrytych adresów — z polską odmianą liczebnika:
  // 1 inny adres, 2–4 inne adresy (bez 12–14), 5+ innych adresów.
  function tekstPozostalych(n) {
    const reszta10 = n % 10;
    const reszta100 = n % 100;
    if (n === 1) return '+1 inny adres klienta (nie do wysyłki) — pokaż';
    if (reszta10 >= 2 && reszta10 <= 4 && (reszta100 < 12 || reszta100 > 14)) {
      return '+' + n + ' inne adresy klienta (nie do wysyłki) — pokaż';
    }
    return '+' + n + ' innych adresów klienta (nie do wysyłki) — pokaż';
  }

  // Druga linia wiersza: "ulica, kod miasto" — puste części pomijamy,
  // żeby nie było np. ", 62-800 Kalisz" przy braku ulicy.
  function liniaAdresu(adres) {
    const miejscowosc = [adres.kod, adres.miasto].filter(Boolean).join(' ');
    return [adres.ulica, miejscowosc].filter(Boolean).join(', ');
  }

  function zamknij() {
    otwarty = false;
    fraza = '';
    pokazPozostale = false;
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
          placeholder="Szukaj po nazwie, ulicy lub mieście..."
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
                <!-- Linia 1: nazwa + oznaczenia po prawej (tylko te, które mają znaczenie) -->
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium text-text-primary">{adres.nazwa}</span>
                  <span class="flex shrink-0 gap-2 text-xs">
                    {#if adres.isDefault}
                      <span class="font-medium text-accent">Domyślny</span>
                    {/if}
                    {#if adres.isSiedziba}
                      <span class="text-text-muted">Siedziba</span>
                    {/if}
                    {#if !adres.isWysylka}
                      <span class="text-text-muted italic">Nie do wysyłki</span>
                    {/if}
                  </span>
                </div>
                <!-- Linia 2: ulica, kod pocztowy, miasto -->
                <p class="text-sm text-text-secondary">
                  {liniaAdresu(adres)}
                </p>
              </button>
            </li>
          {/each}
        {/if}
      </ul>

      <!-- Ukryte adresy spoza wysyłki — przycisk, żeby je pokazać -->
      {#if !widacPozostale && pozostaleAdresy.length > 0}
        <div class="border-t border-border-default px-4 py-2.5">
          <button
            type="button"
            onclick={() => { pokazPozostale = true; }}
            class="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {tekstPozostalych(pozostaleAdresy.length)}
          </button>
        </div>
      {/if}

    </div>
  </div>
{/if}
