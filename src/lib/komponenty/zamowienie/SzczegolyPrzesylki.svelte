<script>
  // SzczegolyPrzesylki — panel szczegółów aktywnej przesyłki.
  // Wyświetlany pod tabelą krzyżową w SekcjaPrzesylki.
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.

  import WyborOpcji from "$lib/komponenty/WyborOpcji.svelte";

  let {
    przesylka,      // obiekt przesyłki { id, nazwa, typDostawy, adres, kurier, uwagi, pozycje }
    produkty,       // lista wszystkich produktów zamówienia — do wyświetlenia "Co jedzie"
    numerPrzesylki, // numer porządkowy (1, 2, ...) — do wyświetlenia "Przesyłka N"
    onZmiana,       // callback(zmiany) — aktualizuje dane przesyłki w stanie zamówienia
    onUsun,         // callback() — usuwa tę przesyłkę
  } = $props();

  // Opcje typu dostawy — docelowo z API, na razie mock.
  // id musi odpowiadać wartościom typDostawy w stanie zamówienia.
  const OPCJE_TYPU_DOSTAWY = [
    { id: 'kurier', label: 'Kurier' },
    { id: 'magazyn', label: 'Magazyn' },
    { id: 'odbior_osobisty', label: 'Odbiór osobisty' },
    { id: 'kurier_klienta', label: 'Kurier klienta' },
  ];

  // Czy typ dostawy wymaga adresu?
  // Tylko 'kurier' — pozostałe typy nie mają adresu docelowego.
  const czyMaAdres = $derived(przesylka.typDostawy === 'kurier');

  // Produkty które jadą tą przesyłką (ilość > 0).
  // Łączymy pozycje przesyłki z danymi produktów z zamówienia.
  const pozycjeDoWyswietlenia = $derived(
    przesylka.pozycje
      .filter(function(poz) { return poz.ilosc > 0; })
      .map(function(poz) {
        const produkt = produkty.find(function(p) { return p.id === poz.produkt_id; });
        return {
          produkt_id: poz.produkt_id,
          nazwa: produkt ? produkt.nazwa : '(usunięty)',
          ilosc: poz.ilosc
        };
      })
  );

  // Tekst nagłówka — nazwa firmy lub nazwa typu dostawy gdy brak adresu.
  const naglowekNazwa = $derived(
    czyMaAdres
      ? (przesylka.adres ? przesylka.adres.nazwa : 'Wybierz adres...')
      : OPCJE_TYPU_DOSTAWY.find(function(o) { return o.id === przesylka.typDostawy; })?.label.toUpperCase()
  );

  // Tekst drugiej linii nagłówka — adres lub null gdy brak adresu.
  const naglowekAdres = $derived(
    czyMaAdres && przesylka.adres ? przesylka.adres.opis : null
  );
</script>

<!-- Kontener panelu — wypełnia przestrzeń przyznaną przez SekcjaPrzesylki (flex-1 min-h-0).
     flex-col: nagłówek + ciało (dwie kolumny) + uwagi. -->
<div class="flex h-full min-h-0 flex-col">

  <!-- NAGŁÓWEK — adres/typ po lewej, "Przesyłka N" po prawej, Usuń w rogu -->
  <div class="flex shrink-0 items-start justify-between border-b border-border-default px-5 py-3">

    <!-- Lewa strona: nazwa (bold) + adres (druga linia) -->
    <div
      class="flex flex-col gap-0.5
             {czyMaAdres ? 'cursor-pointer hover:opacity-75' : ''}"
      onclick={() => czyMaAdres ? console.log('TODO: otwórz WyborAdresu') : null}
    >
      <span class="text-base font-bold text-text-heading leading-tight">
        {naglowekNazwa}
      </span>
      {#if naglowekAdres}
        <span class="text-sm text-text-secondary">{naglowekAdres}</span>
      {/if}
    </div>

    <!-- Prawa strona: numer przesyłki + przycisk Usuń -->
    <div class="flex items-center gap-3 shrink-0 ml-4">
      <span class="text-sm font-medium text-text-secondary">
        Przesyłka {numerPrzesylki}
      </span>
      <button
        type="button"
        onclick={onUsun}
        class="rounded px-2 py-1 text-xs font-medium text-error-text
               hover:bg-error-bg transition-colors"
      >
        Usuń
      </button>
    </div>

  </div>

  <!-- CIAŁO — dwie kolumny główne -->
  <div class="flex min-h-0 flex-1">

    <!-- KOLUMNA LEWA: "Co jedzie" — pełna wysokość, scroll wewnętrzny -->
    <div class="flex w-2/5 min-h-0 flex-col border-r border-border-default">
      <div class="shrink-0 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary border-b border-border-default">
        Co jedzie
      </div>
      <div class="flex-1 overflow-y-auto px-5 py-2">
        <p class="text-sm text-text-secondary">[Lista produktów — TODO]</p>
      </div>
    </div>

    <!-- KOLUMNA PRAWA: Dostawa + Pakowanie (górny wiersz) + Uwagi (dolny wiersz) -->
    <div class="flex w-3/5 min-h-0 flex-col">

      <!-- Górny wiersz: Dostawa i Pakowanie obok siebie -->
      <div class="flex min-h-0 flex-1 border-b border-border-default">

        <!-- Dostawa -->
        <div class="flex w-1/2 flex-col border-r border-border-default px-5 py-3 gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Dostawa
          </p>
          <WyborOpcji
            opcje={OPCJE_TYPU_DOSTAWY}
            wartosc={przesylka.typDostawy}
            onZmiana={(val) => onZmiana({ typDostawy: val, adres: null, kurier: null })}
          />
          <!-- Wybór kuriera — widoczny tylko gdy typ = 'kurier' -->
          {#if przesylka.typDostawy === 'kurier'}
            <div class="flex flex-col gap-1">
              <p class="text-xs font-medium text-text-secondary">Kurier</p>
              <select
                class="rounded border border-input-border bg-input-bg px-2 py-1.5 text-sm text-input-text focus:outline-none focus:border-border-focus"
                value={przesylka.kurier ?? ''}
                onchange={(e) => onZmiana({ kurier: e.target.value || null })}
              >
                <option value="">— wybierz —</option>
                <option value="ups">UPS</option>
                <option value="dhl">DHL</option>
                <option value="dpd">DPD</option>
                <option value="fedex">FedEx</option>
                <option value="inpost">InPost</option>
                <option value="nietypowy">Nietypowy</option>
              </select>
            </div>
          {/if}
        </div>

        <!-- Pakowanie — TODO -->
        <div class="flex w-1/2 flex-col px-5 py-3 gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Pakowanie
          </p>
          <p class="text-sm text-text-secondary">[TODO]</p>
        </div>

      </div>

      <!-- Dolny wiersz: Uwagi — pod Dostawą i Pakowaniem -->
      <div class="shrink-0 px-5 py-3">
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Uwagi
        </p>
        <p class="text-sm text-text-secondary">[Textarea — TODO]</p>
      </div>

    </div>

  </div>

</div>
