<script>
  import { getContext } from "svelte";
  import KartaKlienta from "$lib/komponenty/zamowienie/KartaKlienta.svelte";
  import MetadaneZamowienia from "$lib/komponenty/zamowienie/MetadaneZamowienia.svelte";
  import Platnosci from "$lib/komponenty/zamowienie/Platnosci.svelte";
  import NotatkaZamowienia from "$lib/komponenty/zamowienie/NotatkaZamowienia.svelte";

  // Pobieramy z contextu zamówienia:
  // — aktywnaSekcja(): która sekcja jest aktualnie wybrana w sidebarze
  // — dane(): aktualny stan zamówienia
  // — zaktualizuj(): funkcja do częściowej aktualizacji stanu
  const { aktywnaSekcja, dane, zaktualizuj } = getContext("zamowienie");
  const z = dane();
</script>

{#if aktywnaSekcja() === "klient"}
  <!-- Sekcja 1: Klient i produkty
       Układ: lewa kolumna (70%) z formularzem + prawa kolumna (30%) z listą produktów.
       Przy małym oknie (<xl): obie kolumny po 50%. -->
  <div class="flex h-full gap-4 p-6">
    <!-- Lewa kolumna: formularz zamówienia -->
    <div class="flex w-1/2 shrink-0 flex-col gap-4 overflow-y-auto xl:w-7/10">
      <!-- Grid 4-kolumnowy dla kart formularza.
           Przy małym oknie (<xl): 1 kolumna, karty układają się pionowo.
           Proporcje kart kontrolowane przez col-span. -->
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <!-- Karta klienta: 3/4 szerokości gridu.
             Klikalny panel — otwiera modal wyboru klienta.
             Pokazuje dane wybranego klienta lub empty state. -->
        <div class="col-span-1 xl:col-span-3">
          <KartaKlienta
            klient={dane().klient}
            onWybor={(k) => zaktualizuj({ klient: k })}
          />
        </div>

        <!-- Metadane zamówienia: 1/4 szerokości gridu.
             Zawiera: data realizacji, ekspresowe (toggle), typ klienta (nowy/stały).
             Typ klienta pojawia się tylko po wyborze klienta. -->
        <div
          class="col-span-1 overflow-hidden rounded-lg bg-white shadow-sm xl:col-span-1"
        >
          <MetadaneZamowienia {dane} {zaktualizuj} />
        </div>

        <!-- Płatności: 1/2 szerokości gridu.
             TODO: komponent Platnosci.svelte -->
        <!-- <div class="col-span-1 overflow-hidden rounded-lg bg-white shadow-sm xl:col-span-2">
          <div class="p-4">
            <p class="text-sm text-text-muted">Tu będą płatności...</p>
          </div>
        </div> -->
        <!-- Płatności: cała szerokość -->
        <div
          class="col-span-1 overflow-hidden rounded-lg bg-white shadow-sm xl:col-span-4"
        >
          <Platnosci {dane} {zaktualizuj} />
        </div>

        <!-- Notatki — dane do faktury i uwagi w tabach, pełna szerokość wiersza -->
        <div class="col-span-full">
          <NotatkaZamowienia
            bind:daneDoFaktury={z.daneDoFaktury}
            bind:uwagi={z.uwagi}
          />
        </div>
      </div>
    </div>

    <!-- Prawa kolumna: lista produktów zamówienia.
         Zajmuje resztę dostępnej wysokości — własny scroll wewnętrzny.
         TODO: komponent ListaProduktow.svelte -->
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
  <!-- Sekcja 2: Przesyłki
       TODO: zbudować widok przesyłek -->
  <div class="p-8">
    <h2 class="text-lg font-semibold text-text-heading">Przesyłki</h2>
    <p class="mt-2 text-sm text-text-secondary">Tu będzie sekcja przesyłek.</p>
  </div>
{/if}
