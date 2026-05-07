<script>
  // DevPanel — podgląd aktualnego stanu zamówienia w czasie rzeczywistym.
  // Używać tylko w developmencie — nie umieszczać w kodzie produkcyjnym.
  // Użycie: <DevPanel {dane} /> lub <DevPanel {dane} klucze={['produkty', 'przesylki']} />

  let { dane, klucze = null } = $props();

  // Czy panel jest zwinięty
  let zwinienty = $state(false);

  // Zwraca obiekt do wyświetlenia — albo cały stan, albo tylko wybrane klucze
  function pobierzDane() {
    const stan = dane();
    if (!klucze) return stan;
    const wynik = {};
    klucze.forEach(function(k) { wynik[k] = stan[k]; });
    return wynik;
  }
</script>

<!-- Panel przyklejony do prawego dolnego rogu ekranu.
     z-50 — nad wszystkimi innymi elementami.
     max-w-sm — nie zajmuje całej szerokości. -->
<div class="fixed bottom-4 right-4 z-50 max-w-sm w-full font-mono text-xs">

  <!-- Nagłówek z przyciskiem zwijania -->
  <div
    class="flex items-center justify-between rounded-t-md bg-gray-900 px-3 py-1.5 text-gray-300 cursor-pointer select-none"
    onclick={() => zwinienty = !zwinienty}
  >
    <span class="font-semibold text-yellow-400">⚙ DEV — Stan zamówienia</span>
    <span class="text-gray-500">{zwinienty ? '▲' : '▼'}</span>
  </div>

  <!-- Zawartość — ukryta gdy zwinięty -->
  {#if !zwinienty}
    <div class="max-h-96 overflow-y-auto rounded-b-md bg-gray-950 p-3 text-green-400 shadow-xl">
      <pre>{JSON.stringify(pobierzDane(), null, 2)}</pre>
    </div>
  {/if}

</div>
