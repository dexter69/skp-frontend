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

**Backend (osobny projekt, nie edytujemy tu):**
- CakePHP 2.4.x / PHP 5.6 / MySQL 5.7
- Lokalnie: https://skp2x.ddev.site (DDEV)
- Produkcja: skp.lan

---

## Komunikacja z backendem

Proxy Vite przekierowuje `/api/...` → `https://skp2x.ddev.site/...` (prefix /api jest usuwany).

Przykład:
```javascript
fetch('/api/customers/getPlaces/12.json', { credentials: 'include' })
// trafia do CakePHP jako: /customers/getPlaces/12.json
```

Zawsze używaj `credentials: 'include'` — sesja PHP musi być przekazywana.

Endpointy CakePHP zwracają JSON przez końcówkę `.json`:
```
/kontroler/akcja.json
/kontroler/akcja/parametr.json
```

---

## Autoryzacja

Wszystkie widoki wymagają zalogowania. Brak aktywnej sesji PHP → przekierowanie
na stronę logowania CakePHP:

```javascript
window.location.href = 'https://skp2x.ddev.site/users/login';
```

Na produkcji adres logowania to: `http://skp.lan/users/login`

Użytkownik loguje się raz przez przeglądarkę na skp2x.ddev.site — ciasteczko
sesji PHP (PHPSESSID) jest potem automatycznie przekazywane przez proxy.

---

## Konwencje kodu

**Svelte 5 — używamy run (nowa składnia):**
```javascript
let count = $state(0);
let { children } = $props();
let double = $derived(count * 2);
```

**Nie używamy starej składni Svelte 4:**
```javascript
// ŹLE:
export let value;
$: doubled = value * 2;
```

**JavaScript, nie TypeScript:**
- Żadnych adnotacji typów
- Żadnych interfejsów ani `type`/`interface`
- jsconfig.json jest obecny (dla IntelliSense), ale to nie TypeScript

**Obsługa eventów (Svelte 5):**
```svelte
<button onclick={() => doSomething()}>Kliknij</button>
```

---

## Struktura projektu

```
src/
├── app.css              ← import Tailwind + @theme z custom kolorami
├── theme-colors.css     ← CSS variables (jasny i ciemny motyw, oklch)
├── app.html             ← szkielet HTML (nie edytujemy bez potrzeby)
├── lib/                 ← komponenty wielokrotnego użytku, helpery
│   └── assets/
└── routes/
    ├── +layout.svelte   ← globalny layout z topbarem
    └── +page.svelte     ← strona główna (/)
```

Routing: struktura folderów w `src/routes/` = URL-e aplikacji.

---

## System kolorów

Kolory zdefiniowane jako CSS variables w `theme-colors.css`, zmapowane
na klasy Tailwind w `app.css` przez `@theme`. Obsługuje jasny i ciemny motyw
przez `@media (prefers-color-scheme: dark)`.

Przykładowe klasy:
- `bg-nav-bg`, `text-text-on-dark` — nawigacja
- `bg-bg-primary`, `bg-bg-secondary` — tła
- `text-text-primary`, `text-text-muted` — teksty
- `bg-accent`, `hover:bg-accent-hover` — akcenty (niebieski)
- `bg-error-bg`, `text-error-text`, `border-error-border` — błędy
- `bg-success-bg`, `text-success-text` — sukces
- `bg-warning-bg`, `text-warning-text` — ostrzeżenia

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

## Widok dodawania/edycji zamówienia — ustalenia projektowe

### Koncepcja UX
- Układ z bocznym panelem nawigacyjnym (sidebar) + główny panel roboczy po prawej
- Boczny panel zawiera sekcje formularza — użytkownik przełącza się między nimi
- Tylko aktywna sekcja scrolluje wewnętrznie, nie cała strona
- Aplikacja działa wyłącznie na desktopach — nie optymalizujemy pod mobile
- Komponenty wizualne z Tailwind Plus (przenoszone do .svelte i modyfikowane)

### Strategia zapisu
- Zamówienie można zapisać w dowolnym momencie (nie dopiero po wypełnieniu wszystkiego)
- Zamówienie istnieje w bazie od początku jako szkic (draft)

### Sekcje formularza
- 3 sekcje (do ustalenia w trakcie implementacji)

### Wybór klienta
- Pole autocomplete z live search do CakePHP API
- Możliwość zmiany klienta w dowolnym momencie (także przy edycji zamówienia)

### Przesyłki
- Produkty z zamówienia można rozbić na wiele przesyłek
- Każda przesyłka: co + dokąd (adres) + ile
- Adresy pochodzą z książki adresowej klienta
- Nowy adres dodany przy zamówieniu trafia do książki adresowej klienta

### Nawigacja w aplikacji
- Nowe widoki SvelteKit żyją pod /app/ obok starego CakePHP
- Projektujemy tak by nie blokować późniejszej pełnej migracji UI do SvelteKit

## System motywów

Aktualnie aplikacja używa **wymuszonego jasnego motywu** niezależnie od OS.

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
3. Dodaj przycisk który toggleuje klasę `dark` na elemencie `<html>` przez `document.documentElement.classList.toggle('dark')`
