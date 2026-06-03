## Projekt: SKP — System zarządzania zamówieniami (plastikowe karty)

Aplikacja biznesowa z 11-letnią historią. Prowadź rozmowy po polsku
(angielski OK jeśli wygodniejszy w danym kontekście, np. nazwy
techniczne, fragmenty kodu).

---

## Stack technologiczny

**Backend:**
- CakePHP 2.4.x (NIE 3.x/4.x/5.x — stara architektura, inne konwencje)
- PHP 5.6 (NIE używaj składni PHP 7/8: brak match, named arguments,
  readonly, ??=, typed properties, union types itp.)
- MySQL 5.7

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
- Claude Code (rozszerzenie VS Code) — do bezpośredniej pracy
  z plikami projektu
- Czat webowy claude.ai (projekt SKP) — do planowania, architektury,
  omawiania problemów

**CakePHP (przez DDEV):**
- Adres lokalny: https://skp2x.ddev.site
- PHP 5.6, MySQL 5.7 skonfigurowane w DDEV

**SvelteKit:**
- Osobny projekt poza DDEV — uruchamiany natywnie na Fedorze
- Nazwa projektu: skp-frontend
- Dev server: npm run dev → localhost:5173
- Fetch API kierowany na https://skp2x.ddev.site

**Serwer produkcyjny:**
- Apache, wewnętrzna sieć LAN, pseudo-domena skp.lan (plik hosts)
- Brak HTTPS (sieć wewnętrzna)
- CakePHP na skp.lan, SvelteKit docelowo na skp.lan/app/

---

## Architektura

**Aktywne obszary backendu:**
- app/Controller/ — nowe akcje API (JSON), minimalne i punktowe zmiany
- Nie refaktoryzuj otaczającego kodu jeśli nie zostanę o to poproszony

**Nieaktywne obszary (nie sugeruj zmian):**
- Reszta projektu działa stabilnie — traktuj jako "czytaj tylko"

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
- Zamówienie istnieje w bazie od początku jako szkic (draft)

### Sekcje formularza
- Sekcja 1: Klient i produkty
- Sekcja 2: Przesyłki
- Sekcja 3: TBD (placeholder w sidebarze)

### Routing
- `/app/zamowienia` — lista zamówień
- `/app/zamowienia/[id]/edycja` — jedyny widok edycji (nowe i istniejące)
- `/app/zamowienia/[id]` — podgląd (przyszłość)
- Nowe zamówienie: POST do backendu → tworzy pusty rekord → redirect do edycji

### Layout i sidebar
- Globalny `+layout.svelte` — sidebar dwustrefowy:
  - Strefa górna: kontekstowa (wstrzykiwana przez podstrony przez Context API)
  - Strefa dolna: stała nawigacja aplikacji
- Szerokość sidebara kontrolowana przez `--sidebar-width` w `app.css`
- Strefa górna wstrzykiwana przez snippet z `[id]/+layout.svelte`
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

### Komponenty

src/lib/komponenty/
  Toggle.svelte               — uniwersalny toggle, prop kolorAktywny (CSS var)
  WyborOpcji.svelte           — uniwersalny wybór opcji (radio buttons)
  zamowienie/
    KartaKlienta.svelte       — panel klienta + otwiera modal wyboru;
                                cały obszar klikalny (div z role="button");
                                typ klienta (nowy/stały) w prawym dolnym rogu
                                przez WyborOpcji (absolutnie pozycjonowany)
    WyborKlienta.svelte       — Command Palette wyszukiwania klienta (mock→API)
    MetadaneZamowienia.svelte — data realizacji, ekspresowe (toggle)
    Platnosci.svelte          — logika płatności (przedpłata + płatność po)
    NotatkaZamowienia.svelte  — taby: "Dane do faktury" / "Uwagi";
                                textarea z auto-resize (rośnie z treścią)
    ListaProduktow.svelte     — lista produktów z dodawaniem (Enter lub przycisk)
                                i usuwaniem; zarządza lokalną kopią listy
    WierszProduktu.svelte     — jeden wiersz tabeli: nazwa, ilość, cena, kosz;
                                edycja inline, konwersja ceny, walidacja ilości;
                                czysty komponent (tylko callbacki)

### Wybór klienta
- Command Palette (modal) otwierany kliknięciem w kartę klienta
- Live search do CakePHP API (na razie mock)
- Zamykanie przez Escape lub kliknięcie backdropu
- Możliwość zmiany klienta w dowolnym momencie
- Zmiana klienta resetuje typKlienta do null

### Przesyłki
- Produkty z zamówienia można rozbić na wiele przesyłek
- Każda przesyłka: co + dokąd (adres) + ile
- Adresy pochodzą z książki adresowej klienta
- Nowy adres dodany przy zamówieniu trafia do książki adresowej klienta

### Nawigacja w aplikacji
- Nowe widoki SvelteKit żyją pod /app/ obok starego CakePHP
- Projektujemy tak by nie blokować późniejszej pełnej migracji UI do SvelteKit