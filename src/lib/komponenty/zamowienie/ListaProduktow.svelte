<!--
  ListaProduktow.svelte
  Lista produktów zamówienia z możliwością dodawania i usuwania.
  Produkty przechowywane w stanie zamówienia jako tablica obiektów { id, nazwa, ilosc, cena }.
  Edycja inline przez WierszProduktu.svelte.
-->
<script>
  import Przycisk from '$lib/komponenty/Przycisk.svelte';
  import WierszProduktu from "$lib/komponenty/zamowienie/WierszProduktu.svelte";

  // produkty — aktualna lista produktów z stanu zamówienia
  // onZmiana — callback wywoływany przy każdej zmianie listy
  let { produkty = [], onZmiana } = $props();

  // Lokalna kopia listy — pracujemy na kopii, nie bezpośrednio na stanie zamówienia
  let lista = $state([...produkty]);

  // Wartość pola dodawania nowego produktu
  let nowaNazwa = $state("");

  // Licznik tymczasowych id dla nowo dodanych produktów.
  // Ujemne wartości nie kolidują z id z bazy danych (zawsze dodatnie).
  // Tymczasowe id zastępowane przez API po zapisie zamówienia.
  // Startujemy poniżej najniższego istniejącego id — unikamy kolizji z mockiem
  let licznikTymczasowy = $state(
    produkty.length > 0
      ? Math.min(
          ...produkty.map(function (p) {
            return p.id;
          }),
        ) - 1
      : -1,
  );

  function dodajProdukt() {
    const nazwa = nowaNazwa.trim();
    if (!nazwa) return;

    lista = [
      ...lista,
      {
        id: licznikTymczasowy--,
        nazwa,
        ilosc: 1,
        cena: 0,
      },
    ];

    onZmiana(lista);
    nowaNazwa = "";
  }

  function handleKeydown(e) {
    if (e.key === "Enter") dodajProdukt();
  }
</script>

<div class="flex h-full flex-col">
  <!-- Pole dodawania nowego produktu.
       Enter lub przycisk "Dodaj" — po dodaniu pole się czyści i zachowuje focus. -->
  <div class="flex gap-2 border-b border-border-default px-3 py-2">
    <input
      type="text"
      bind:value={nowaNazwa}
      onkeydown={handleKeydown}
      placeholder="Nazwa produktu..."
      class="flex-1 rounded-md bg-input-bg px-3 py-1.5 text-sm text-input-text outline-1 -outline-offset-1 outline-input-border focus:outline-2 focus:-outline-offset-2 focus:outline-border-focus"
    />    
    <Przycisk onclick={dodajProdukt}>Dodaj</Przycisk>
  </div>

  <!-- Tabela produktów.
       Pusta lista pokazuje komunikat zamiast pustej tabeli. -->
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
            <th class="w-28 px-3 py-2 text-right font-medium">Ilość</th>
            <th class="w-28 px-3 py-2 text-right font-medium">Cena</th>
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
