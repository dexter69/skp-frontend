<script>
  import { getContext } from "svelte";
  import KartaKlienta from "$lib/komponenty/zamowienie/KartaKlienta.svelte";
  import MetadaneZamowienia from "$lib/komponenty/zamowienie/MetadaneZamowienia.svelte";
  import Platnosci from "$lib/komponenty/zamowienie/Platnosci.svelte";
  import NotatkaZamowienia from "$lib/komponenty/zamowienie/NotatkaZamowienia.svelte";
  import ListaProduktow from "$lib/komponenty/zamowienie/ListaProduktow.svelte";
  import SekcjaPrzesylki from "$lib/komponenty/zamowienie/SekcjaPrzesylki.svelte";
  import DevPanel from "$lib/komponenty/DevPanel.svelte";

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
    <div
      class="flex min-h-0 w-1/2 shrink-0 flex-col gap-4 overflow-y-auto xl:w-6/10"
    >
      <!-- Wiersz 1: karta klienta (3/4 szerokości) + metadane (1/4 szerokości).
           Zmiana klienta resetuje typKlienta do null — handlowiec musi wybrać ponownie. -->
      <div class="flex gap-4">
        <div class="flex-3">
          <KartaKlienta
            klient={dane().klient}
            typKlienta={dane().typKlienta}
            onWybor={(k) => zaktualizuj({ klient: k, typKlienta: null })}
            onZmianaTypu={(v) => zaktualizuj({ typKlienta: v })}
          />
        </div>
        <div class="flex-1 overflow-hidden rounded-lg bg-white shadow-sm">
          <MetadaneZamowienia {dane} {zaktualizuj} />
        </div>
      </div>

      <!-- Wiersz 2: płatności — pełna szerokość -->
      <div class="overflow-hidden rounded-lg bg-white shadow-sm">
        <Platnosci {dane} {zaktualizuj} />
      </div>

      <!-- Wiersz 3: notatka (dane do faktury + uwagi w tabach).
           Textarea z auto-resize — rośnie wraz z treścią, zaczyna od 6 linii. -->
      <div>
        <NotatkaZamowienia
          daneDoFaktury={dane().daneDoFaktury}
          uwagi={dane().uwagi}
          onZmiana={(pola) => zaktualizuj(pola)}
        />
      </div>
    </div>

    <!-- Prawa kolumna: lista produktów zamówienia.
         Własny scroll wewnętrzny — niezależny od lewej kolumny. -->
    <div
      class="flex w-1/2 shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm xl:w-4/10"
    >
      <div class="border-b border-border-default px-4 py-3">
        <h3 class="text-2xl font-semibold text-text-heading">Produkty</h3>
      </div>
      <ListaProduktow
        produkty={dane().produkty}
        onZmiana={(lista) => zaktualizuj({ produkty: lista })}
      />
    </div>
  </div>
{:else if aktywnaSekcja() === "przesylki"}
  <!-- Sekcja 2: Przesyłki
       TODO: zbudować widok przesyłek -->
  <SekcjaPrzesylki />
{/if}

<!-- Tylko podczas developmentu — usunąć przed produkcją -->
<DevPanel {dane} />
