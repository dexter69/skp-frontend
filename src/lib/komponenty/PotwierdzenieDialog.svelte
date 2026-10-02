<script>
  // PotwierdzenieDialog — uniwersalne okno potwierdzenia akcji (np. usunięcia).
  // Oparte na Tailwind Plus: Application UI → Overlays → Modal Dialogs → "Simple alert".
  //
  // Zmiany względem oryginału Tailwind Plus:
  // — zamiast <el-dialog> (skrypt @tailwindplus/elements) otwieranie przez prop
  //   `otwarty` i blok {#if} — jak w pozostałych modalach aplikacji,
  // — tło i panel obejmują obszar roboczy z pominięciem sidebara
  //   (left-(--sidebar-width)) — jak WyborKlienta i WyborAdresu,
  // — ikona z Tabler (IconAlertTriangle) zamiast SVG z Heroicons,
  // — przyciski przez komponent Przycisk (warianty danger / secondary),
  // — kolory z motywu (text-text-*, error-*) zamiast gray/red z Tailwinda.
  //
  // Czysty komponent: nie zna stanu zamówienia, komunikuje się tylko callbackami.
  // Anulowanie: przycisk "Anuluj", klawisz Escape albo kliknięcie w tło.
  // Enter celowo NIE potwierdza — akcja jest zwykle nieodwracalna.
  import { IconAlertTriangle } from "@tabler/icons-svelte-runes";
  import Przycisk from "$lib/komponenty/Przycisk.svelte";

  let {
    otwarty = false,               // czy okno jest widoczne — steruje rodzic
    tytul = "",                    // np. "Usunąć przesyłkę?"
    tresc = "",                    // wyjaśnienie skutków akcji
    etykietaPotwierdz = "Usuń",    // tekst przycisku akcji
    etykietaAnuluj = "Anuluj",
    onPotwierdz,                   // callback() — użytkownik potwierdził
    onAnuluj,                      // callback() — anulował (przycisk, Escape, tło)
  } = $props();

  // Escape zamyka okno — nasłuch globalny, aktywny tylko gdy okno otwarte.
  function handleKlawisz(e) {
    if (e.key === "Escape" && otwarty) onAnuluj?.();
  }
</script>

<svelte:window onkeydown={handleKlawisz} />

{#if otwarty}
  <!-- Tło — kliknięcie anuluje -->
  <button
    type="button"
    onclick={() => onAnuluj?.()}
    class="fixed inset-y-0 right-0 z-50 bg-gray-500/75 cursor-default left-(--sidebar-width)"
  ></button>

  <!-- Kontener — centruje panel w obszarze roboczym -->
  <div
    class="pointer-events-none fixed inset-y-0 right-0 z-50 flex items-center justify-center overflow-y-auto p-4 left-(--sidebar-width)"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="potwierdzenie-tytul"
      class="pointer-events-auto relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl"
    >
      <div class="flex items-start">
        <!-- Ikona ostrzeżenia -->
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-error-bg"
        >
          <IconAlertTriangle size={24} stroke={1.5} class="text-error-text" />
        </div>
        <div class="ml-4 text-left">
          <h3 id="potwierdzenie-tytul" class="text-base font-semibold text-text-primary">
            {tytul}
          </h3>
          <div class="mt-2">
            <p class="text-sm text-text-secondary">{tresc}</p>
          </div>
        </div>
      </div>

      <!-- Przyciski: akcja po prawej (flex-row-reverse), anulowanie obok -->
      <div class="mt-4 flex flex-row-reverse">
        <Przycisk
          wariant="danger"
          rozmiar="lg"
          klasa="ml-3"
          onclick={() => onPotwierdz?.()}
        >
          {etykietaPotwierdz}
        </Przycisk>
        <Przycisk wariant="secondary" rozmiar="lg" onclick={() => onAnuluj?.()}>
          {etykietaAnuluj}
        </Przycisk>
      </div>
    </div>
  </div>
{/if}
