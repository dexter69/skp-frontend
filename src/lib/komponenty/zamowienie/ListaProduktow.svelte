<!--
  ListaProduktow.svelte
  Lista produktów zamówienia z możliwością dodawania i usuwania.
  Produkty przechowywane w stanie zamówienia jako tablica obiektów.
  Krok 1: szkielet z tabelą i polem dodawania — edycja inline w kroku 2.
-->
<script>
  import WierszProduktu from "$lib/komponenty/zamowienie/WierszProduktu.svelte";

  // produkty — aktualna lista produktów z stanu zamówienia
  // onZmiana — callback wywoływany przy każdej zmianie listy
  let { produkty = [], onZmiana } = $props();

  // Lokalna kopia listy — pracujemy na kopii, nie bezpośrednio na stanie
  let lista = $state([...produkty]);

  // Wartość pola dodawania nowego produktu
  let nowaNazwa = $state("");

  // Generuje tymczasowe id dla nowo dodanych produktów (ujemne, żeby nie kolidować z id z bazy)
  let licznikTymczasowy = $state(-1);

  function dodajProdukt() {
    const nazwa = nowaNazwa.trim();
    if (!nazwa) return;

    lista = [
      ...lista,
      {
        id: licznikTymczasowy--, // tymczasowe ujemne id — zastąpione przez API po zapisie
        nazwa,
        ilosc: 1,
        cena: 0,
      },
    ];

    onZmiana(lista);
    nowaNazwa = "";
  }

  function usunProdukt(id) {
    lista = lista.filter((p) => p.id !== id);
    onZmiana(lista);
  }

  function handleKeydown(e) {
    if (e.key === "Enter") dodajProdukt();
  }
</script>

<div class="flex h-full flex-col">
  <!-- Pole dodawania nowego produktu -->
  <div class="flex gap-2 border-b border-border-default px-3 py-2">
    <input
      type="text"
      bind:value={nowaNazwa}
      onkeydown={handleKeydown}
      placeholder="Nazwa produktu..."
      class="flex-1 rounded-md bg-input-bg px-3 py-1.5 text-sm text-input-text outline-1 -outline-offset-1 outline-input-border focus:outline-2 focus:-outline-offset-2 focus:outline-border-focus"
    />
    <button
      type="button"
      onclick={dodajProdukt}
      class="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-text-on-dark hover:bg-accent-hover transition-colors"
    >
      Dodaj
    </button>
  </div>

  <!-- Tabela produktów -->
  <div class="flex-1 overflow-y-auto">
    {#if lista.length === 0}
      <p class="px-4 py-3 text-sm text-text-muted italic">Brak produktów...</p>
    {:else}
      <table class="w-full text-sm">
        <thead>
          <tr
            class="border-b border-border-default text-xs text-text-secondary"
          >
            <th class="px-3 py-2 text-left font-medium">Nazwa</th>
            <th class="w-16 px-3 py-2 text-right font-medium">Ilość</th>
            <th class="w-24 px-3 py-2 text-right font-medium">Cena</th>
            <th class="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {#each lista as produkt (produkt.id)}
            <WierszProduktu
              {produkt}
              onZmiana={(zaktualizowany) => {
                lista = lista.map((p) =>
                  p.id === zaktualizowany.id ? zaktualizowany : p,
                );
                onZmiana(lista);
              }}
              onUsun={() => {
                lista = lista.filter((p) => p.id !== produkt.id);
                onZmiana(lista);
              }}
            />
          {/each}
        </tbody>        
      </table>
    {/if}
  </div>
</div>
