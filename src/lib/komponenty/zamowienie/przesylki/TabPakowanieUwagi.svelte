<script>
  // TabPakowanieUwagi — zawartość taba "Pakowanie i uwagi" w panelu szczegółów przesyłki.
  // Dwie kolumny: lewa (pakowanie — TODO) + prawa (uwagi textarea).
  // Czysty komponent — dane przez propsy, zmiany przez callbacki.

  let {
    przesylka,    // obiekt przesyłki { uwagi }
    styleKolumn,  // CSS variables dla proporcji kolumn (--col-lewa, --col-prawa)
    onZmiana,     // callback(zmiany) — aktualizuje dane przesyłki
  } = $props();
</script>

<div class="flex h-full" style={styleKolumn}>

  <!-- Lewa kolumna: Pakowanie -->
  <div
    class="flex flex-col border-r border-gray-200 px-4 py-3 gap-3"
    style="width: var(--col-lewa)"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
      Pakowanie
    </p>
    <!-- TODO: pakowanie
         Dwie opcje do wyboru:
         1. Standardowe — algorytm automatycznie rozkłada do paczek (5k/3k/2k/1k szt.)
            z możliwością ręcznej korekty przez użytkownika
         2. Palety — pole na uwagi/notatkę
         Rozmiary paczek i algorytm docelowo konfigurowalne z API.
         Szczegóły do omówienia przed implementacją. -->
    <p class="text-sm text-text-muted italic">
      Pakowanie — do zaimplementowania
    </p>
  </div>

  <!-- Prawa kolumna: Uwagi -->
  <div
    class="flex flex-col px-4 py-3 gap-2 min-h-0 flex-1"
    style="width: var(--col-prawa)"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary shrink-0">
      Uwagi
    </p>
    <!-- textarea wypełnia dostępną przestrzeń i scrolluje gdy tekst jest długi.
         Bez auto-resize — panel ma stałą wysokość więc textarea ma stały rozmiar.
         resize-none — ręczne przeciąganie wyłączone. -->
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
