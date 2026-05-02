<script>
  import Toggle from "$lib/komponenty/Toggle.svelte";

  let { dane, zaktualizuj } = $props();

  let ekspresowe = $state(dane().ekspresowe);

  $effect(() => {
    zaktualizuj({ ekspresowe });
  });
</script>

<div class="flex h-full flex-col gap-3 p-4">
  <!-- Data realizacji -->
  <div>
    <label class="block text-xs font-medium text-text-secondary mb-1">
      Data realizacji
    </label>
    <input
      type="date"
      value={dane().dataRealizacji ?? ""}
      onchange={(e) => zaktualizuj({ dataRealizacji: e.target.value })}
      class="block w-full rounded-md bg-input-bg px-3 py-1.5 text-sm text-input-text outline outline-1 -outline-offset-1 outline-input-border focus:outline-2 focus:-outline-offset-2 focus:outline-border-focus"
    />
  </div>

  <!-- Ekspresowe -->
  <Toggle etykieta="EKSPRES" bind:wartosc={ekspresowe} />

  <!-- Typ klienta -->
  {#if dane().klient}
    <div>
      <label class="block text-xs font-medium text-text-secondary mb-1">
        Klient
      </label>
      <div class="flex gap-2">
        {#each ["nowy", "stały"] as typ}
          <button
            type="button"
            onclick={() => zaktualizuj({ typKlienta: typ })}
            class="flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors
              {dane().typKlienta === typ
              ? 'border-accent bg-accent text-white'
              : 'border-border-default bg-white text-text-secondary hover:border-border-strong'}"
          >
            {typ.charAt(0).toUpperCase() + typ.slice(1)}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
