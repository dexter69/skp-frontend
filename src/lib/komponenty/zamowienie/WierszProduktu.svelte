<!--
  WierszProduktu.svelte
  Jeden wiersz tabeli produktów zamówienia.
  Pola nazwa, ilość i cena są zawsze edytowalne (inline edit).
  Cena przechowywana jako number, wyświetlana i edytowana z przecinkiem (polski format).
  Komunikuje zmiany i usunięcie przez callbacki — nie zna stanu zamówienia.
-->
<script>
  import { IconTrash } from "@tabler/icons-svelte-runes";

  // produkt — obiekt z polami: id, nazwa, ilosc, cena
  // onZmiana — callback wywoływany przy zmianie dowolnego pola
  // onUsun — callback wywoływany przy kliknięciu kosza
  let { produkt, onZmiana, onUsun } = $props();

  // Lokalna reprezentacja ceny jako tekst — użytkownik edytuje string z przecinkiem.
  // Przy inicjalizacji formatujemy number → string (np. 0 → '0,00').
  // Przy zapisie (onblur) konwertujemy string → number i wywołujemy onZmiana.
  let cenaStr = $state(formatujCene(produkt.cena));

  // Formatuje number do stringa z przecinkiem i 2 miejscami po przecinku.
  // Jeśli wartość ma więcej miejsc (max 4) — zachowuje je.
  // Przykład: 2.69 → '2,69' | 2.6912 → '2,6912' | 0 → '0,00'
  function formatujCene(wartosc) {
    if (wartosc === null || wartosc === undefined || wartosc === "")
      return "0,00";
    const liczba = Number(wartosc);
    if (isNaN(liczba)) return "0,00";
    // Ustal ile miejsc po przecinku — min 2, max 4
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
    // Normalizujemy wyświetlany string przy utracie focusu
    const liczba = parsujCene(cenaStr);
    cenaStr = formatujCene(liczba);
    onZmiana?.({ ...produkt, cena: liczba });
  }
</script>

<tr class="border-b border-border-default last:border-0 group">
  <!-- Nazwa — flex-1, edytowalna inline -->
  <td class="px-3 py-1.5">
    <input
      type="text"
      value={produkt.nazwa}
      oninput={(e) => onZmiana?.({ ...produkt, nazwa: e.target.value })}
      class="w-full rounded bg-transparent text-sm text-text-primary
             outline-none focus:bg-input-bg px-2 focus:outline-1
             focus:-outline-offset-1 focus:outline-input-border transition-all"
    />
  </td>

  <!-- Ilość — wąskie pole, liczba całkowita -->  
  <td class="w-28 px-3 py-1.5">
    <input
      type="text"
      value={produkt.ilosc}
      onblur={(e) => {
        const val = parseInt(e.target.value.replace(/\s/g, "")) || 1;
        e.target.value = val;
        onZmiana?.({ ...produkt, ilosc: val });
      }}
      class="w-full rounded bg-transparent text-right text-sm text-text-primary
           px-2 outline-none focus:bg-input-bg focus:outline-1
           focus:-outline-offset-1 focus:outline-input-border transition-all"
    />
  </td>

  <!-- Cena — string z przecinkiem, konwersja przy blur -->
  <td class="w-28 px-3 py-1.5">
    <input
      type="text"
      bind:value={cenaStr}
      onblur={handleCenaBlur}
      class="w-full rounded bg-transparent text-right text-sm text-text-primary
             outline-none focus:bg-input-bg px-2 focus:outline-1
             focus:-outline-offset-1 focus:outline-input-border transition-all"
    />
  </td>

  <!-- Kosz — widoczny zawsze, podświetla się na czerwono przy hover -->
  <td class="w-8 px-2 py-1.5">
    <button
      type="button"
      onclick={() => onUsun?.()}
      class="text-text-muted hover:text-red-500 transition-colors"
    >
      <IconTrash size={16} stroke={1.5} />
    </button>
  </td>
</tr>
