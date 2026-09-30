// src/routes/zamowienia/[id]/+layout.server.js
// Ładuje dane zamówienia z CakePHP API przed renderowaniem layoutu.
// Jedyne miejsce pobierania zamówienia — +layout.svelte inicjalizuje z tych danych
// stan zamówienia, a podstrony (np. edycja) czytają go z kontekstu.
// Używamy .server.js (nie .js) bo potrzebujemy dostępu do cookies
// żeby przekazać sesję PHP do CakePHP (komunikacja Node.js → CakePHP).

import { error, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/config.js';

export async function load({ params, cookies }) {
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