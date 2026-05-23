<script>
  // TabDostawa — zawartość taba "Dostawa" w panelu szczegółów przesyłki.
  // Dwie kolumny: lewa (typ dostawy, kurier, adres) + prawa (lista produktów "Co jedzie").
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.

  import WyborOpcji from "$lib/komponenty/WyborOpcji.svelte";

  let {
    przesylka, // obiekt przesyłki { typDostawy, adres, kurier, pozycje }
    produkty, // lista wszystkich produktów zamówienia — do wyświetlenia nazw
    adresy,
    styleKolumn, // CSS variables dla proporcji kolumn (--col-lewa, --col-prawa)
    onZmiana, // callback(zmiany) — aktualizuje dane przesyłki
    onZmianaIlosci, // callback(produkt_id, ilosc) — zmiana ilości produktu w przesyłce
    onOtworzWyborAdresu,  // callback() — otwiera modal wyboru adresu (renderowany wyżej)
  } = $props();

  // Opcje typu dostawy — docelowo z API, na razie mock.
  const OPCJE_TYPU_DOSTAWY = [
    { id: "kurier", label: "Kurier" },
    { id: "magazyn", label: "Magazyn" },
    { id: "odbior_osobisty", label: "Odbiór osobisty" },
    { id: "kurier_klienta", label: "Kurier klienta" },
  ];

  // Lista kurierów — docelowo z API, na razie mock.
  const KURIERZY = [
    { value: "ups", label: "UPS" },
    { value: "dhl", label: "DHL" },
    { value: "dpd", label: "DPD" },
    { value: "fedex", label: "FedEx" },
    { value: "inpost", label: "InPost" },
    { value: "nietypowy", label: "Nietypowy" },
  ];

  // Czy typ dostawy wymaga wyboru kuriera?
  const czyWyborKuriera = $derived(przesylka.typDostawy === "kurier");

  // Zmiana typu dostawy resetuje adres i kuriera.
  function zmienTypDostawy(nowyTyp) {
    onZmiana({ typDostawy: nowyTyp, adres: null, kurier: null });
  }

  // Produkty które jadą tą przesyłką (ilość > 0).
  // Łączymy pozycje przesyłki z danymi produktów z zamówienia (nazwa).
  const pozycjeDoWyswietlenia = $derived(
    przesylka.pozycje
      .filter(function (poz) {
        return poz.ilosc > 0;
      })
      .map(function (poz) {
        const produkt = produkty.find(function (p) {
          return p.id === poz.produkt_id;
        });
        return {
          produkt_id: poz.produkt_id,
          nazwa: produkt ? produkt.nazwa : "(usunięty)",
          ilosc: poz.ilosc,
        };
      }),
  );

  // Próg przełączenia na dwie kolumny w "Co jedzie".
  // Zależy od wysokości panelu (~280px) i wiersza (~28px) — ok. 7 wierszy w jednej kolumnie.
  const PROG_DWOCH_KOLUMN = 7;

  // Parsuje ilość przy oninput — bez walidacji minimum (podgląd na żywo).
  function parsujPodglad(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  // Parsuje ilość przy onblur — walidacja minimum 0.
  function parsujIlosc(wartosc) {
    const n = parseInt(wartosc, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  // let modalAdresuOtwarty = $state(false);
</script>

<div class="flex h-full" style={styleKolumn}>
  <!-- Lewa kolumna: Dostawa -->
  <div
    class="flex flex-col border-r border-gray-200 px-4 py-3 gap-3 overflow-y-auto"
    style="width: var(--col-lewa)"
  >
    <WyborOpcji
      opcje={OPCJE_TYPU_DOSTAWY}
      wartosc={przesylka.typDostawy}
      onZmiana={zmienTypDostawy}
    />

    {#if czyWyborKuriera}
      <div class="flex flex-col gap-1">
        <p class="text-xs font-medium text-text-secondary">Firma kurierska</p>
        <select
          value={przesylka.kurier ?? ""}
          onchange={(e) => onZmiana({ kurier: e.target.value || null })}
          class="rounded border border-input-border bg-input-bg px-2 py-1.5
                 text-sm text-input-text
                 focus:outline-none focus:border-border-focus"
        >
          <option value="">— wybierz —</option>
          {#each KURIERZY as k}
            <option value={k.value}>{k.label}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- zastępujemy drugi {#if czyWyborKuriera} blok z adresem -->

    {#if czyWyborKuriera}
      <div class="flex flex-col gap-1">
        <p class="text-xs font-medium text-text-secondary">Adres dostawy</p>

        {#if przesylka.adres}
          <!-- Karta z adresem — klikalna, otwiera WyborAdresu -->
          <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
          <div
            role="button"
            tabindex="-1"            
            onclick={() => onOtworzWyborAdresu?.()}
            class="rounded-lg bg-white shadow-sm p-3 cursor-pointer hover:bg-bg-primary transition-colors"
          >
            <p class="text-sm font-semibold text-text-heading">
              {przesylka.adres.nazwa}
            </p>
            <p class="text-xs text-text-secondary mt-0.5">
              {przesylka.adres.ulica}
            </p>
            <p class="text-xs text-text-secondary">
              {przesylka.adres.kodPocztowy}
              {przesylka.adres.miasto}
            </p>
          </div>
        {:else}
          <!-- Brak klienta — karta nieaktywna -->
          <div
            class="rounded-lg bg-white shadow-sm p-3 opacity-40 cursor-default"
          >
            <p class="text-sm italic text-text-muted">Nie wybrano klienta</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Prawa kolumna: Co jedzie.
       Warunkowy układ: jedna kolumna gdy produktów <= PROG_DWOCH_KOLUMN,
       dwie kolumny gdy więcej. -->
  <div
    class="flex flex-col px-4 py-3 gap-2 overflow-y-auto"
    style="width: var(--col-prawa)"
  >
    <p
      class="text-xs font-semibold uppercase tracking-wide text-text-secondary"
    >
      Co jedzie
    </p>

    {#if pozycjeDoWyswietlenia.length === 0}
      <p class="text-sm text-text-muted">
        Brak produktów — wpisz ilości w tabeli powyżej.
      </p>
    {:else if pozycjeDoWyswietlenia.length > PROG_DWOCH_KOLUMN}
      <div class="columns-2 gap-x-3">
        {#each pozycjeDoWyswietlenia as poz}
          <div class="flex items-center gap-1 min-w-0 break-inside-avoid mb-1">
            <span
              class="flex-1 min-w-0 truncate text-sm text-text-primary"
              title={poz.nazwa}
            >
              {poz.nazwa}
            </span>
            <input
              type="text"
              value={poz.ilosc}
              onfocus={(e) => e.target.select()}
              oninput={(e) =>
                onZmianaIlosci(poz.produkt_id, parsujPodglad(e.target.value))}
              onblur={(e) => {
                const ilosc = parsujIlosc(e.target.value);
                e.target.value = ilosc;
                onZmianaIlosci(poz.produkt_id, ilosc);
              }}
              class="w-16 shrink-0 rounded border border-transparent bg-transparent
                       px-1.5 py-0.5 text-right text-sm text-text-primary
                       focus:border-border-focus focus:bg-input-bg focus:outline-none"
            />
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex flex-col gap-1">
        {#each pozycjeDoWyswietlenia as poz}
          <div class="flex items-center gap-1 min-w-0">
            <span
              class="flex-1 min-w-0 truncate text-sm text-text-primary"
              title={poz.nazwa}
            >
              {poz.nazwa}
            </span>
            <input
              type="text"
              value={poz.ilosc}
              onfocus={(e) => e.target.select()}
              oninput={(e) =>
                onZmianaIlosci(poz.produkt_id, parsujPodglad(e.target.value))}
              onblur={(e) => {
                const ilosc = parsujIlosc(e.target.value);
                e.target.value = ilosc;
                onZmianaIlosci(poz.produkt_id, ilosc);
              }}
              class="w-16 shrink-0 rounded border border-transparent bg-transparent
                       px-1.5 py-0.5 text-right text-sm text-text-primary
                       focus:border-border-focus focus:bg-input-bg focus:outline-none"
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>  
</div>
