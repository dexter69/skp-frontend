<script>
  import { getContext } from "svelte";
  import KartaKlienta from "$lib/komponenty/zamowienie/KartaKlienta.svelte";
  import MetadaneZamowienia from "$lib/komponenty/zamowienie/MetadaneZamowienia.svelte";

  const { aktywnaSekcja, dane, zaktualizuj } = getContext("zamowienie");
</script>

{#if aktywnaSekcja() === "klient"}
  <div class="flex h-full gap-4 p-6">
    <div class="flex w-1/2 shrink-0 flex-col gap-4 overflow-y-auto xl:w-7/10">
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <!-- Karta klienta: 3/4 szerokości -->
        <div class="col-span-1 xl:col-span-3">
          <KartaKlienta
            klient={dane().klient}
            onWybor={(k) => zaktualizuj({ klient: k })}
          />
        </div>

        <!-- Metadane: 1/4 szerokości -->
        <div
          class="col-span-1 overflow-hidden rounded-lg bg-white shadow-sm xl:col-span-1"
        >
          <MetadaneZamowienia {dane} {zaktualizuj} />
        </div>

        <!-- Płatności: 1/2 szerokości -->
        <div
          class="col-span-1 overflow-hidden rounded-lg bg-white shadow-sm xl:col-span-2"
        >
          <div class="p-4">
            <p class="text-sm text-text-muted">Tu będą płatności...</p>
          </div>
        </div>

        <!-- Dane do faktury: 1/2 szerokości -->
        <div
          class="col-span-1 overflow-hidden rounded-lg bg-white shadow-sm xl:col-span-2"
        >
          <div class="p-4">
            <p class="text-sm text-text-muted">Tu będą dane do faktury...</p>
          </div>
        </div>

        <!-- Uwagi: cała szerokość -->
        <div
          class="col-span-1 overflow-hidden rounded-lg bg-white shadow-sm xl:col-span-4"
        >
          <div class="p-4">
            <p class="text-sm text-text-muted">Tu będą uwagi...</p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex w-1/2 shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm xl:w-3/10"
    >
      <div class="border-b border-border-default px-4 py-3">
        <h3 class="text-sm font-semibold text-text-heading">Produkty</h3>
      </div>
      <div class="flex-1 overflow-y-auto px-4 py-3">
        <p class="text-sm text-text-muted">Tu będzie lista produktów...</p>
      </div>
    </div>
  </div>
{:else if aktywnaSekcja() === "przesylki"}
  <div class="p-8">
    <h2 class="text-lg font-semibold text-text-heading">Przesyłki</h2>
    <p class="mt-2 text-sm text-text-secondary">Tu będzie sekcja przesyłek.</p>
  </div>
{/if}
