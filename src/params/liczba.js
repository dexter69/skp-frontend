// Matcher parametru trasy: przepuszcza tylko liczby całkowite (id z bazy).
// Użycie w nazwie folderu: [id=liczba].
// Adres typu /zamowienia/abc/edycja daje 404 bez odpytywania API.
export function match(param) {
  return /^\d+$/.test(param);
}
