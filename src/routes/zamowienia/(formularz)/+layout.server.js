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
// Używamy .server.js (nie .js) bo potrzebujemy dostępu do cookies
// żeby przekazać sesję PHP do CakePHP (komunikacja Node.js → CakePHP).

import { error, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/config.js';

export async function load({ params, cookies }) {
    // /zamowienia/nowe nie ma parametru id → pusty stan, bez odpytywania API.
    // Wartości domyślne (np. data realizacji) ustawia tworzStanZamowienia().
    if (params.id === undefined) {
        return { zamowienie: {} };
    }

    const sesja = cookies.get('CAKEPHP');
    const id = params.id;

    const response = await fetch(`${BACKEND_URL}/api/zamowienia/${id}`, {
        method: 'GET',
        headers: {
            'Cookie': `CAKEPHP=${sesja}`
        }
    });

    const data = await response.json();

    if (!data.success) {
        throw error(data.code === 404 ? 404 : 500, data.error);
    }

    if (data.data.uiVersion !== 2) {
        throw redirect(302, `${BACKEND_URL}/orders/edit/${id}`);
    }

    return {
        zamowienie: data.data
    };
}