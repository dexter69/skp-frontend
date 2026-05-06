<script>
  // Uniwersalny komponent wyboru jednej opcji z listy — przyciski radio.
  // Używany wszędzie gdzie użytkownik wybiera jedną z kilku opcji (np. forma płatności).
  // Lista opcji pochodzi z zewnątrz (mock lub API) — komponent nie zna ich znaczenia.
  // Brak domyślnego wyboru — wartosc = null oznacza "nic nie wybrano".
  let { etykieta, opcje = [], wartosc = null, onZmiana } = $props();
</script>

<div class="flex flex-col gap-1">
  {#if etykieta}
    <p class="block text-xs font-medium text-text-secondary">
      {etykieta}
    </p>
  {/if}

  <div class="flex flex-wrap gap-2">
    {#each opcje as opcja}
      <!-- bg-white i bg-accent w osobnych gałęziach warunkowych —
           bg-white jako klasa bazowa byłoby nadpisywane przez bg-accent
           ze względu na kolejność klas w arkuszu CSS Tailwinda. -->
      <label
        class="group relative flex items-center justify-center rounded-md border px-3 py-2 cursor-pointer transition-colors
          {wartosc === opcja.id
            ? 'border-accent bg-accent'
            : 'border-border-default bg-white hover:border-border-strong'}"
      >
        <!-- Niewidoczny radio button — obsługuje logikę wyboru.
             Świadomie pomijamy aria — aplikacja desktopowa dla pracowników biurowych. -->
        <input
          type="radio"
          value={opcja.id}
          checked={wartosc === opcja.id}
          onchange={() => onZmiana?.(opcja.id)}
          class="absolute inset-0 appearance-none focus:outline-none cursor-pointer"
        />
        <span class="text-sm font-medium {wartosc === opcja.id ? 'text-white' : 'text-text-secondary'}">
          {opcja.label}
        </span>
      </label>
    {/each}
  </div>
</div>