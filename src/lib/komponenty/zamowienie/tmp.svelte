<script>
  import SzczegolyPrzesylki from "./SzczegolyPrzesylki.svelte";
  // ...
</script>

<!-- zamiast: -->
<div bind:this={refSzczegoly} class="flex-1 min-h-0 overflow-hidden rounded-lg bg-white shadow-sm">
  <div class="p-4 text-sm text-text-secondary">
    [Szczegóły przesyłki {aktywnaId} — TODO]
  </div>
</div>

<!-- wstaw: -->
<div bind:this={refSzczegoly} class="flex-1 min-h-0 overflow-hidden rounded-lg bg-white shadow-sm">
  {#each dane().przesylki as przesylka, i}
    {#if przesylka.id === aktywnaId}
      <SzczegolyPrzesylki
        {przesylka}
        produkty={dane().produkty}
        numerPrzesylki={i + 1}
        onZmiana={(zmiany) => zaktualizujPrzesylke(przesylka.id, zmiany)}
        onUsun={() => usunPrzesylke(przesylka.id)}
      />
    {/if}
  {/each}
</div>