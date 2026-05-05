<!-- 
  NotatkaZamowienia.svelte
  Karta z tabami: "Dane do faktury" i "Uwagi".
  Textarea rozciąga się na całą dostępną wysokość karty.
  Aktywny tab wyróżniony kolorem akcentu (var(--accent)).
-->
<script>
  // Stan aktywnego taba — nazwa klucza pola w stanie zamówienia
  let aktywnyTab = $state("");

  const taby = [
    { klucz: "", etykieta: "Dane do faktury" },
    { klucz: "uwagi", etykieta: "Uwagi" },
  ];

  // Props — wartości textarea przekazywane z rodzica przez callback:
  let { daneDoFaktury = "", uwagi = "", onZmiana } = $props();
</script>

<!-- 
  Karta zajmuje pełną szerokość rodzica i rozciąga się w pionie (h-full).
  flex-col pozwala textarei wypełnić pozostałą przestrzeń po tabachach.
-->
<div
  class="flex h-full flex-col rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5"
>
  <!-- Nav z tabami — styl z TP, linki zamienione na przyciski -->
  <nav class="flex border-b border-gray-200 px-4">
    <ul
      class="flex min-w-full flex-none gap-x-6 text-sm/6 font-semibold text-gray-500"
    >
      {#each taby as tab}
        <li>
          <button
            onclick={() => (aktywnyTab = tab.klucz)}
            class="py-4 transition-colors duration-150 {aktywnyTab === tab.klucz
              ? 'border-b-2 text-accent'
              : 'hover:text-gray-700'}"
            style={aktywnyTab === tab.klucz
              ? "border-color: var(--accent)"
              : ""}
          >
            {tab.etykieta}
          </button>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Textarea — flex-1 wypełnia resztę karty -->
  <div class="flex flex-1 flex-col p-3">
    {#if aktywnyTab === ""}
      <textarea
        value={daneDoFaktury}
        oninput={(e) => onZmiana({ daneDoFaktury: e.target.value })}
        placeholder="Dane do faktury..."
        class="flex-1 w-full resize-none rounded-lg bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      ></textarea>      
    {:else}
      <textarea
        value={uwagi}
        oninput={(e) => onZmiana({ uwagi: e.target.value })}
        placeholder="Uwagi do zamówienia..."
        class="flex-1 w-full resize-none rounded-lg bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      ></textarea>      
    {/if}
  </div>
</div>
