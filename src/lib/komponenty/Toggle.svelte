<script>
  const kolorDomyslny = 'var(--accent)';
  const kolorWylaczony = 'oklch(92.8% 0.006 264)'; //'oklch(89.9% 0.061 343.231)'; //'oklch(92.8% 0.006 264)';

  let { etykieta, wartosc = $bindable(false), kolorAktywny = kolorDomyslny } = $props();  
</script>

<div class="inline-flex items-center gap-3">
  <div
    class="group relative inline-flex w-11 shrink-0 rounded-full p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 transition-colors duration-200 ease-in-out has-focus-visible:outline-2"
    style="background-color: {wartosc ? kolorAktywny : kolorWylaczony}"
  >
    <span class="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out {wartosc ? 'translate-x-5' : ''}"></span>
    <input
      type="checkbox"
      checked={wartosc}
      onchange={(e) => wartosc = e.target.checked}
      aria-label={etykieta}
      class="absolute inset-0 size-full appearance-none focus:outline-hidden"
    />
  </div>
  {#if etykieta}
    <span class="text-xs font-medium text-text-secondary">{etykieta}</span>
  {/if}
</div>