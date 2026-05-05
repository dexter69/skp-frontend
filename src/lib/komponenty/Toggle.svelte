<script>
  // Kolory jako stałe — zmiana domyślnego wyglądu toggle'a = zmiana tutaj.
  // kolorDomyslny: używany gdy rodzic nie przekaże kolorAktywny.
  // kolorWylaczony: szare tło gdy toggle jest wyłączony.
  // Wartości jako zmienne CSS (var()) lub oklch() — nie jako klasy Tailwinda,
  // bo dynamiczne klasy Tailwinda nie są wykrywane przez skaner przy buildzie.
  const kolorDomyslny = "var(--accent)";
  const kolorWylaczony = "oklch(92.8% 0.006 264)";

  // etykieta — tekst wyświetlany obok toggle'a (opcjonalny)
  // wartosc — stan toggle'a (true/false), $bindable = dwukierunkowy przepływ z rodzicem
  // kolorAktywny — kolor tła gdy włączony, domyślnie kolor akcentu aplikacji.
  //   Przyjmuje dowolną wartość CSS: var(--nazwa), oklch(...), #hex itp.
  //   Przykład użycia: <Toggle kolorAktywny="var(--success-text)" />
  let {
    etykieta,
    wartosc = $bindable(false),
    kolorAktywny = kolorDomyslny,
    onZmiana,
  } = $props();
</script>

<!-- inline-flex — komponent zajmuje tylko tyle miejsca ile potrzebuje,
     nie rozciąga się na całą szerokość rodzica.
     Odstępy między toggle'em a etykietą reguluje rodzic przez gap lub margin. -->
<div class="inline-flex items-center gap-3">
  <!-- Tło toggle'a — kolor ustawiany przez style= (nie klasę Tailwinda)
       bo kolor jest dynamiczny i Tailwind nie wykryłby go przy buildzie.
       has-focus-visible:outline-2 — widoczny outline tylko przy nawigacji klawiaturą. -->
  <div
    class="group relative inline-flex w-11 shrink-0 rounded-full p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 transition-colors duration-200 ease-in-out has-focus-visible:outline-2"
    style="background-color: {wartosc ? kolorAktywny : kolorWylaczony}"
  >
    <!-- Biały "guzik" przesuwający się w prawo gdy toggle włączony.
         translate-x-5 przesuwa o 20px = szerokość toggle'a minus guzik. -->
    <span
      class="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out {wartosc
        ? 'translate-x-5'
        : ''}"
    ></span>

    <!-- Niewidoczny checkbox pokrywający cały toggle.
         Obsługuje kliknięcia i aktualizuje wartosc przez $bindable.
         aria-label zapewnia dostępność dla czytników ekranu.
         Świadomie ignorujemy ostrzeżenie Svelte o autofocus/a11y —
         aplikacja desktopowa dla pracowników biurowych. -->
    <input
      type="checkbox"
      checked={wartosc}
      onchange={(e) => {
        wartosc = e.target.checked;
        onZmiana?.(wartosc);
      }}
      aria-label={etykieta}
      class="absolute inset-0 size-full appearance-none focus:outline-hidden"
    />
  </div>

  <!-- Etykieta — renderowana tylko gdy przekazana.
       Pozwala używać Toggle bez etykiety jeśli rodzic sam ją renderuje. -->
  {#if etykieta}
    <span class="text-xs font-medium text-text-secondary">{etykieta}</span>
  {/if}
</div>
