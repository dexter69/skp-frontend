<script>
  // onWybor — callback wywoływany gdy użytkownik wybierze klienta z listy.
  // otwarty — stan otwarcia modala, $bindable żeby rodzic (KartaKlienta)
  // mógł go otworzyć przez bind:otwarty={modalOtwarty}
  let { onWybor, otwarty = $bindable(false) } = $props();

  // Dane klientów z centralnego mocka — spójne z resztą aplikacji.
  // TODO: zastąpić fetch do API CakePHP.
  // Endpoint: GET /api/klienci/szukaj?fraza=... → lista klientów
  import { MOCK_KLIENCI } from '$lib/api/mockDane.js';

  // Fraza wpisana przez użytkownika w pole wyszukiwania.
  // Czyszczona przy zamknięciu modala.
  let fraza = $state("");

  // Filtrowanie klientów na podstawie wpisanej frazy.
  // Wymagane minimum 2 znaki — żeby nie pokazywać całej listy od razu.
  // Filtruje po nazwie (case-insensitive).
  // TODO: gdy podpięte API — tu będzie wywołanie fetch zamiast filtrowania lokalnego
  const widoczniKlienci = $derived(
    fraza.length < 2
      ? []
      : MOCK_KLIENCI.filter((k) =>
          k.nazwa.toLowerCase().includes(fraza.toLowerCase()),
        ),
  );

  function zamknij() {
    otwarty = false;
    fraza = ""; // czyścimy frazę żeby następne otwarcie zaczęło od pustego pola
  }

  function wybierz(klient) {
    onWybor?.(klient); // przekazujemy wybranego klienta do rodzica
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
  <div class="fixed inset-y-0 right-0 z-50 overflow-y-auto p-20 pointer-events-none left-(--sidebar-width)">
    <div class="mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl outline-1 outline-black/5 pointer-events-auto">

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
      {:else if widoczniKlienci.length === 0}
        <p class="px-4 py-3 text-sm text-text-muted">Brak wyników.</p>
      {:else}
        <!-- Lista pasujących klientów.
             TODO: gdy będzie API, dodać debounce żeby nie wysyłać
             zapytania przy każdym naciśnięciu klawisza -->
        <ul class="max-h-72 overflow-y-auto py-2">
          {#each widoczniKlienci as klient}
            <li>
              <button
                type="button"
                onclick={() => wybierz(klient)}
                class="w-full px-4 py-2.5 text-left hover:bg-bg-primary transition-colors"
              >
                <span class="text-sm text-text-primary font-medium">{klient.nazwa}</span>
                <span class="text-text-muted"> · </span>
                <span class="text-sm text-text-secondary">{klient.miasto ?? ''}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}

    </div>
  </div>
{/if}
