<script>
  import '../app.css';
  import { setContext } from 'svelte';

  let { children } = $props();

  // Definicja nawigacji aplikacji.
  // submenu: [] oznacza brak podmenu — element działa jako zwykły link.
  // deprecated: true — element wyszarzony, niedostępny (stara funkcjonalność do usunięcia w przyszłości)
  const navItems = [
    {
      label: 'Zamówienia',
      submenu: [
        { label: 'Nowe zamówienie', href: '/zamowienia/nowe' },
        { label: 'Lista zamówień', href: '/zamowienia' },
      ]
    },
    {
      label: 'Przesyłki',
      submenu: [
        { label: 'Lista przesyłek', href: '#' },
      ]
    },
    { label: 'Klienci', submenu: [] },
    { label: 'Produkcja', submenu: [] },
    // Karty: stara funkcjonalność, zachowana tymczasowo
    { label: 'Karty', submenu: [], deprecated: true },
  ];

  // Śledzenie która pozycja nawigacji jest aktualnie rozwinięta
  let openItem = $state(null);
  function toggleItem(label) {
    openItem = openItem === label ? null : label;
  }

  // Mechanizm dwustrefowego sidebara.
  // Górna strefa jest kontekstowa — każda podstrona może wstrzyknąć tam
  // swój snippet (np. sekcje formularza zamówienia) przez getContext('sidebar').
  // Gdy użytkownik opuści podstronę, snippet jest czyszczony automatycznie.
  let kontekstGorny = $state(null);
  setContext('sidebar', {
    ustawKontekst: (komponent) => { kontekstGorny = komponent; },
    wyczyscKontekst: () => { kontekstGorny = null; }
  });
</script>

<!-- Sidebar: stały, pełna wysokość ekranu.
     Szerokość kontrolowana przez zmienną CSS --sidebar-width zdefiniowaną w app.css.
     Zmiana szerokości = zmiana tylko tej jednej zmiennej. -->
<div class="fixed inset-y-0 left-0 w-(--sidebar-width) bg-nav-bg flex flex-col h-screen">

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
              <svg viewBox="0 0 20 20" fill="currentColor"
                class="size-4 transition-transform {openItem === item.label ? 'rotate-180' : ''}">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
            {#if openItem === item.label}
              <ul class="mt-1 space-y-1 pl-4">
                {#each item.submenu as sub}
                  <li>
                    <a href={sub.href}
                      class="block rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:text-text-on-dark hover:bg-nav-sub-hover transition-colors">
                      {sub.label}
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          {:else}
            <!-- Pozycja bez podmenu — zwykły link.
                 deprecated: wyszarzony i niedostępny dla użytkownika -->
            <a href="#"
              class="block rounded-md px-3 py-2 text-sm font-medium transition-colors
                {item.deprecated
                  ? 'text-text-muted opacity-50 cursor-not-allowed'
                  : 'text-text-muted hover:text-text-on-dark hover:bg-nav-item-hover'}">
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
  <div class="h-full px-8 py-8">
    {@render children()}
  </div>
</main>