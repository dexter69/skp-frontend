# Projekt: SKP — System zarządzania zamówieniami (plastikowe karty)

Aplikacja biznesowa z 11-letnią historią. Prowadź rozmowy po polsku
(angielski OK jeśli wygodniejszy w danym kontekście, np. nazwy
techniczne, fragmenty kodu).

---

## Stack technologiczny

**Backend:**
- CakePHP 2.4.x (NIE 3.x/4.x/5.x — stara architektura, inne konwencje)
- PHP 5.6 (NIE używaj składni PHP 7/8: brak match, named arguments,
  readonly, ??=, typed properties, union types itp.)
- MySQL 5.7 (produkcja: 5.7.33) — pełny domyślny `sql_mode`, w tym
  `ONLY_FULL_GROUP_BY` i `STRICT_TRANS_TABLES`; każde nowe zapytanie SQL
  musi być z nim zgodne

**Frontend — nowy (aktywna praca):**
- SvelteKit (Svelte 5) — nowe widoki jako osobna aplikacja deweloperska
- TailwindCSS 4.x + Tailwind Plus
- Docelowo serwowany pod skp.lan/app/ (Apache ProxyPass → Node.js)
- Komunikacja z backendem przez JSON API (CakePHP kontrolery
  z odpowiedziami JSON)
- Sesja PHP współdzielona przez credentials: include w fetch

**Frontend — stary (nie ruszamy bez wyraźnej prośby):**
- CakePHP Views (.ctp), mieszanina starszych technologii
- Traktuj jako "czytaj tylko" jeśli nie zostanę poproszony o zmianę
- Część widoków ma Alpine.js + Tailwind — poprzednie podejście,
  nie rozwijamy dalej

---

## Środowisko deweloperskie

**System i narzędzia:**
- Fedora Linux + GNOME
- Visual Studio Code
- DDEV (Docker) — lokalny serwer CakePHP
- Czat webowy claude.ai (projekt SKP) — planowanie, architektura, kod.
  Claude Code obecnie nieużywany (decyzja: wrzesień 2026)
- Repo skp-frontend jest publiczne (https://github.com/dexter69/skp-frontend) —
  Claude klonuje je sam; backend jest prywatny — potrzebne pliki wrzucam do czatu
- Zmiany we frontendzie Claude dostarcza jako patch do `git apply`,
  w backendzie jako pełne pliki do podmiany

**CakePHP (przez DDEV):**
- Adres lokalny: https://skp2x.ddev.site
- PHP 5.6, MySQL 5.7 w DDEV (od września 2026; wcześniej MariaDB 10.2) —
  ten sam silnik co produkcja
- `.ddev/mysql/sql_mode.cnf` — `sql_mode` identyczny z produkcją
- Katalog projektu: `~/DEV/PK/skp2x`

**SvelteKit:**
- Osobny projekt poza DDEV — uruchamiany natywnie na Fedorze
- Nazwa projektu: skp-frontend
- Dev server: npm run dev → localhost:5173
- Fetch API kierowany na https://skp2x.ddev.site

**Serwer produkcyjny:**
- Apache, wewnętrzna sieć LAN, pseudo-domena skp.lan (plik hosts)
- Brak HTTPS (sieć wewnętrzna)
- CakePHP na skp.lan, SvelteKit docelowo na skp.lan/app/
- Apache ProxyPass: `/app/` → Node.js (localhost:3000), reszta → CakePHP

**Zmienne środowiskowe (SvelteKit):**
- `.env` w root skp-frontend (w .gitignore) — zmienne lokalne DEV
- `.env.example` w repo — dokumentacja dostępnych zmiennych
- `src/lib/config.js` — jedyne miejsce gdzie czytamy import.meta.env;
  importuj BACKEND_URL z tego pliku wszędzie indziej
- `VITE_BACKEND_URL` — na DEV: https://skp2x.ddev.site, na produkcji: puste
  (obie aplikacje na tej samej domenie skp.lan)

---

## Architektura

**Aktywne obszary backendu:**
- app/Controller/ — nowe akcje API (JSON), minimalne i punktowe zmiany
- Nie refaktoryzuj otaczającego kodu jeśli nie zostanę o to poproszony

**Nieaktywne obszary (nie sugeruj zmian):**
- Reszta projektu działa stabilnie — traktuj jako "czytaj tylko"

### Strategia migracji bazy danych

Aplikacja ma ponad 23 tys. zamówień w bazie i 40–100 aktywnych zamówień
w dowolnym momencie. Baza i stary kod muszą działać bez przerwy.

**Zasada nadrzędna: nie dotykamy starego kodu.**

- Nowe zamówienia obsługują nowe kontrolery API (`*ApiController`) + nowe modele
- Nowe modele używają `$useTable` wskazującym na istniejące tabele gdzie potrzeba
- Nowe API zapisuje równolegle do nowych tabel ORAZ do starej tabeli `cards`
  (szkielet rekordu: name, quantity, price, order_id, customer_id, status=PRIV)
  — dzięki temu stary kod nadal widzi karty i działa bez zmian
- Stary kod nie wie o istnieniu nowych tabel

**Rozróżnienie zamówień stary/nowy UI:**
- Pole `ui_version` w tabeli `orders` (TINYINT, DEFAULT 1)
- `1` = zamówienie stworzone przez stary UI (legacy)
- `2` = zamówienie stworzone przez nowy UI (Svelte)
- Stary UI generuje link "Edytuj" warunkowo na podstawie `ui_version`
- Nowy UI (`+layout.server.js`) przekierowuje zamówienia z `ui_version != 2`
  do starego UI przez `throw redirect(302, \`${BACKEND_URL}/orders/edit/${id}\`)`
- Użytkownik nigdy nie widzi błędu — zawsze trafia we właściwe miejsce

**Konwencja nazewnictwa nowego kodu:**
Nowe kontrolery i modele mają sufiks `Api` — łatwo je odróżnić od starych:
```
OrdersApiController.php    → model: OrderApi      ($useTable = 'orders')
CustomersApiController.php → model: CustomerApi   ($useTable = 'customers')
CardsApiController.php     → model: CardApi        ($useTable = 'cards')
ShipmentsApiController.php → model: ShipmentApi
```

**Podział odpowiedzialności w nowym API (kontroler / serwis / model):**
- **Model** (`*Api.php`) — zapytania do bazy: `find()`, custom SQL, wszystko
  co dotyka bazy. Zwraca surowe dane bez formatowania dla Svelte.
- **Serwis** (`*Service.php`) — logika biznesowa i formatowanie: wywołuje metody
  modelu, składa wyniki z wielu modeli, konwertuje do struktury Svelte. Zero SQL.
- **Kontroler** (`*ApiController.php`) — tylko HTTP: waliduje żądanie,
  wywołuje serwis, zwraca odpowiedź przez `_respondSuccess()` / `_respondError()`.

**Konwencje odpowiedzi API** (szczegóły: `api-dokumentacja.md`):
- Klienta i adres formatuje wyłącznie `CustomerService` (`pobierzKlienta()`,
  `formatujAdres()`) — ten sam kształt w każdym endpoincie; inne serwisy
  z niego korzystają zamiast mieć własne kopie
- Teksty jednoliniowe czyszczone przez `AppService::_czyscTekst()` (stary UI
  nie przycina danych); brak wartości = `null`
- Identyfikatory wartości w ASCII (np. `typKlienta`: `nowy` / `staly`)
- Adres siedziby klienta: jeden aktywny `is_siedziba = 1`; przy złych danych
  API bierze adres o najniższym id

**Routing CakePHP — ważne zasady:**
- Używamy wzorca `*` zamiast `:id` (CakePHP 2.4 nie obsługuje named params w API)
- Id odczytujemy przez `$this->request->params['pass'][0]`
- Bardziej szczegółowe reguły muszą być PRZED ogólnymi w routes.php
- Wzorzec `*/coś` (dwa segmenty z gwiazdką) nie działa — używamy osobnych prefiksów,
  np. `/api/klienci-adresy/*` zamiast `/api/klienci/*/adresy`

**Zmiany w bazie danych:**
Stosujemy ręczne skrypty SQL przechowywane w `inne/migracje/` z nazwą
zawierającą nr (kolejność skryptów) i opis, np. `001_nowe_tabele_produkty_przesylki.sql`.
NIE używamy CakePHP Migrations plugin.

**Ważne: po dodaniu nowej kolumny w MySQL** wyczyść cache modeli CakePHP:
```
app/tmp/cache/models/*
app/tmp/cache/persistent/*
```

### Nowe tabele — utworzone (migracja 002_skp_migracja.sql)

```
card_templates        — przepis produkcji fizycznej karty (spec. a_*, r_*)
perso_templates       — przepis personalizacji karty
products              — fizyczny produkt w zamówieniu
product_perso         — powiązanie produktu z przepisami perso (hasMany through)
production_entries    — zdarzenia zejścia z produkcji fizycznej
perso_entries         — zdarzenia zakończenia personalizacji partii
shipments             — przesyłka (co, dokąd, jak)
shipment_items        — pozycje przesyłki (hasMany through)
shipment_packages     — informacja o pakowaniu przesyłki
package_types         — słownik rozmiarów paczek
couriers              — słownik firm kurierskich
customer_addresses    — książka adresowa klientów (zastępuje addresses dla nowych)
```

Stare tabele zmienione minimalnie:
```
orders  — dodane: type VARCHAR(20), parent_order_id (null), ui_version TINYINT
```

Szczegółowy opis logiki i scenariuszy: `skp-architektura-bazy.md`

### Relacje many-to-many w nowym kodzie

`shipment_items` i `product_perso` to tabele z dodatkowymi polami (`quantity`),
modelowane jako **hasMany through (The Join Model)** — nie przez HABTM.
Nazwy tabel łamią konwencję CakePHP świadomie (czytelność > konwencja),
obsługiwane przez `$useTable` w modelach.

### Routing SvelteKit — aktualne widoki

```
/zamowienia/nowe           → nowe zamówienie — pusty formularz, NIC nie tworzy w bazie
/zamowienia/[id]/edycja    → edycja istniejącego zamówienia
```

Jeden formularz dla obu tras — grupa tras `(formularz)` (nawias nie trafia do adresu):
```
src/routes/zamowienia/(formularz)/
  +layout.server.js        — nowe: pusty stan bez API; [id]: GET z API,
                             sprawdza uiVersion, redirect legacy
  +layout.svelte           — inicjalizuje stan zamówienia, sidebar z sekcjami, "Zapisz"
  nowe/+page.svelte        — <FormularzZamowienia />
  [id=liczba]/edycja/+page.svelte — <FormularzZamowienia />
src/params/liczba.js       — matcher: id w adresie musi być liczbą (inaczej 404)
src/lib/komponenty/zamowienie/FormularzZamowienia.svelte — treść formularza (sekcje)
```

**Zasada: GET nigdy nie tworzy rekordów.** Otwarcie adresu (także z historii,
zakładki, podglądu linku) nie może niczego zapisywać w bazie.

**Globalny layout:** `{#key page.params.id}` wokół treści — zmiana id w adresie
(inne zamówienie, Wstecz, nowe → zapisane) tworzy podstronę od nowa. Bez tego
SvelteKit używa ponownie komponentów i zostaje stan poprzedniego zamówienia.
Konsekwencja: nowa instancja powstaje PRZED zniszczeniem starej (Svelte 5) —
stąd `ustawKontekst()` sidebara zwraca funkcję czyszczącą tylko własny snippet.

Przyszły podgląd `/zamowienia/[id]` powstanie poza grupą `(formularz)` —
nie dziedziczy layoutu edycji.

**CORS na DEV:** `AppApiController::beforeFilter()` ustawia nagłówki CORS dla
`http://localhost:5173` — pozwala na fetch z przeglądarki. Na produkcji bez znaczenia
(ta sama domena). Fetche server-side (w `+layout.server.js`) nie potrzebują CORS —
idą bezpośrednio Node.js → CakePHP.

---

## Użytkownicy systemu

- Pracownicy biurowi (obsługa zamówień)
- Operatorzy produkcji
- Administratorzy / właściciel

---

## Obecny fokus

- Głównie: przyjmowanie i śledzenie zamówień od klientów
- Budowa 5–7 nowych widoków w SvelteKit (nowe funkcje,
  nie migracja starych)
- Drugoplanowo: zarządzanie produkcją (istnieje szczątkowo,
  rozwój w przyszłości)
- Docelowo: pełna migracja UI do SvelteKit + CakePHP jako samo API
  (długoterminowo)

---

## Jak ze mną pracować

- Pracuję sam (jeden developer)
- Pytaj o kontekst jeśli coś jest niejasne — projekt ma złożoną historię
- Przy kodzie backendowym: zawsze uwzględniaj ograniczenia
  PHP 5.6 i CakePHP 2.4
- Przy kodzie frontendowym: piszemy w SvelteKit — nie proponuj
  Alpine.js ani jQuery
- Komponenty UI budujemy z Tailwind Plus — przenosimy HTML
  komponentów do .svelte bez zmian
- Jeśli widzisz potencjalny problem z kompatybilnością — mów wprost
- Przy zmianach w kontrolerach CakePHP: minimalne, zachowawcze
  modyfikacje
- SvelteKit piszemy w czystym JavaScript (bez TypeScript) —
  nie używaj składni TS ani adnotacji typów
- Każdy nowy plik .svelte i .js ma komentarze wyjaśniające logikę
- Nie używamy $effect do synchronizacji stanu — używamy callbacków
- Świadomie ignorujemy ostrzeżenia a11y — aplikacja desktopowa
  dla pracowników biurowych
- Zawsze zwracaj uwagę gdy proponowane rozwiązanie jest hackiem
- Zmiany wprowadzamy krokami: jeden krok → sprawdzamy → następny
- W JavaScript zawsze używaj let/const, nigdy var
- Dane mockowe (gdyby były potrzebne) w `src/lib/api/` — obecnie brak
- Algorytmy biznesowe w `src/lib/algorytmy/`
- Procedura squash commitów przed push: `inne/git-squash-i-push.md`

---

## Widok dodawania/edycji zamówienia — ustalenia projektowe

### Koncepcja UX
- Układ z bocznym panelem nawigacyjnym (sidebar) + główny panel roboczy (PG) po prawej
- Boczny panel zawiera sekcje formularza — użytkownik przełącza się między nimi
- Tylko aktywna sekcja scrolluje wewnętrznie, nie cała strona
- Aplikacja działa wyłącznie na desktopach — nie optymalizujemy pod mobile
- Komponenty wizualne z Tailwind Plus (przenoszone do .svelte i modyfikowane)

### Strategia zapisu
- Zamówienie można zapisać w dowolnym momencie (nie dopiero po wypełnieniu wszystkiego)
- Zamówienie powstaje w bazie przy PIERWSZYM zapisie (wzorzec new/edit jak
  w Rails/Laravel/CakePHP add+edit) — samo otwarcie `/zamowienia/nowe` nic nie tworzy
- Po pierwszym zapisie: nawigacja na `/zamowienia/[id]/edycja` z zastąpieniem
  wpisu w historii (Post/Redirect/Get) — formularz buduje się od nowa z danych
  z bazy; aktywną sekcję przenosimy przez stan nawigacji
- NIE shallow routing (`replaceState` z `$app/navigation`) — SvelteKit zapamiętuje
  wtedy w historii pierwotny adres; Wstecz otworzyłby pusty formularz `nowe`
- Autosave tylko dla zamówień, które mają id; niezapisane nowe zamówienie
  chroni bufor localStorage + ostrzeżenie "niezapisane zmiany" przy wyjściu
- "Szkic" = zapisane zamówienie bez numeru; "Niezapisane" = jeszcze nie w bazie

### Sekcje formularza
- Sekcja 1: Klient i produkty
- Sekcja 2: Przesyłki
- Sekcja 3: TBD (placeholder w sidebarze)

### Routing
- `/zamowienia/nowe` — nowe zamówienie (pusty formularz, bez rekordu w bazie)
- `/zamowienia/[id]/edycja` — edycja istniejącego; ten sam formularz co nowe
- `/zamowienia/[id]` — podgląd (przyszłość, poza grupą `(formularz)`)
- Link „Nowe zamówienie” w sidebarze: pełne przeładowanie (`data-sveltekit-reload`) —
  zawsze czysty formularz, także gdy użytkownik już jest na `/zamowienia/nowe`

### Layout i sidebar
- Globalny `+layout.svelte` — sidebar dwustrefowy:
  - Strefa górna: kontekstowa (wstrzykiwana przez podstrony przez Context API)
  - Strefa dolna: stała nawigacja aplikacji
- Szerokość sidebara kontrolowana przez `--sidebar-width` w `app.css`
- Strefa górna wstrzykiwana przez snippet z `zamowienia/(formularz)/+layout.svelte`;
  `ustawKontekst(snippet)` zwraca funkcję czyszczącą (wywoływaną w `onDestroy`)
- Pozycje nawigacji: `disabled` (widok jeszcze nie istnieje — wyszarzone),
  `deprecated` (stara funkcja), `pelnePrzeladowanie` (link z `data-sveltekit-reload`)
- Kontener treści podstrony: `flex-1 overflow-hidden` (nie overflow-y-auto —
  scroll obsługiwany wewnętrznie przez każdą podstronę)

### Layout sekcji 1 — techniczne
- Zewnętrzny kontener sekcji: `flex h-full min-h-0 gap-4 p-6`
- Lewa kolumna (formularz): `flex min-h-0 ... flex-col gap-4 overflow-y-auto`
- `min-h-0` kluczowe dla poprawnego scrollowania w flex — bez tego
  przeglądarka nie pozwala elementowi skurczyć się poniżej naturalnej wysokości
- Prawa kolumna (produkty): własny scroll wewnętrzny, niezależny od lewej

### System motywów
- `src/theme-light.css` — zmienne CSS jasnego motywu (`:root {}`)
- `src/theme-dark.css` — zmienne CSS ciemnego motywu (`:root.dark {}`)
- Aktualnie wymuszony jasny motyw przez `color-scheme: light` w `app.css`
- Przełączenie na ciemny: dodaj `class="dark"` do `<html>` w `app.html`
- Przywrócenie reakcji na motyw OS: usuń `color-scheme: light` z `app.css`
  i zamień `:root.dark` na `@media (prefers-color-scheme: dark) { :root {} }`

### Stan zamówienia
- `src/lib/stany/zamowienie.svelte.js` — reaktywny stan zamówienia
- Udostępniany przez Context API (`setContext('zamowienie', ...)`)
- Context zawiera: `aktywnaSekcja()`, `dane()`, `zaktualizuj()`
- `zaktualizuj()` robi głęboki merge dla zagnieżdżonych obiektów
- Domyślna data realizacji: dziś + 10 dni roboczych (bez weekendów, bez świąt)
- Struktura produktu: `{ id, nazwa, ilosc, cena }` — cena jako number (JS)
- Nowe zamówienie: `id = null`; `typKlienta`: `'nowy'` / `'staly'` / `null`
- Oznaczenie przy tytule: „Niezapisane” (id = null), „Szkic” (brak numeru)

### Ikony
- Biblioteka: `@tabler/icons-svelte-runes` (oficjalny pakiet dla Svelte 5)
- Nie tworzymy własnych komponentów SVG dla ikon
- Użycie: `import { IconTrash } from '@tabler/icons-svelte-runes'`
- Domyślne propsy: `size={16} stroke={1.5}` — dostosowuj do kontekstu

### Konwencje UI — edycja inline
- Pola edytowalne inline: zawsze widoczne inputy, bez trybu podgląd/edycja
- Styl spoczynkowy: przezroczyste tło, brak obramowania
- Styl aktywny (focus): tło `input-bg` + subtelne obramowanie
- `onfocus={(e) => e.target.select()}` — zaznaczenie zawartości przy focusie
- Zapis przy `onblur` dla pól wymagających walidacji (ilość, cena)
- Zapis przy `oninput` dla pól tekstowych bez walidacji (nazwa)

### Konwencje UI — liczby i ceny
- Frontend jest oddzielony od formatu danych backendu — konwersja po stronie backendu
- Cena przechowywana w stanie jako `number` (JS), np. `2.69`
- Cena wyświetlana i edytowana jako string z przecinkiem, np. `2,69`
- Konwersja string→number przy `onblur` przez `parsujCene()`
- Format wyświetlania: min 2, max 4 miejsca po przecinku
- Ilość: `type="text"` z walidacją `parseInt(...) || 1` przy `onblur`
- Nieprawidłowe wartości korygowane automatycznie przy utracie focusu

### Konwencje komponentów
- Komponenty "inteligentne" znają stan zamówienia (przez context lub props)
- Komponenty "czyste" komunikują zmiany wyłącznie przez callbacki
- Przykład: `ListaProduktow` (inteligentny) → `WierszProduktu` (czysty)
- Tymczasowe id dla nowych rekordów: ujemne liczby całkowite
  (nie kolidują z id z bazy, zastępowane przez API po zapisie)
- Zmiana klienta resetuje powiązane pola (np. typKlienta → null)
- Logika wyboru klienta w nazwanej funkcji `handleWyborKlienta()` w `FormularzZamowienia.svelte`
  (nie jako anonymous function inline w atrybucie komponentu)

### Komponenty

```
src/lib/komponenty/
  Przycisk.svelte             — uniwersalny przycisk; warianty: primary/secondary/danger;
                                rozmiary: sm/md/lg; prop klasa dla dodatkowych klas CSS
  Toggle.svelte               — uniwersalny toggle, prop kolorAktywny (CSS var)
  WyborOpcji.svelte           — uniwersalny wybór opcji (radio buttons)
  WyborKlienta.svelte         — Command Palette wyszukiwania klienta; live search
                                do API z debounce 300ms; po wyborze pobiera adresy
                                klienta przez GET /api/klienci-adresy/:id
  DevPanel.svelte             — podgląd stanu zamówienia (JSON); usunąć przed produkcją
  zamowienie/
    FormularzZamowienia.svelte — treść formularza (sekcje); używany przez
                                /zamowienia/nowe i /zamowienia/[id]/edycja
    KartaKlienta.svelte       — panel klienta + otwiera modal wyboru;
                                cały obszar klikalny (div z role="button");
                                do 6 linii: nazwa, pełna nazwa, ulica, kod/miasto/kraj,
                                VAT, „Opiekun: <imię>” (pogrubione);
                                typ klienta (nowy/stały) w prawym dolnym rogu
                                przez WyborOpcji (absolutnie pozycjonowany)
    WyborAdresu.svelte        — modal wyboru adresu dostawy z książki adresowej;
                                lista od razu widoczna, filtry typów jako pill-buttony.
                                ZNANY BŁĄD: filtry czytają pole `typ` (format mock),
                                API zwraca flagi isWysylka/isFaktura/isSiedziba
    MetadaneZamowienia.svelte — data realizacji, ekspresowe (toggle)
    Platnosci.svelte          — logika płatności (przedpłata + płatność po)
    NotatkaZamowienia.svelte  — taby: "Dane do faktury" / "Uwagi";
                                textarea wypełnia dostępną przestrzeń, scrolluje
    ListaProduktow.svelte     — lista produktów z dodawaniem (Enter lub przycisk)
                                i usuwaniem; zarządza lokalną kopią listy
    WierszProduktu.svelte     — jeden wiersz tabeli: nazwa, ilość, cena, kosz;
                                edycja inline, konwersja ceny, walidacja ilości;
                                Tab z ilości→cena→ilość następnego wiersza (Enter też);
                                czysty komponent (tylko callbacki)
    przesylki/
      SekcjaPrzesylki.svelte  — główny komponent sekcji przesyłek; zarządza listą
                                przesyłek, aktywną przesyłką, panelem szczegółów
      TabelaPrzesylek.svelte  — tabela krzyżowa produkty×przesyłki; edycja inline;
                                sticky nagłówki z tłem (bg-gray-50)
      SzczegolyPrzesylki.svelte — panel szczegółów przesyłki; absolutnie pozycjonowany;
                                dwa stany wysokości (--szczegoly-przesylki-h / -duze);
                                ResizeObserver do obliczania pozycji
      TabDostawa.svelte       — tab dostawy: typ, kurier, adres, lista "Co jedzie";
                                kosz przy produkcie usuwa pozycję lub całą przesyłkę
                                gdy ostatni produkt w jedynej przesyłce
      TabPakowanieUwagi.svelte — tab pakowania: dwie kolumny (kontrolki | tabela paczek);
                                tryb paczek i tryb palet (toggle); przyciski Przelicz
                                i Nie mieszaj; suma na żywo z informacją o różnicy
```

### Wybór klienta
- Command Palette (modal) otwierany kliknięciem w kartę klienta
- Live search do CakePHP API z debounce 300ms (min. 2 znaki)
- Adresy klienta pobierane jednorazowo po wyborze (nie przy wyszukiwaniu)
- Zamykanie przez Escape lub kliknięcie backdropu
- Możliwość zmiany klienta w dowolnym momencie
- Zmiana klienta resetuje typKlienta do null

### Przesyłki
- Produkty z zamówienia można rozbić na wiele przesyłek
- Każda przesyłka: co + dokąd (adres) + ile
- Adresy pochodzą z książki adresowej klienta (`customer_addresses`)
- Nowy adres dodany przy zamówieniu trafia do książki adresowej klienta
- Przesyłka nie jest bezpośrednio powiązana z zamówieniem — jest powiązana
  z produktami (dzięki temu jedna przesyłka może zawierać produkty z różnych zamówień)
- Typy przesyłek: kurier / magazyn / odbior / kurier_klienta
- Zakładka "Przesyłki" jest zawsze dostępna — ostrzeżenie tylko gdy produkt
  wymaga perso ale nie ma jeszcze zdefiniowanych przepisów perso

### Pakowanie przesyłek

- Algorytmy w `src/lib/algorytmy/pakowanie.js`
- `obliczPakowanie(produkty, rozmiary)` — przycisk "Przelicz":
  krok 1: pakuje całą sumę zachłannie (minimalna liczba paczek);
  krok 2: pakuje per produkt — jeśli nie zwiększa liczby paczek, preferuje
  (nie miesza produktów); preferuje równe paczki gdy nie zwiększa ich liczby
- `pakujNieMieszaj(produkty, rozmiary)` — przycisk "Nie mieszaj":
  pakuje każdy produkt osobno; jeśli produkt ≤ największy rozmiar standardowy
  i baseline > 1 paczka — używa jednej niestandardowej paczki
- Rozmiary standardowych paczek docelowo z API; na razie `DOMYSLNE_ROZMIARY = [5000, 3000, 2000, 1000]`
- Paczka niestandardowa nigdy nie może być większa niż największy rozmiar standardowy
- "Nie mieszaj" wpisuje notatkę do uwag przesyłki (prepend); "Przelicz" usuwa tę notatkę
- Struktura przesyłki w stanie: `{ id, nazwa, typDostawy, adres, kurier, uwagi, palety, pakowanie, pozycje }`
  gdzie `pakowanie: [{ pojemnosc, ilosc, niestandardowa }]`

### Nawigacja w aplikacji
- Nowe widoki SvelteKit żyją pod /app/ obok starego CakePHP
- Projektujemy tak by nie blokować późniejszej pełnej migracji UI do SvelteKit

---

## Stan na dziś (wrzesień 2026)

### Co działa
- `GET /api/zamowienia/:id` — pełne dane zamówienia; klient w tym samym formacie
  co w wyszukiwarce (z opiekunem i adresami); zwraca `uiVersion` jako int
- `GET /api/klienci/szukaj?fraza=...` — zgodne z `ONLY_FULL_GROUP_BY`,
  deterministyczny wybór siedziby, opiekun, czyszczenie tekstów
- `GET /api/klienci-adresy/:id` — adresy w formacie wspólnym (`kod`, `vatKraj`, `kraj`)
- `POST /api/zamowienia/dodaj` — istnieje w backendzie, NIEUŻYWANY przez nowy UI
  (do usunięcia przy budowie zapisu)
- `/zamowienia/nowe` — pusty formularz bez rekordu w bazie
- `/zamowienia/[id]/edycja` — edycja istniejącego; redirect legacy dla `ui_version != 2`
- Świeży stan przy przejściu między zamówieniami (`{#key}` w globalnym layoucie)
- `KartaKlienta` — pełne dane klienta + opiekun; typ klienta zgodny z API
- `src/lib/config.js` — eksportuje `BACKEND_URL` z `VITE_BACKEND_URL`
- „Zapisz zamówienie” — przycisk bez działania; nowego zamówienia nie da się
  jeszcze utworzyć (do testów: istniejące rekordy z `ui_version = 2`)

### Migracje wykonane na DEV
- `001_system-uprawnien.sql` — system uprawnień
- `002_skp_migracja.sql` — nowe tabele
- `003_orders_nullable_pola_klienta_i_adresow.sql` — pola klienta i adresów
  w orders nullable (zamówienie może istnieć bez klienta)
- `004_migracja_adresow.sql` v1.4 — adresy z customer_addresses, fallback is_default,
  poprawna obsługa braku NIP/VAT (vatno = same zera lub vatno_txt = 'BRAK')
- `005_orders_platnosci_i_dane_do_faktury.sql` — nowe pola płatności w orders,
  pole palety w shipments, dane słownikowe w package_types
- `006_orders_ui_version.sql` — pole ui_version w orders (DEFAULT 1 = stary UI, 2 = nowy UI)
- `007_indeksy_wyszukiwanie_klientow.sql` — indeksy na customers i customer_addresses;
  czas wyszukiwania z 6300ms → 35ms
- Sprawdzone na produkcji: brak dat `0000-00-00` jako wartości domyślnych kolumn
  i w `addresses` (migracja 004 i ALTER TABLE bezpieczne pod tym względem)

### Do zrobienia (aktywna praca)
- **Zapis zamówienia** — endpoint tworzący/aktualizujący, mapowanie ujemnych id,
  przejście `nowe` → `/zamowienia/[id]/edycja`, numer i szkic
- **Ochrona pracy** — ostrzeżenie o niezapisanych zmianach, bufor localStorage,
  autosave dla zapisanych zamówień (z retry)
- **Przesyłki** — omówienie całej sekcji; m.in. filtry typów w `WyborAdresu`,
  `typDostawy` `odbior_osobisty` (front) vs `odbior` (baza), kurierzy i paczki
  ze słowników API, potwierdzenie usunięcia przesyłki
- `WyborKlienta.svelte` — filtr po handlowcu (opiekunie)
- Obsługa adresów w UI — zapis nowego adresu do książki adresowej
- Wdrożenie — adapter-node, base `/app`, osobny adres backendu dla fetchy
  server-side (pusty `BACKEND_URL` nie zadziała w Node), próba generalna
  migracji na zrzucie produkcji
- Autoryzacja w `*ApiController` — weryfikacja uprawnień (przy wdrożeniu na produkcję)
- Stary UI (na końcu migracji) — link „Edytuj” wg `ui_version`, „Dodaj” →
  `/app/zamowienia/nowe`, ukrycie artefaktów nowego UI
- Sprzątanie pustych zamówień `ui_version = 2` powstałych na DEV przez dawne `dodaj`
- Dokumentacja podziału kontroler/serwis/model w `inne/api-dokumentacja.md`
- Sekcja „Podsumowanie” — na końcu
