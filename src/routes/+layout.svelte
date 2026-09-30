<script>
  import "../app.css";
  import { setContext } from "svelte";
  import { page } from "$app/state";

  let { children } = $props();

  // Definicja nawigacji aplikacji.
  // submenu: [] oznacza brak podmenu — element działa jako zwykły link.
  // deprecated: true — element wyszarzony, niedostępny (stara funkcjonalność do usunięcia w przyszłości)
  // disabled: true (w podmenu) — widok jeszcze nie istnieje; pozycja wyszarzona, nieklikalna
  // pelnePrzeladowanie: true (w podmenu) — link ładuje stronę od nowa
  //   (data-sveltekit-reload), z pominięciem routera SvelteKit.
  //   "Nowe zamówienie" ma zawsze dać czysty formularz — także gdy użytkownik
  //   jest już na /zamowienia/nowe (przejście pod ten sam adres przez router
  //   nie tworzy komponentów od nowa, więc zostałyby wpisane dane).
  const navItems = [
    {
      label: "Zamówienia",
      submenu: [
        { label: "Nowe zamówienie", href: "/zamowienia/nowe", pelnePrzeladowanie: true },
        { label: "Lista zamówień", href: "/zamowienia", disabled: true },
      ],
    },
    {
      label: "Przesyłki",
      submenu: [{ label: "Lista przesyłek", href: "#", disabled: true }],
    },
    { label: "Klienci", submenu: [] },
    { label: "Produkcja", submenu: [] },
    // Karty: stara funkcjonalność, zachowana tymczasowo
    { label: "Karty", submenu: [], deprecated: true },
  ];

  // Śledzenie która pozycja nawigacji jest aktualnie rozwinięta
  let openItem = $state(null);
  function toggleItem(label) {
    openItem = openItem === label ? null : label;
  }

  // Mechanizm dwustrefowego sidebara.
  // Górna strefa jest kontekstowa — każda podstrona może wstrzyknąć tam
  // swój snippet (np. sekcje formularza zamówienia) przez getContext('sidebar').
  //
  // ustawKontekst() zwraca funkcję czyszczącą — podstrona wywołuje ją w onDestroy.
  // Funkcja czyści tylko WŁASNY snippet: przy przejściu z zamówienia A do B
  // nowa instancja podstrony (B) ustawia swój snippet, ZANIM stara (A) zostanie
  // zniszczona. Bez tego sprawdzenia A wyczyściłaby snippet B i sekcje
  // formularza zniknęłyby z sidebara.
  let kontekstGorny = $state(null);
  let aktualnyToken = null; // kto aktualnie "trzyma" górną strefę — zwykła zmienna, nie stan

  setContext("sidebar", {
    ustawKontekst: (komponent) => {
      const token = {}; // unikalny obiekt — identyfikuje to jedno wywołanie
      aktualnyToken = token;
      kontekstGorny = komponent;

      return function wyczysc() {
        if (aktualnyToken === token) {
          aktualnyToken = null;
          kontekstGorny = null;
        }
      };
    },
  });
</script>

<!-- Sidebar: stały, pełna wysokość ekranu.
     Szerokość kontrolowana przez zmienną CSS --sidebar-width zdefiniowaną w app.css.
     Zmiana szerokości = zmiana tylko tej jednej zmiennej. -->
<div
  class="fixed inset-y-0 left-0 w-(--sidebar-width) bg-nav-bg flex flex-col h-screen"
>
  <!-- Strefa górna: kontekstowa.
       Widoczna tylko gdy podstrona wstrzyknie tu swój snippet.
       Przykład: sekcje formularza zamówienia. -->
  {#if kontekstGorny}
    <div class="px-3 py-4 border-b border-white/30">
      {@render kontekstGorny()}
    </div>
  {/if}

  <!-- Strefa dolna: stała nawigacja aplikacji -->
  <nav class="flex-1 px-3 py-4 overflow-y-auto">
    <ul class="space-y-1">
      {#each navItems as item}
        <li>
          {#if item.submenu.length > 0}
            <!-- Pozycja z podmenu — klikalny przycisk rozwijający listę -->
            <button
              type="button"
              onclick={() => toggleItem(item.label)}
              class="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors
                {openItem === item.label
                ? 'bg-nav-item-hover text-text-on-dark'
                : 'text-text-muted hover:text-text-on-dark hover:bg-nav-item-hover'}"
            >
              <span>{item.label}</span>
              <!-- Strzałka obraca się o 180° gdy podmenu jest otwarte -->
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                class="size-4 transition-transform {openItem === item.label
                  ? 'rotate-180'
                  : ''}"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                />
              </svg>
            </button>
            {#if openItem === item.label}
              <ul class="mt-1 space-y-1 pl-4">
                {#each item.submenu as sub}
                  <li>
                    {#if sub.disabled}
                      <!-- Widok jeszcze nie istnieje — wyszarzony, bez linku -->
                      <span
                        title="Wkrótce"
                        class="block rounded-md px-3 py-2 text-sm font-medium text-text-muted opacity-50 cursor-not-allowed"
                      >
                        {sub.label}
                      </span>
                    {:else}
                      <!-- data-sveltekit-reload tylko dla pozycji z pelnePrzeladowanie;
                           undefined = atrybut pominięty, zwykła nawigacja przez router -->
                      <a
                        href={sub.href}
                        data-sveltekit-reload={sub.pelnePrzeladowanie ? "" : undefined}
                        class="block rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:text-text-on-dark hover:bg-nav-sub-hover transition-colors"
                      >
                        {sub.label}
                      </a>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          {:else}
            <!-- Pozycja bez podmenu — zwykły link.
                 deprecated: wyszarzony i niedostępny dla użytkownika -->
            <a
              href="#"
              class="block rounded-md px-3 py-2 text-sm font-medium transition-colors
                {item.deprecated
                ? 'text-text-muted opacity-50 cursor-not-allowed'
                : 'text-text-muted hover:text-text-on-dark hover:bg-nav-item-hover'}"
            >
              {item.label}
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Logo / nazwa aplikacji -->
  <div class="px-4 py-4 border-t border-white/20">
    <span class="text-text-on-dark font-bold">SKP</span>
  </div>
</div>

<!-- Panel główny (PG): zajmuje resztę ekranu po prawej stronie sidebara.
     margin-left = szerokość sidebara (--sidebar-width).
     Tylko PG scrolluje — nie cała strona. -->
<main class="ml-(--sidebar-width) h-screen overflow-hidden bg-bg-primary">
  <div class="h-full">
    <!-- {#key} tworzy podstronę od nowa, gdy zmienia się parametr id w adresie
         (np. przejście z zamówienia A do zamówienia B, także przyciskiem Wstecz,
         albo z /zamowienia/nowe na /zamowienia/123/edycja po pierwszym zapisie —
         formularz buduje się wtedy od nowa z danych zapisanych w bazie).
         Bez tego SvelteKit używa ponownie tych samych komponentów: dostają nowe
         data, ale stan utworzony przy pierwszym renderze (klient, produkty,
         id zamówienia) zostaje z poprzedniego zamówienia.
         Dotyczy każdej trasy z parametrem [id]; dla tras bez niego klucz
         jest undefined i nic się nie dzieje. -->
    {#key page.params.id}
      {@render children()}
    {/key}
  </div>
</main>
