// src/routes/zamowienia/(formularz)/+layout.server.js
// Dane dla formularza zamówienia — wspólne dla dwóch tras:
//   /zamowienia/nowe          — nowe zamówienie, jeszcze nieistniejące w bazie
//   /zamowienia/[id]/edycja   — istniejące zamówienie, pobierane z API
//
// (formularz) to grupa tras — nawias nie trafia do adresu, a obie trasy
// dzielą ten load() i +layout.svelte (jeden formularz dla nowego i edycji).
//
// Nowe zamówienie powstaje w bazie dopiero przy pierwszym zapisie.
// Samo otwarcie /zamowienia/nowe niczego nie tworzy — to zwykły GET bez skutków
// ubocznych, więc można go bezpiecznie otworzyć z historii, zakładki czy podglądu linku.
//
// Jedyne miejsce pobierania zamówienia — +layout.svelte inicjalizuje z tych danych
// stan zamówienia, a formularz czyta go z kontekstu.
// Tu też pobieramy słowniki (kurierzy, rozmiary paczek — GET /api/slowniki),
// równolegle z zamówieniem; layout udostępnia je przez kontekst 'slowniki'.
// Używamy .server.js (nie .js) bo potrzebujemy dostępu do cookies
// żeby przekazać sesję PHP do CakePHP (komunikacja Node.js → CakePHP).

import { error, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/config.js';

export async function load({ params, cookies }) {
    const sesja = cookies.get('CAKEPHP');
    const naglowki = { 'Cookie': `CAKEPHP=${sesja}` };

    // Słowniki potrzebne w obu trasach — start pobierania od razu,
    // żeby szło równolegle z zamówieniem (await dopiero przy zwracaniu).
    const slownikiObietnica = pobierzSlowniki(naglowki);

    // /zamowienia/nowe nie ma parametru id → pusty stan zamówienia.
    // Wartości domyślne (np. data realizacji) ustawia tworzStanZamowienia().
    if (params.id === undefined) {
        return { zamowienie: {}, slowniki: await slownikiObietnica };
    }

    const id = params.id;

    const response = await fetch(`${BACKEND_URL}/api/zamowienia/${id}`, {
        method: 'GET',
        headers: naglowki
    });

    const data = await response.json();

    if (!data.success) {
        throw error(data.code === 404 ? 404 : 500, data.error);
    }

    if (data.data.uiVersion !== 2) {
        throw redirect(302, `${BACKEND_URL}/orders/edit/${id}`);
    }

    return {
        zamowienie: data.data,
        slowniki: await slownikiObietnica
    };
}

// Słowniki formularza: aktywni kurierzy i rozmiary paczek.
// Błąd słowników NIE blokuje formularza — zwracamy puste listy:
// lista kurierów będzie pusta, a pakowanie użyje rozmiarów domyślnych
// (DOMYSLNE_ROZMIARY w $lib/algorytmy/pakowanie.js). Błąd trafia do logu serwera.
// Funkcja nigdy nie rzuca wyjątku — dlatego obietnicę można bezpiecznie
// zacząć przed pobraniem zamówienia (które może skończyć się błędem/przekierowaniem).
async function pobierzSlowniki(naglowki) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/slowniki`, {
            method: 'GET',
            headers: naglowki
        });
        const data = await response.json();
        if (data.success) {
            return data.data;
        }
        console.error('Słowniki: API zwróciło błąd:', data.error);
    } catch (e) {
        console.error('Słowniki: nie udało się pobrać:', e.message);
    }
    return { kurierzy: [], rozmiaryPaczek: [] };
}