// adresy.js — reguły biznesowe dotyczące adresów klienta.

// Zwraca domyślny adres wysyłki klienta albo null.
//
// Domyślny adres wskazuje backend przez flagę isDefault:
// — adres ustawiony jako domyślny przez użytkownika,
// — a gdy go nie ma: siedziba klienta, a przy kliencie bez siedziby
//   z jednym adresem — ten jedyny (CustomerService::_wskazDomyslnyAdres).
// Gdy backend nie wskazał żadnego — pierwszy adres z listy (API sortuje:
// domyślny, siedziba, potem wg id). Pusta lista lub jej brak → null.
//
// Jedno miejsce dla tej reguły — wcześniej była skopiowana w trzech
// komponentach i jedna z kopii została w formacie danych mockowych.
export function wybierzDomyslnyAdres(adresy) {
  if (!adresy || adresy.length === 0) return null;
  return (
    adresy.find(function (a) {
      return a.isDefault === true;
    }) || adresy[0]
  );
}
