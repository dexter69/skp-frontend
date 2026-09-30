<!-- /zamowienia/[id]/edycja — edycja istniejącego zamówienia.
     Ten sam formularz co nowe zamówienie; dane z API przychodzą z (formularz)/+layout.server.js.
     [id=liczba] — id musi być liczbą (matcher w src/params/liczba.js). -->
<script>
  import FormularzZamowienia from "$lib/komponenty/zamowienie/FormularzZamowienia.svelte";
</script>

<FormularzZamowienia />
