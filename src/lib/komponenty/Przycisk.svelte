<script>
  // Przycisk — uniwersalny komponent przycisku dla całej aplikacji.
  // Oparty na komponentach z Tailwind Plus, kolory z theme-light/dark.css.
  //
  // Warianty:
  //   primary   — główne akcje (wypełniony kolorem accent)
  //   secondary — akcje pomocnicze (biały z borderem)
  //   danger    — destrukcyjne akcje (czerwony)
  //
  // Rozmiary:
  //   sm  — małe miejsca, gęste UI
  //   md  — standard (domyślny)
  //   lg  — wyróżnione akcje
  //
  // klasa — dodatkowe klasy CSS (np. 'w-full' dla pełnej szerokości)

  let {
    wariant = 'primary',  // 'primary' | 'secondary' | 'danger'
    rozmiar = 'md',       // 'sm' | 'md' | 'lg'
    disabled = false,
    onclick,
    klasa = '',           // dodatkowe klasy CSS
    children,
  } = $props();

  // Klasy rozmiaru — padding, czcionka, zaokrąglenie.
  const klasaRozmiaru = {
    sm: 'px-2 py-1 text-xs rounded-sm',
    md: 'px-2.5 py-1.5 text-sm rounded-md',
    lg: 'px-3 py-2 text-sm rounded-md',
  }[rozmiar] ?? 'px-2.5 py-1.5 text-sm rounded-md';

  // Klasy wariantu — kolory, cień, focus.
  const klasaWariantu = {
    primary: `
      bg-accent text-text-on-dark shadow-xs
      hover:enabled:bg-accent-hover
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
    `,
    secondary: `
      bg-white text-text-primary shadow-xs inset-ring inset-ring-border-default
      hover:enabled:bg-bg-primary
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
    `,
    danger: `
      bg-error-bg text-error-text shadow-xs inset-ring inset-ring-error-border
      hover:enabled:bg-white
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-border
    `,
  }[wariant] ?? '';
</script>

<button
  type="button"
  {disabled}
  {onclick}
  class="font-semibold transition-colors
         disabled:cursor-not-allowed disabled:opacity-40
         {klasaRozmiaru} {klasaWariantu} {klasa}"
>
  {@render children?.()}
</button>
