<script>
  import Toggle from "$lib/komponenty/Toggle.svelte";
  import WyborOpcji from "$lib/komponenty/WyborOpcji.svelte";

  // dane() — aktualny stan zamówienia z contextu
  // zaktualizuj() — częściowa aktualizacja stanu zamówienia
  let { dane, zaktualizuj } = $props();

  // Formy płatności jako mock — docelowo zastąpione danymi z API.
  // Backend dostarcza listę, frontend tylko wyświetla — nie hardcodujemy nazw.
  // Przedpłata: 3 opcje (bez pobrania), płatność po: 4 opcje.
  const formyPrzedplaty = [
    { id: "przelew", label: "Przelew" },
    { id: "gotowka", label: "Gotówka" },
    { id: "inna", label: "Inna" },
  ];

  const formyPlatnosciPo = [
    { id: "przelew", label: "Przelew" },
    { id: "gotowka", label: "Gotówka" },
    { id: "pobranie", label: "Pobranie" },
    { id: "inna", label: "Inna" },
  ];

  // Lokalna kopia stanu przedpłaty — potrzebna dla Toggle ($bindable).
  // Inicjalizacja jednorazowa przy załadowaniu — dane() capture'uje wartość początkową.
  // To zamierzone: maPrzedplate jest potem zarządzane lokalnie przez Toggle.
  // Ostrzeżenie IDE można zignorować.
  let maPrzedplate = $state(dane().platnosci?.maPrzedplate ?? false);

  // Sekcja "płatność po" jest widoczna gdy:
  // — brak przedpłaty → zawsze pokazuj
  // — przedpłata < 100% → pokazuj (klient musi zapłacić resztę po)
  // — przedpłata = 100% → ukryj (nie ma czego płacić po)
  const pokazPlatnoscPo = $derived(
    !maPrzedplate || (dane().platnosci?.procent ?? 0) < 100,
  );
</script>

<!-- Układ dwukolumnowy: lewa = przedpłata, prawa = płatność po.
     min-h-42 = wysokość maksymalnej treści (toggle + forma przedpłaty + płatność po + forma).
     Stała wysokość zapobiega przesuwaniu innych elementów gdy treść się zmienia.
     Zaktualizuj min-h-42 jeśli dodasz nowe pola. -->
<div class="flex gap-6 p-4 min-h-42">
  <!-- Lewa kolumna: przedpłata.
       gap-9 + justify między wierszami wyrównuje WyborOpcji z prawą kolumną. -->
  <div class="flex flex-col gap-9 flex-1">
    <!-- Wiersz 1: toggle przedpłaty + input procentu w jednej linii.
         h-9 = stała wysokość wiersza — zapobiega przesuwaniu przy pojawieniu się inputa. -->
    <div class="flex items-center gap-3 h-9">
      <Toggle
        etykieta="Przedpłata"
        bind:wartosc={maPrzedplate}
        onZmiana={(v) => zaktualizuj({ platnosci: { maPrzedplate: v } })}
      />

      {#if maPrzedplate}
        <div class="flex items-center gap-1">
          <input
            type="number"
            min="1"
            max="100"
            value={dane().platnosci?.procent ?? ""}
            oninput={(e) => {
              let wartosc = Number(e.target.value);
              // Walidacja: 1-100%. min/max w HTML blokują spinner ale nie klawiaturę.
              // Walidacja client-side tylko dla UX — backend też powinien sprawdzać.
              if (wartosc > 100) wartosc = 100;
              if (wartosc < 1) wartosc = 1;
              e.target.value = wartosc;
              zaktualizuj({ platnosci: { procent: wartosc } });
            }}
            class="w-16 rounded-md bg-input-bg px-2 py-1.5 text-sm text-input-text outline-1 -outline-offset-1 outline-input-border focus:outline-2 focus:-outline-offset-2 focus:outline-border-focus"
          />
          <span class="text-sm text-text-secondary">%</span>
        </div>
      {/if}
    </div>

    <!-- Wiersz 2: forma przedpłaty — widoczna tylko gdy przedpłata włączona -->
    {#if maPrzedplate}
      <WyborOpcji
        etykieta="Forma przedpłaty"
        opcje={formyPrzedplaty}
        wartosc={dane().platnosci?.formaPrzedplaty ?? null}
        onZmiana={(v) => zaktualizuj({ platnosci: { formaPrzedplaty: v } })}
      />
    {/if}
  </div>

  <!-- Separator pionowy — stały element układu dwukolumnowego -->
  <div class="w-px bg-border-default self-stretch"></div>

  <!-- Prawa kolumna: płatność po otrzymaniu.
       Ukryta gdy przedpłata = 100% (pokazPlatnoscPo = false). -->

  <div class="flex flex-col gap-3 flex-1">
    {#if pokazPlatnoscPo}
      <p class="text-xs font-medium text-text-secondary">
        Płatność po otrzymaniu
      </p>

      <!-- Termin płatności w dniach -->
      <div class="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={dane().platnosci?.terminDni ?? ""}
          oninput={(e) => {
            let wartosc = Number(e.target.value);
            // Minimum 1 dzień — wartości <= 0 nie mają sensu biznesowego.
            // Brak maksimum — termin płatności może być dowolnie długi.
            // Walidacja client-side tylko dla UX — backend też powinien sprawdzać.
            if (wartosc < 1) wartosc = 1;
            e.target.value = wartosc;
            zaktualizuj({ platnosci: { terminDni: wartosc } });
          }}
          class="w-16 rounded-md bg-input-bg px-2 py-1.5 text-sm text-input-text outline-1 -outline-offset-1 outline-input-border focus:outline-2 focus:-outline-offset-2 focus:outline-border-focus"
        />
        <span class="text-sm text-text-secondary">dni</span>
      </div>

      <!-- Forma płatności po otrzymaniu -->
      <WyborOpcji
        etykieta="Forma płatności"
        opcje={formyPlatnosciPo}
        wartosc={dane().platnosci?.formaPo ?? null}
        onZmiana={(v) => zaktualizuj({ platnosci: { formaPo: v } })}
      />
    {/if}
  </div>
</div>
