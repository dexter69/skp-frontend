# SKP Frontend — kontekst projektu dla Claude Code

## Czym jest SKP
System zarządzania zamówieniami na plastikowe karty. Aplikacja biznesowa
z 11-letnią historią. Nowy frontend (ten projekt) to osobna aplikacja SvelteKit
komunikująca się z istniejącym backendem CakePHP przez JSON API.

---

## Stack technologiczny

**Ten projekt (frontend):**
- SvelteKit z Svelte 5 — czysty JavaScript, zero TypeScript
- TailwindCSS 4.x (przez @tailwindcss/vite, bez tailwind.config.js)
- Tailwind Plus — gotowe komponenty HTML przenoszone do .svelte
- Font Inter z rsms.me/inter/inter.css
- @tabler/icons-svelte-runes — ikony (oficjalny pakiet dla Svelte 5)

**Backend (osobny projekt, nie edytujemy tu):**
- CakePHP 2.4.x / PHP 5.6 / MySQL 5.7
- Lokalnie: https://skp2x.ddev.site (DDEV)
- Produkcja: skp.lan

---

## Komunikacja z backendem

Proxy Vite przekierowuje `/api/...` → `https://skp2x.ddev.site/...` (prefix /api jest usuwany).

Przykład:
fetch('/api/customers/getPlaces/12.json', { credentials: 'include' })
// trafia do CakePHP jako: /customers/getPlaces/12.json

Zawsze używaj `credentials: 'include'` — sesja PHP musi być przekazywana.

Endpointy CakePHP zwracają JSON przez końcówkę `.json`:
/kontroler/akcja.json
/kontroler/akcja/parametr.json

---

## Autoryzacja

Wszystkie widoki wymagają zalogowania. Brak aktywnej sesji PHP → przekierowanie
na stronę logowania CakePHP:

window.location.href = 'https://skp2x.ddev.site/users/login';

Na produkcji adres logowania to: http://skp.lan/users/login

Użytkownik loguje się raz przez przeglądarkę na skp2x.ddev.site — ciasteczko
sesji PHP (PHPSESSID) jest potem automatycznie przekazywane przez proxy.

---

## Konwencje kodu

**Svelte 5 — używamy runes (nowa składnia):**
let count = $state(0);
let { children } = $props();
let double = $derived(count * 2);

**Nie używamy starej składni Svelte 4:**
// ŹLE:
export let value;
$: doubled = value * 2;

**JavaScript, nie TypeScript:**
- Żadnych adnotacji typów
- Żadnych interfejsów ani `type`/`interface`
- jsconfig.json jest obecny (dla IntelliSense), ale to nie TypeScript

**Obsługa eventów (Svelte 5):**
<button onclick={() => doSomething()}>Kliknij</button>

**Nazewnictwo:**
- Zmienne, funkcje, komponenty — po polsku
- Każdy plik .svelte i .js ma komentarze wyjaśniające logikę
- Nie używamy $effect do synchronizacji stanu — używamy callbacków (onZmiana)
- Świadomie ignorujemy ostrzeżenia a11y — aplikacja desktopowa dla pracowników biurowych
- Zawsze zaznaczaj gdy proponowane rozwiązanie jest hackiem
- Zmiany wprowadzamy krokami: jeden krok → sprawdzamy → następny

---

## Ikony

Używamy wyłącznie @tabler/icons-svelte-runes. Nie tworzymy własnych komponentów SVG.

import { IconTrash } from '@tabler/icons-svelte-runes';
<IconTrash size={16} stroke={1.5} />

Domyślne propsy: size={16} stroke={1.5} — dostosowuj do kontekstu.

---

## Struktura projektu

src/
├── app.css              ← import Tailwind + @theme z custom kolorami
├── theme-light.css      ← CSS variables jasnego motywu (:root {})
├── theme-dark.css       ← CSS variables ciemnego motywu (:root.dark {})
├── app.html             ← szkielet HTML (nie edytujemy bez potrzeby)
├── lib/
│   ├── stany/
│   │   └── zamowienie.svelte.js  ← reaktywny stan zamówienia
│   └── komponenty/
│       ├── Toggle.svelte          ← uniwersalny toggle
│       ├── WyborOpcji.svelte      ← uniwersalny wybór opcji (radio buttons)
│       └── zamowienie/
│           ├── KartaKlienta.svelte       ← panel klienta, otwiera modal
│           ├── WyborKlienta.svelte       ← Command Palette wyboru klienta
│           ├── MetadaneZamowienia.svelte ← data realizacji, ekspresowe
│           ├── Platnosci.svelte          ← przedpłata + płatność po
│           ├── NotatkaZamowienia.svelte  ← taby: dane do faktury / uwagi
│           ├── ListaProduktow.svelte     ← lista produktów z dodawaniem
│           └── WierszProduktu.svelte     ← jeden wiersz tabeli produktów
└── routes/
    ├── +layout.svelte             ← globalny layout z sidebarem
    ├── +page.svelte               ← strona główna (/)
    └── zamowienia/
        └── [id]/
            ├── +layout.svelte     ← layout zamówienia, stan, Context API
            └── edycja/
                └── +page.svelte   ← widok edycji zamówienia

Routing: struktura folderów w `src/routes/` = URL-e aplikacji.

---

## System kolorów

Kolory zdefiniowane jako CSS variables, zmapowane na klasy Tailwind w `app.css`
przez `@theme`. Dwa pliki motywów — jasny i ciemny.

Przykładowe klasy:
- `bg-nav-bg`, `text-text-on-dark` — nawigacja
- `bg-bg-primary`, `bg-bg-secondary` — tła
- `text-text-primary`, `text-text-muted` — teksty
- `bg-accent`, `hover:bg-accent-hover` — akcenty (niebieski)
- `bg-error-bg`, `text-error-text`, `border-error-border` — błędy
- `bg-success-bg`, `text-success-text` — sukces
- `bg-warning-bg`, `text-warning-text` — ostrzeżenia
- `bg-input-bg`, `text-input-text`, `outline-input-border` — pola formularzy

---

## System motywów

Aktualnie aplikacja używa wymuszonego jasnego motywu niezależnie od OS.

### Pliki
- `src/theme-light.css` — zmienne CSS dla jasnego motywu (`:root { }`)
- `src/theme-dark.css` — zmienne CSS dla ciemnego motywu (`:root.dark { }`)
- `src/app.css` — importuje oba pliki + wymusza jasny motyw przez `color-scheme: light` w `@layer base`

### Jak przywrócić reakcję na motyw OS
1. W `app.css` usuń `color-scheme: light` z `@layer base`
2. W `theme-dark.css` zamień `:root.dark` na `@media (prefers-color-scheme: dark) { :root { } }`

### Jak dodać przełącznik w UI
1. Zostaw `theme-dark.css` z `:root.dark`
2. Usuń `color-scheme: light` z `app.css`
3. Dodaj przycisk który toggleuje klasę `dark` na `<html>` przez
   `document.documentElement.classList.toggle('dark')`

---

## Użytkownicy systemu

- Pracownicy biurowi (obsługa zamówień)
- Operatorzy produkcji
- Administratorzy / właściciel

---

## Czego nie robimy w tym projekcie

- Nie używamy TypeScript ani adnotacji typów
- Nie używamy Alpine.js ani jQuery
- Nie migrujemy starych widoków CakePHP (chyba że wyraźnie zlecone)
- Nie edytujemy plików backendu CakePHP (chyba że wyraźnie zlecone)
- Nie tworzymy osobnej strony logowania — redirect na CakePHP
- Nie używamy $effect do synchronizacji stanu
- Nie tworzymy własnych komponentów SVG dla ikon — używamy @tabler/icons-svelte-runes

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

### Stan zamówienia
- `src/lib/stany/zamowienie.svelte.js` — reaktywny stan zamówienia
- Udostępniany przez Context API (`setContext('zamowienie', ...)`)
- Context zawiera: `aktywnaSekcja()`, `dane()`, `zaktualizuj()`
- `zaktualizuj()` robi głęboki merge dla zagnieżdżonych obiektów
- Domyślna data realizacji: dziś + 10 dni roboczych (bez weekendów, święta ignorowane)
- Struktura produktu: `{ id, nazwa, ilosc, cena }` — cena jako number (JS)

### Konwencje UI — edycja inline
- Pola edytowalne inline: zawsze widoczne inputy, bez trybu podgląd/edycja
- Styl spoczynkowy: przezroczyste tło, brak obramowania
- Styl aktywny (focus): tło `input-bg` + subtelne obramowanie
- `onfocus={(e) => e.target.select()}` — zaznaczenie zawartości przy focusie
- Zapis przy `onblur` dla pól wymagających walidacji (ilość, cena)
- Zapis przy `oninput` dla pól tekstowych bez walidacji (nazwa)

### Konwencje UI — liczby i ceny
- Frontend oddzielony od formatu backendu — konwersja formatów po stronie backendu
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

### Wybór klienta
- Command Palette (modal) otwierany kliknięciem w kartę klienta
- Cały obszar karty klikalny (div z role="button" + tabindex="-1")
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