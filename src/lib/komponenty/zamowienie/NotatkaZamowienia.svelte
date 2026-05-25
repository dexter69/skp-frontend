<!--
  NotatkaZamowienia.svelte
  Karta z tabami przełączającymi między dwoma polami tekstowymi:
  "Dane do faktury" i "Uwagi do zamówienia".
  Textarea rośnie automatycznie wraz z treścią (auto-resize).
  Aktywny tab wyróżniony kolorem akcentu z motywu (var(--accent)).
-->
<script>
  // Aktywny tab — klucz odpowiadający polu w stanie zamówienia.
  // Pusty string '' = "Dane do faktury" (pierwszy tab domyślny).
  let aktywnyTab = $state("");

  const taby = [
    { klucz: "",      etykieta: "Dane do faktury" },
    { klucz: "uwagi", etykieta: "Uwagi" },
  ];

  // Props przekazywane z rodzica:
  // — daneDoFaktury, uwagi: aktualne wartości pól
  // — onZmiana: callback wywoływany przy każdej zmianie, przekazuje zmienione pole
  let { daneDoFaktury = "", uwagi = "", onZmiana } = $props();
  
</script>

<!-- Karta z białym tłem i subtelnym cieniem — spójna z pozostałymi kartami formularza. -->
<div class="flex flex-col h-full rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5">

  <!-- Nav z tabami — styl z Tailwind Plus, linki zastąpione przyciskami.
       Aktywny tab: podkreślenie + kolor akcentu przez inline style
       (kolor jest dynamiczny z CSS var, Tailwind nie wygeneruje go przy buildzie). -->
  <nav class="flex border-b border-gray-200 px-4">
    <ul class="flex min-w-full flex-none gap-x-6 text-sm/6 font-semibold text-gray-500">
      {#each taby as tab}
        <li>
          <button
            onclick={() => (aktywnyTab = tab.klucz)}
            class="py-4 transition-colors duration-150 {aktywnyTab === tab.klucz
              ? 'border-b-2 text-accent'
              : 'hover:text-gray-700'}"
            style={aktywnyTab === tab.klucz ? "border-color: var(--accent)" : ""}
          >
            {tab.etykieta}
          </button>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Pole tekstowe aktywnego taba.
       rows="6" — minimalna wysokość startowa (6 linii).
       resize-none — wyłączone ręczne przeciąganie przez użytkownika,
       bo wysokość zarządzana jest przez auto-resize. -->
  <div class="flex-1 min-h-0 p-3">
    {#if aktywnyTab === ""}
      <textarea
        value={daneDoFaktury}
        oninput={(e) => { onZmiana({ daneDoFaktury: e.target.value }); }}
        placeholder="Dane do faktury..."
        class="w-full h-full resize-none overflow-y-auto rounded-lg bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      ></textarea>
    {:else}
      <textarea
        value={uwagi}
        oninput={(e) => { onZmiana({ uwagi: e.target.value }); }}
        placeholder="Uwagi do zamówienia..."        
        class="w-full h-full resize-none overflow-y-auto rounded-lg bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      ></textarea>
    {/if}
  </div>

</div>