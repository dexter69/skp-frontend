<script>
  // WyborKlienta.svelte
  // Command Palette wyszukiwania klienta.
  // onWybor — callback wywoływany gdy użytkownik wybierze klienta z listy.
  // otwarty — stan otwarcia modala, $bindable żeby rodzic (KartaKlienta)
  // mógł go otworzyć przez bind:otwarty={modalOtwarty}
  import { BACKEND_URL } from "$lib/config.js";

  let { onWybor, otwarty = $bindable(false) } = $props();

  // Fraza wpisana przez użytkownika w pole wyszukiwania.
  // Czyszczona przy zamknięciu modala.
  let fraza = $state("");

  // Lista klientów zwrócona przez API.
  let klienci = $state([]);

  // Czy trwa zapytanie do API.
  let laduje = $state(false);

  // Timer debounce — odkładamy zapytanie o 300ms po ostatnim naciśnięciu klawisza.
  // Zapobiega wysyłaniu zapytania przy każdej literze.
  let debounceTimer = null;

  // Reagujemy na zmianę frazy — uruchamiamy debounce.
  $effect(() => {
    const aktualneFraza = fraza;

    clearTimeout(debounceTimer);
    klienci = [];

    if (aktualneFraza.length < 2) {
      laduje = false;
      return;
    }

    laduje = true;
    debounceTimer = setTimeout(() => {
      szukaj(aktualneFraza);
    }, 300);
  });

  // Wysyła zapytanie do API i aktualizuje listę klientów.
  async function szukaj(fraza) {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/klienci/szukaj?fraza=${encodeURIComponent(fraza)}`,
        { credentials: "include" },
      );
      const data = await response.json();
      if (data.success) {
        klienci = data.data;
      } else {
        klienci = [];
      }
    } catch (e) {
      klienci = [];
    } finally {
      laduje = false;
    }
  }

  function zamknij() {
    otwarty = false;
    fraza = "";
    klienci = [];
    clearTimeout(debounceTimer);
  }  

  async function wybierz(klient) {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/klienci-adresy/${klient.id}`,
        { credentials: "include" },
      );
      const data = await response.json();
      const adresy = data.success ? data.data : [];
      onWybor?.({ ...klient, adresy });
    } catch (e) {
      // Błąd sieci — przekazujemy klienta bez adresów, adresy można dobrać później
      onWybor?.({ ...klient, adresy: [] });
    }
    zamknij();
  }

  // Zamykanie modala klawiszem Escape.
  function handleKlawisz(e) {
    if (e.key === "Escape" && otwarty) zamknij();
  }
</script>

<!-- Nasłuchujemy Escape globalnie na oknie. -->
<svelte:window onkeydown={handleKlawisz} />

{#if otwarty}
  <!-- Backdrop -->
  <button
    type="button"
    onclick={zamknij}
    class="fixed inset-y-0 right-0 z-50 bg-gray-500/25 cursor-default left-(--sidebar-width)"
  ></button>

  <!-- Kontener modala -->
  <div
    class="fixed inset-y-0 right-0 z-50 overflow-y-auto p-20 pointer-events-none left-(--sidebar-width)"
  >
    <div
      class="mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl outline-1 outline-black/5 pointer-events-auto"
    >
      <!-- Pole wyszukiwania z ikoną lupy -->
      <div class="grid grid-cols-1 border-b border-border-default">
        <input
          type="text"
          autofocus
          bind:value={fraza}
          placeholder="Szukaj klienta..."
          class="col-start-1 row-start-1 h-12 w-full pr-4 pl-11 text-sm text-text-primary outline-hidden placeholder:text-text-muted"
        />
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          class="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-text-muted"
        >
          <path
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clip-rule="evenodd"
            fill-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Lista wyników wyszukiwania -->
      {#if fraza.length < 2}
        <p class="px-4 py-3 text-sm text-text-muted">Zacznij wpisywać...</p>
      {:else if laduje}
        <p class="px-4 py-3 text-sm text-text-muted">Szukam...</p>
      {:else if klienci.length === 0}
        <p class="px-4 py-3 text-sm text-text-muted">Brak wyników.</p>
      {:else}
        <ul class="max-h-72 overflow-y-auto py-2">
          {#each klienci as klient}
            <li>
              <button
                type="button"
                onclick={() => wybierz(klient)}
                class="w-full px-4 py-2.5 text-left hover:bg-bg-primary transition-colors"
              >
                <p class="text-sm font-medium text-text-primary">
                  {klient.nazwa}
                </p>
                <p class="text-xs text-text-secondary truncate">
                  {klient.nazwaPelna ?? ""}
                </p>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}
