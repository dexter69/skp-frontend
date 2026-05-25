<!--
  WierszProduktu.svelte
  Jeden wiersz tabeli produktów zamówienia.
  Pola nazwa, ilość i cena są zawsze edytowalne (inline edit).
  Styl spoczynkowy: brak obramowania, przezroczyste tło.
  Styl aktywny (focus): tło input-bg + subtelne obramowanie.
  Cena przechowywana jako number, wyświetlana i edytowana z przecinkiem (polski format).
  Ilość i cena zapisywane przy utracie focusu (onblur) — nie w trakcie wpisywania.
  Komunikuje zmiany i usunięcie przez callbacki — nie zna stanu zamówienia.
-->
<script>
  import { IconTrash } from "@tabler/icons-svelte-runes";

  // produkt — obiekt z polami: id, nazwa, ilosc, cena
  // onZmiana — callback wywoływany przy zmianie dowolnego pola, przekazuje cały zaktualizowany obiekt
  // onUsun — callback wywoływany przy kliknięciu kosza
  let { produkt, onZmiana, onUsun } = $props();

  // Lokalna reprezentacja ceny jako tekst — użytkownik edytuje string z przecinkiem.
  // Przy inicjalizacji formatujemy number → string (np. 0 → '0,00').
  // Przy zapisie (onblur) konwertujemy string → number i wywołujemy onZmiana.
  let cenaStr = $state(formatujCene(produkt.cena));

  // Formatuje number do stringa z przecinkiem i min 2 miejscami po przecinku (max 4).
  // Przykład: 2.69 → '2,69' | 2.6912 → '2,6912' | 0 → '0,00'
  function formatujCene(wartosc) {
    if (wartosc === null || wartosc === undefined || wartosc === "")
      return "0,00";
    const liczba = Number(wartosc);
    if (isNaN(liczba)) return "0,00";
    const miejsca = Math.max(
      2,
      Math.min(4, (liczba.toString().split(".")[1] ?? "").length),
    );
    return liczba.toFixed(miejsca).replace(".", ",");
  }

  // Konwertuje string z przecinkiem na number.
  // Przykład: '2,69' → 2.69 | '2,6912' → 2.6912 | '' → 0
  function parsujCene(str) {
    const liczba = parseFloat(str.replace(",", "."));
    return isNaN(liczba) ? 0 : liczba;
  }

  function handleCenaBlur() {
    const liczba = parsujCene(cenaStr);
    // Normalizujemy wyświetlany string (np. '2,5' → '2,50')
    cenaStr = formatujCene(liczba);
    onZmiana?.({ ...produkt, cena: liczba });
  }
</script>

<tr class="border-b border-border-default last:border-0">
  <!-- Nazwa — zajmuje całą dostępną szerokość, aktualizowana przy każdym znaku (oninput) -->
  <td class="px-3 py-1.5">
    <input
      type="text"
      value={produkt.nazwa}
      onfocus={(e) => e.target.select()}
      oninput={(e) => onZmiana?.({ ...produkt, nazwa: e.target.value })}
      class="w-full rounded bg-transparent px-2 text-sm text-text-primary
             outline-none focus:bg-input-bg focus:outline-1
             focus:-outline-offset-1 focus:outline-input-border transition-all"
    />
  </td>

  <!-- Ilość — liczba całkowita, walidacja i zapis przy utracie focusu.
       Spacje jako separatory tysięcy są akceptowane i usuwane przy parsowaniu.
       Nieprawidłowa wartość (np. tekst) jest korygowana do 1. -->
  <td class="w-28 px-3 py-1.5">
    <input
      type="text"
      value={produkt.ilosc}
      onfocus={(e) => e.target.select()}
      onblur={(e) => {
        const val = parseInt(e.target.value.replace(/\s/g, "")) || 1;
        e.target.value = val;
        onZmiana?.({ ...produkt, ilosc: val });
      }}
      onkeydown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.target.closest("tr").querySelectorAll("input")[2].focus();
        }
      }}
      class="w-full rounded bg-transparent px-2 text-right text-sm text-text-primary
             outline-none focus:bg-input-bg focus:outline-1
             focus:-outline-offset-1 focus:outline-input-border transition-all"
    />
  </td>

  <!-- Cena — string z przecinkiem, konwersja do number przy utracie focusu.
       Nieprawidłowa wartość korygowana do 0,00. -->
  <td class="w-28 px-3 py-1.5">
    <input
      type="text"
      bind:value={cenaStr}
      onfocus={(e) => e.target.select()}
      onblur={handleCenaBlur}
      onkeydown={(e) => {
        if ((e.key === "Tab" && !e.shiftKey) || e.key === "Enter") {
          const nastepnyWiersz = e.target.closest("tr").nextElementSibling;
          const cel = nastepnyWiersz
            ? nastepnyWiersz.querySelectorAll("input")[1]
            : e.target
                .closest("tbody")
                .querySelectorAll("tr")[0]
                .querySelectorAll("input")[1];
          if (cel) {
            e.preventDefault();
            cel.focus();
          }
        }
      }}
      class="w-full rounded bg-transparent px-2 text-right text-sm text-text-primary
             outline-none focus:bg-input-bg focus:outline-1
             focus:-outline-offset-1 focus:outline-input-border transition-all"
    />
  </td>

  <!-- Kosz — usuwa wiersz z listy, podświetla się na czerwono przy hover -->
  <td class="w-8 px-2 py-1.5">
    <button
      type="button"
      tabindex="-1"
      onclick={() => onUsun?.()}
      class="text-text-muted hover:text-red-500 transition-colors"
    >
      <IconTrash size={16} stroke={1.5} />
    </button>
  </td>
</tr>
