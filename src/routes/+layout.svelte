<script>
  import '../app.css';
  import { setContext } from 'svelte';

  let { children } = $props();

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
    { label: 'Karty', submenu: [], deprecated: true },
  ];

  let openItem = $state(null);
  function toggleItem(label) {
    openItem = openItem === label ? null : label;
  }

  let kontekstGorny = $state(null);
  setContext('sidebar', {
    ustawKontekst: (komponent) => { kontekstGorny = komponent; },
    wyczyscKontekst: () => { kontekstGorny = null; }
  });
</script>

<div class="fixed inset-y-0 left-0 w-64 bg-nav-bg flex flex-col h-screen">

  <!-- Strefa górna: kontekstowa -->
  {#if kontekstGorny}
    <div class="px-3 py-4 border-b border-white/30">
      {@render kontekstGorny()}
    </div>
  {/if}

  <!-- Strefa dolna: nawigacja -->
  <nav class="flex-1 px-3 py-4 overflow-y-auto">
    <ul class="space-y-1">
      {#each navItems as item}
        <li>
          {#if item.submenu.length > 0}
            <button
              type="button"
              onclick={() => toggleItem(item.label)}
              class="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors
                {openItem === item.label
                  ? 'bg-nav-item-hover text-text-on-dark'
                  : 'text-text-muted hover:text-text-on-dark hover:bg-nav-item-hover'}"
            >
              <span>{item.label}</span>
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

  <!-- Logo -->
  <div class="px-4 py-4 border-t border-white/20">
    <span class="text-text-on-dark font-bold">SKP</span>
  </div>

</div>

<main class="ml-64 h-screen overflow-y-auto bg-bg-primary">
  <div class="h-full px-8 py-8">
    {@render children()}
  </div>
</main>