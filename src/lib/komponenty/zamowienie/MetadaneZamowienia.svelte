<script>
  import Toggle from "$lib/komponenty/Toggle.svelte";

  // dane() — funkcja zwracająca aktualny stan zamówienia z contextu
  // zaktualizuj() — częściowa aktualizacja stanu zamówienia
  let { dane, zaktualizuj } = $props();

  // Lokalna kopia stanu ekspresowe — potrzebna do bind:wartosc w Toggle.
  // Używamy lokalnej zmiennej zamiast bezpośrednio dane().ekspresowe,
  // bo Toggle wymaga dwukierunkowego powiązania przez bind:.
  let ekspresowe = $state(dane().ekspresowe);
</script>

<div class="flex h-full flex-col gap-3 p-4">
  <!-- Data realizacji.
       Używamy value + onchange zamiast bind:value —
       dane pochodzą z zewnętrznego stanu (kontekst zamówienia),
       nie z lokalnej zmiennej Svelte. -->
  <div>
    <p class="block text-xs font-medium text-text-secondary mb-1">
      Data realizacji
    </p>
    <input
      type="date"
      value={dane().dataRealizacji ?? ""}
      onchange={(e) => zaktualizuj({ dataRealizacji: e.target.value })}
      class="block w-full rounded-md bg-input-bg px-3 py-1.5 text-sm text-input-text outline-1 -outline-offset-1 outline-input-border focus:outline-2 focus:-outline-offset-2 focus:outline-border-focus"
    />
  </div>

  <!-- Toggle ekspresowe.
       onZmiana aktualizuje globalny stan zamówienia przez zaktualizuj(). -->
  <Toggle
    etykieta="EKSPRES"
    bind:wartosc={ekspresowe}
    onZmiana={(v) => zaktualizuj({ ekspresowe: v })}
  />
</div>
