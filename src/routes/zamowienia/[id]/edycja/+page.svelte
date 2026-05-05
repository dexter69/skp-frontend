<script>
  import { getContext } from "svelte";
  import KartaKlienta from "$lib/komponenty/zamowienie/KartaKlienta.svelte";
  import MetadaneZamowienia from "$lib/komponenty/zamowienie/MetadaneZamowienia.svelte";
  import Platnosci from "$lib/komponenty/zamowienie/Platnosci.svelte";
  import NotatkaZamowienia from "$lib/komponenty/zamowienie/NotatkaZamowienia.svelte";

  // Pobieramy z kontekstu zamówienia:
  // — aktywnaSekcja(): która sekcja jest aktualnie wybrana w sidebarze
  // — dane(): aktualny reaktywny stan zamówienia (zawsze świeży)
  // — zaktualizuj(): częściowa aktualizacja stanu (tylko podane pola)
  const { aktywnaSekcja, dane, zaktualizuj } = getContext("zamowienie");
</script>

{#if aktywnaSekcja() === "klient"}
  <!-- Sekcja 1: Klient i produkty
       Układ: lewa kolumna (70%) z formularzem + prawa kolumna (30%) z listą produktów.
       Przy węższym oknie (<xl): obie kolumny po 50%.
       min-h-0 — pozwala flex dzieciom kurczyć się poniżej naturalnej wysokości,
       co umożliwia scroll lewej kolumny przy małym oknie. -->
  <div class="flex h-full min-h-0 gap-4 p-6">

    <!-- Lewa kolumna: formularz zamówienia.
         min-h-0 — kluczowe dla poprawnego działania overflow-y-auto w flex.
         Bez tego przeglądarka nie pozwoli kolumnie skurczyć się i scroll nie zadziała. -->
    <div class="flex min-h-0 w-1/2 shrink-0 flex-col gap-4 overflow-y-auto xl:w-7/10">

      <!-- Wiersz 1: karta klienta (3/4 szerokości) + metadane (1/4 szerokości) -->
      <div class="flex gap-4">
        <div class="flex-[3]">
          <KartaKlienta
            klient={dane().klient}
            onWybor={(k) => zaktualizuj({ klient: k })}
          />
        </div>
        <div class="flex-[1] overflow-hidden rounded-lg bg-white shadow-sm">
          <MetadaneZamowienia {dane} {zaktualizuj} />
        </div>
      </div>

      <!-- Wiersz 2: płatności — pełna szerokość -->
      <div class="overflow-hidden rounded-lg bg-white shadow-sm">
        <Platnosci {dane} {zaktualizuj} />
      </div>

      <!-- Wiersz 3: notatka (dane do faktury + uwagi w tabach).
           Textarea z auto-resize — rośnie wraz z treścią, zaczyna od 4 linii. -->
      <div>
        <NotatkaZamowienia
          daneDoFaktury={dane().daneDoFaktury}
          uwagi={dane().uwagi}
          onZmiana={(pola) => zaktualizuj(pola)}
        />
      </div>

    </div>

    <!-- Prawa kolumna: lista produktów zamówienia.
         Własny scroll wewnętrzny — niezależny od lewej kolumny.
         TODO: zastąpić placeholer komponentem ListaProduktow.svelte -->
    <div class="flex w-1/2 shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm xl:w-3/10">
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