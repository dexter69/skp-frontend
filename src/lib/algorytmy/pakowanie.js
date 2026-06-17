// pakowanie.js — algorytm układania produktów w paczki.
// Eksportuje obliczPakowanie(produkty, rozmiary) — główna funkcja.
// Rozmiary paczek docelowo z API, przekazywane jako parametr.
// Produkty to tablica { produkt_id, ilosc } z przesylka.pozycje (tylko ilosc > 0).

// Oblicza optymalne pakowanie dla podanej ilości i dostępnych rozmiarów.
// Zwraca tablicę { pojemnosc, ilosc, niestandardowa }.
// Algorytm zachłanny: zawsze próbuje użyć największej pasującej paczki.
// Preferuje równe paczki (wszystkie tego samego rozmiaru) gdy nie zwiększa ich liczby.
function pakujIlosc(ilosc, rozmiary) {
  if (ilosc <= 0) return [];

  // Rozmiary posortowane malejąco.
  const posortowane = rozmiary.slice().sort(function(a, b) { return b - a; });

  // Algorytm zachłanny — baseline.
  function zachlannie(ile) {
    var wynik = [];
    var pozostalo = ile;
    for (var i = 0; i < posortowane.length; i++) {
      var r = posortowane[i];
      if (r <= pozostalo) {
        var n = Math.floor(pozostalo / r);
        wynik.push({ pojemnosc: r, ilosc: n, niestandardowa: false });
        pozostalo -= n * r;
      }
    }
    if (pozostalo > 0) {
      wynik.push({ pojemnosc: pozostalo, ilosc: 1, niestandardowa: true });
    }
    return wynik;
  }

  // Liczy łączną liczbę paczek w wyniku.
  function liczPaczki(wynik) {
    return wynik.reduce(function(s, p) { return s + p.ilosc; }, 0);
  }

  var baseline = zachlannie(ilosc);
  var minPaczek = liczPaczki(baseline);

  // Sprawdź czy da się użyć tylko jednego rozmiaru (równe paczki)
  // bez zwiększania liczby paczek.
  for (var i = 0; i < posortowane.length; i++) {
    var r = posortowane[i];
    if (r > ilosc) continue;
    if (ilosc % r === 0) {
      var n = ilosc / r;
      if (n <= minPaczek) {
        // Równe paczki, nie więcej niż baseline — preferujemy.
        return [{ pojemnosc: r, ilosc: n, niestandardowa: false }];
      }
    }
  }

  return baseline;
}

// Główna funkcja algorytmu.
// produkty: tablica { produkt_id, ilosc } — pozycje przesyłki
// rozmiary: tablica liczb, np. [5000, 3000, 2000, 1000]
// Zwraca tablicę { pojemnosc, ilosc, niestandardowa, produkt_id? }
export function obliczPakowanie(produkty, rozmiary) {
  var suma = produkty.reduce(function(s, p) { return s + p.ilosc; }, 0);
  if (suma <= 0) return [];

  // Krok 1: pakowanie całej sumy — daje minimalną liczbę paczek.
  var wynikCalosci = pakujIlosc(suma, rozmiary);

  function liczPaczki(wynik) {
    return wynik.reduce(function(s, p) { return s + p.ilosc; }, 0);
  }

  var minPaczek = liczPaczki(wynikCalosci);

  // Krok 2: sprawdź czy pakowanie per produkt daje tę samą liczbę paczek.
  // Jeśli tak — użyj wariantu per produkt (nie mieszamy produktów).
  var wynikPerProdukt = [];
  var lacznie = 0;
  for (var i = 0; i < produkty.length; i++) {
    var p = produkty[i];
    var wynikProduktu = pakujIlosc(p.ilosc, rozmiary);
    lacznie += liczPaczki(wynikProduktu);
    // Zachowujemy produkt_id tylko dla informacji — UI może go wykorzystać.
    for (var j = 0; j < wynikProduktu.length; j++) {
      wynikPerProdukt.push(Object.assign({}, wynikProduktu[j]));
    }
  }

  if (lacznie <= minPaczek) {
    // Per produkt nie zwiększa liczby paczek — preferujemy (nie mieszamy).
    return scalWpisy(wynikPerProdukt);
  }

  // Krok 1 wygrywa — zwracamy pakowanie całości.
  return scalWpisy(wynikCalosci);  
}

// Scal wpisy tego samego rozmiaru.
function scalWpisy(wynik) {
  var mapa = {};
  for (var i = 0; i < wynik.length; i++) {
    var klucz = wynik[i].pojemnosc + '_' + wynik[i].niestandardowa;
    if (mapa[klucz]) {
      mapa[klucz].ilosc += wynik[i].ilosc;
    } else {
      mapa[klucz] = Object.assign({}, wynik[i]);
    }
  }
  return Object.values(mapa);
}

// Domyślne rozmiary paczek — używane gdy API nie zwróci rozmiarów.
// Docelowo zastąpione przez dane z API.
export const DOMYSLNE_ROZMIARY = [5000, 3000, 2000, 1000];