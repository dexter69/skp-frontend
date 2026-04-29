<script>
  import '../app.css';

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
    {
      label: 'Klienci',
      submenu: []
    },
    {
      label: 'Produkcja',
      submenu: []
    },
    {
      label: 'Karty',
      submenu: [],
      deprecated: true
    },
  ];

  let openItem = $state(null);

  function toggleItem(label) {
    openItem = openItem === label ? null : label;
  }
</script>

<div class="fixed inset-y-0 left-0 w-64 bg-gray-900 flex flex-col h-screen">
  <!-- Strefa górna: kontekstowa -->
  <div class="px-4 py-4">
    <!-- slot kontekstowy — wypełniany przez podstrony w przyszłości -->
  </div>

  <hr class="border-white/10 mx-4" />

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
                  ? 'bg-white/5 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}"
            >
              <span>{item.label}</span>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                class="size-4 transition-transform {openItem === item.label ? 'rotate-180' : ''}"
              >
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
            {#if openItem === item.label}
              <ul class="mt-1 space-y-1 pl-4">
                {#each item.submenu as sub}
                  <li>
                    <a
                      href={sub.href}
                      class="block rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {sub.label}
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          {:else}
            <a
              href="#"
              class="block rounded-md px-3 py-2 text-sm font-medium transition-colors
                {item.deprecated
                  ? 'text-gray-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}"
            >
              {item.label}
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Logo -->
  <div class="px-4 py-4 mt-auto">
    <span class="text-white font-bold">SKP</span>
  </div>
</div>

<main class="ml-64 h-screen overflow-y-auto bg-gray-100">
  <div class="px-8 py-8">
    {@render children()}
  </div>
</main>
