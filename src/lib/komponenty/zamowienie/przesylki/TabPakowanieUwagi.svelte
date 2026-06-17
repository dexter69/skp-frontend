<script>
  // TabPakowanieUwagi — zawartość taba "Pakowanie i uwagi" w panelu szczegółów przesyłki.
  // Lewa kolumna: pakowanie (tryb paczki lub palety).
  // Prawa kolumna: uwagi — zawsze widoczna niezależnie od trybu.
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.

  import Toggle from "$lib/komponenty/Toggle.svelte";
  import {
    obliczPakowanie,
    DOMYSLNE_ROZMIARY,
  } from "$lib/algorytmy/pakowanie.js";

  let {
    przesylka, // obiekt przesyłki { uwagi, palety, pakowanie, pozycje }
    styleKolumn, // CSS variables dla proporcji kolumn (--col-lewa, --col-prawa)
    onZmiana, // callback(zmiany) — aktualizuje dane przesyłki
    iloscDoSpakowania, // suma ilości wszystkich pozycji w przesyłce
  } = $props();

  // Rozmiary standardowych paczek — docelowo z API.
  const rozmiary = DOMYSLNE_ROZMIARY;

  // Tryb palet — gdy true, tabela paczek znika.
  const czyPalety = $derived(przesylka.palety ?? false);

  // Wiersze tabeli: standardowe (zawsze widoczne) + niestandardowe z pakowania.
  // Standardowe — jeden wiersz na każdy rozmiar, ilość 0 gdy nie używany.
  const wierszStandardowe = $derived(
    rozmiary.map(function (r) {
      const wpis = przesylka.pakowanie.find(function (p) {
        return p.pojemnosc === r && !p.niestandardowa;
      });
      return {
        pojemnosc: r,
        ilosc: wpis ? wpis.ilosc : 0,
        niestandardowa: false,
      };
    }),
  );

  // Niestandardowe — tylko te z pakowania które są niestandardowe.
  const wierszNiestandardowe = $derived(
    przesylka.pakowanie.filter(function (p) {
      return p.niestandardowa;
    }),
  );

  // Suma spakowanych sztuk — do wyświetlenia "X / Y".
  const iloscSpakowana = $derived(
    przesylka.pakowanie.reduce(function (s, p) {
      return s + p.pojemnosc * p.ilosc;
    }, 0),
  );

  // Czy wszystko spakowane?
  const czyKomplet = $derived(iloscSpakowana === iloscDoSpakowania);

  // Przelicz — uruchamia algorytm i zapisuje wynik przez callback.
  function przelicz() {
    const wynik = obliczPakowanie(
      przesylka.pozycje.filter(function (p) {
        return p.ilosc > 0;
      }),
      rozmiary,
    );
    onZmiana({ pakowanie: wynik });
  }
  

  // Aktualizuje ilość paczki standardowej danego rozmiaru.
  function zmienIloscStandardowej(pojemnosc, nowaIlosc) {
    const ilosc = parseInt(nowaIlosc, 10) || 0;
    // Nie rób nic gdy wartość się nie zmieniła
    const obecna = przesylka.pakowanie.find(function (p) {
      return p.pojemnosc === pojemnosc && !p.niestandardowa;
    });
    const obecnaIlosc = obecna ? obecna.ilosc : 0;
    if (ilosc === obecnaIlosc) return;

    const bezTego = przesylka.pakowanie.filter(function (p) {
      return !(p.pojemnosc === pojemnosc && !p.niestandardowa);
    });
    if (ilosc > 0) {
      onZmiana({
        pakowanie: [...bezTego, { pojemnosc, ilosc, niestandardowa: false }],
      });
    } else {
      onZmiana({ pakowanie: bezTego });
    }
  }

  // Aktualizuje ilość paczki niestandardowej (identyfikowanej przez indeks).
  function zmienIloscNiestandardowej(indeks, nowaIlosc) {
    const ilosc = parseInt(nowaIlosc, 10);
    const niestd = przesylka.pakowanie.filter(function (p) {
      return p.niestandardowa;
    });
    const std = przesylka.pakowanie.filter(function (p) {
      return !p.niestandardowa;
    });
    if (ilosc > 0) {
      niestd[indeks] = Object.assign({}, niestd[indeks], { ilosc });
    } else {
      niestd.splice(indeks, 1);
    }
    onZmiana({ pakowanie: [...std, ...niestd] });
  }

  // Dodaje nową paczkę niestandardową z podaną pojemnością.
  function dodajNiestandardowa(pojemnosc) {
    if (!pojemnosc || pojemnosc <= 0) return;
    const nowa = { pojemnosc, ilosc: 1, niestandardowa: true };
    onZmiana({ pakowanie: [...przesylka.pakowanie, nowa] });
  }

  // Stan lokalny pustego wiersza niestandardowego.
  let nowaPojemnosc = $state("");
</script>

<div class="flex h-full" style={styleKolumn}>
  <!-- Lewa kolumna: Pakowanie -->
  <div
    class="flex flex-col border-r border-gray-200 px-4 py-2 gap-2 overflow-y-auto"
    style="width: var(--col-lewa)"
  >
    <!-- Nagłówek: tytuł + przycisk Przelicz + toggle Palety -->
    <div class="flex items-center gap-3">
      <p
        class="text-xs font-semibold uppercase tracking-wide text-text-secondary"
      >
        Pakowanie
      </p>
      {#if !czyPalety}
        <button
          type="button"
          onclick={przelicz}
          class="ml-6 text-xs text-accent hover:text-accent-hover transition-colors"
        >
          Przelicz
        </button>
      {/if}
      <div class="flex-1"></div>
      <Toggle
        etykieta="Palety"
        wartosc={czyPalety}
        onZmiana={(v) => onZmiana({ palety: v })}
      />
    </div>

    {#if czyPalety}
      <p class="text-sm text-text-muted italic">
        Przesyłka na palecie — szczegóły w polu uwag.
      </p>
    {:else}
      <!-- Tabela paczek -->
      <div class="flex flex-col gap-1">
        <!-- Wiersze standardowe -->
        {#each wierszStandardowe as wiersz}
          <div class="flex items-center gap-2">
            <span class="flex-1 text-sm text-text-secondary">
              {wiersz.pojemnosc.toLocaleString("pl-PL")} szt.
            </span>
            <input
              type="text"
              value={wiersz.ilosc === 0 ? "" : wiersz.ilosc}
              placeholder="0"
              onfocus={(e) => e.target.select()}
              oninput={(e) => {
                const ilosc = parseInt(e.target.value, 10) || 0;
                zmienIloscStandardowej(wiersz.pojemnosc, ilosc);
              }}
              onblur={(e) =>
                zmienIloscStandardowej(wiersz.pojemnosc, e.target.value || 0)}
              class="w-14 rounded border border-transparent bg-transparent
                     px-1.5 py-0.5 text-right text-sm text-text-primary
                     placeholder:text-text-muted
                     focus:border-border-focus focus:bg-input-bg focus:outline-none"
            />
            <span class="text-xs text-text-muted w-6">szt.</span>
          </div>
        {/each}

        <!-- Separator przed niestandardowymi (tylko gdy są) -->
        {#if wierszNiestandardowe.length > 0}
          <div class="border-t border-border-default my-1"></div>
        {/if}

        <!-- Wiersze niestandardowe -->
        {#each wierszNiestandardowe as wiersz, i}
          <div class="flex items-center gap-2">
            <span class="flex-1 text-sm text-warning-text">
              {wiersz.pojemnosc.toLocaleString("pl-PL")} szt.
            </span>
            <input
              type="text"
              value={wiersz.ilosc}
              onfocus={(e) => e.target.select()}
              oninput={(e) => {
                const ilosc = parseInt(e.target.value, 10) || 0;
                zmienIloscStandardowej(wiersz.pojemnosc, ilosc);
              }}
              onblur={(e) => zmienIloscNiestandardowej(i, e.target.value)}
              class="w-14 rounded border border-transparent bg-transparent
                     px-1.5 py-0.5 text-right text-sm text-warning-text
                     focus:border-border-focus focus:bg-input-bg focus:outline-none"
            />
            <span class="text-xs text-warning-text w-6">szt.</span>
          </div>
        {/each}

        <!-- Pusty wiersz do dodania niestandardowej — gdy coś niespakowane -->
        {#if iloscSpakowana < iloscDoSpakowania}
          <div class="flex items-center gap-2 mt-1">
            <input
              type="text"
              bind:value={nowaPojemnosc}
              placeholder="pojemność..."
              onkeydown={(e) => {
                if (e.key === "Enter") {
                  dodajNiestandardowa(parseInt(nowaPojemnosc, 10));
                  nowaPojemnosc = "";
                }
              }}
              onblur={() => {
                if (nowaPojemnosc) {
                  dodajNiestandardowa(parseInt(nowaPojemnosc, 10));
                  nowaPojemnosc = "";
                }
              }}
              class="flex-1 rounded border border-dashed border-border-default bg-transparent
                     px-1.5 py-0.5 text-sm text-text-muted placeholder:text-text-muted
                     focus:border-border-focus focus:bg-input-bg focus:outline-none"
            />
            <span class="text-xs text-text-muted w-6">szt.</span>
          </div>
        {/if}

        <!-- Suma -->
        <div
          class="flex items-center gap-2 mt-2 pt-2 border-t border-border-default"
        >
          <span class="flex-1 text-xs font-medium text-text-secondary"
            >Razem</span
          >
          <span
            class="text-sm font-semibold {czyKomplet
              ? 'text-success-text'
              : 'text-warning-text'}"
          >
            {iloscSpakowana.toLocaleString("pl-PL")} / {iloscDoSpakowania.toLocaleString(
              "pl-PL",
            )}
          </span>
          {#if czyKomplet}
            <span class="text-success-text text-xs">✓</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Prawa kolumna: Uwagi — zawsze widoczna -->
  <div
    class="flex flex-col px-4 py-3 gap-2 min-h-0 flex-1"
    style="width: var(--col-prawa)"
  >
    <p
      class="text-xs font-semibold uppercase tracking-wide text-text-secondary shrink-0"
    >
      Uwagi
    </p>
    <textarea
      value={przesylka.uwagi}
      oninput={(e) => onZmiana({ uwagi: e.target.value })}
      placeholder="Uwagi do przesyłki..."
      class="flex-1 min-h-0 w-full resize-none rounded-lg bg-input-bg px-3 py-2
             text-sm text-text-primary placeholder:text-text-muted
             border border-input-border
             focus:outline-none focus:border-border-focus"
    ></textarea>
  </div>
</div>
