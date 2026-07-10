<script>
  import { getContext } from "svelte";
  import KartaKlienta from "$lib/komponenty/zamowienie/KartaKlienta.svelte";
  import MetadaneZamowienia from "$lib/komponenty/zamowienie/MetadaneZamowienia.svelte";
  import Platnosci from "$lib/komponenty/zamowienie/Platnosci.svelte";
  import NotatkaZamowienia from "$lib/komponenty/zamowienie/NotatkaZamowienia.svelte";
  import ListaProduktow from "$lib/komponenty/zamowienie/ListaProduktow.svelte";
  import SekcjaPrzesylki from "$lib/komponenty/zamowienie/przesylki/SekcjaPrzesylki.svelte";
  import DevPanel from "$lib/komponenty/DevPanel.svelte";

  // Pobieramy z kontekstu zamówienia:
  // — aktywnaSekcja(): która sekcja jest aktualnie wybrana w sidebarze
  // — dane(): aktualny reaktywny stan zamówienia (zawsze świeży)
  // — zaktualizuj(): częściowa aktualizacja stanu (tylko podane pola)
  const { aktywnaSekcja, dane, zaktualizuj } = getContext("zamowienie");

  // Obsługuje wybór klienta z modala WyborKlienta.
  // Wyciągnięta z szablonu do nazwanej funkcji — logika biznesowa
  // nie powinna siedzieć inline w atrybutach komponentu.
  function handleWyborKlienta(klient) {
    // Szukamy domyślnego adresu wysyłki (isDefault) — fallback na pierwszy adres.
    // adresy mogą być null gdy API jeszcze ich nie zwraca (np. z wyszukiwarki).
    const domyslnyAdres = klient.adresy
      ? klient.adresy.find((a) => a.isDefault) || klient.adresy[0]
      : null;

    // Aktualizujemy adresy w istniejących przesyłkach kurierskich.
    // Przesyłki innego typu (magazyn, odbiór) nie mają adresu.
    const przesylkiZAdresem = dane().przesylki.map((p) =>
      Object.assign({}, p, {
        adres: p.typDostawy === "kurier" ? domyslnyAdres : null,
      })
    );

    zaktualizuj({
      klient: klient,
      typKlienta: null,
      przesylki: przesylkiZAdresem,
    });
  }

  // Obsługuje zmianę listy produktów.
  // Usuwa z przesyłek pozycje których produkty zostały usunięte z zamówienia.
  function handleZmianaProduktow(lista) {
    const aktywneId = new Set(lista.map((p) => p.id));
    const przesylkiOdswiezione = dane().przesylki.map((prz) =>
      Object.assign({}, prz, {
        pozycje: prz.pozycje.filter((poz) => aktywneId.has(poz.produkt_id)),
      })
    );
    zaktualizuj({ produkty: lista, przesylki: przesylkiOdswiezione });
  }
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
    <div class="flex min-h-0 w-1/2 shrink-0 flex-col gap-4 overflow-y-auto xl:w-6/10">

      <!-- Wiersz 1: karta klienta (3/4 szerokości) + metadane (1/4 szerokości). -->
      <div class="flex gap-4">
        <div class="flex-3">
          <KartaKlienta
            klient={dane().klient}
            typKlienta={dane().typKlienta}
            onWybor={handleWyborKlienta}
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
      <div class="flex-1 min-h-0">
        <NotatkaZamowienia
          daneDoFaktury={dane().daneDoFaktury}
          uwagi={dane().uwagi}
          onZmiana={(pola) => zaktualizuj(pola)}
        />
      </div>
    </div>

    <!-- Prawa kolumna: lista produktów zamówienia.
         Własny scroll wewnętrzny — niezależny od lewej kolumny. -->
    <div class="flex min-h-0 w-1/2 shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm xl:w-4/10">
      <div class="px-4 py-3">
        <h3 class="text-xl font-semibold text-text-heading">Produkty</h3>
      </div>
      <div class="flex-1 min-h-0 overflow-hidden">
        <ListaProduktow
          produkty={dane().produkty}
          onZmiana={handleZmianaProduktow}
        />
      </div>
    </div>
  </div>

{:else if aktywnaSekcja() === "przesylki"}
  <SekcjaPrzesylki />
{/if}

<!-- Tylko podczas developmentu — usunąć przed produkcją -->
<DevPanel {dane} />