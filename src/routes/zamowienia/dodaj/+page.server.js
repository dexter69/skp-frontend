// Tworzy nowe zamówienie przez API i przekierowuje do widoku edycji.
// Działa server-side — redirect następuje zanim przeglądarka cokolwiek wyrenderuje.
import { redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/config.js';

export async function load({ cookies }) {
    const sesja = cookies.get('CAKEPHP');

    const response = await fetch(`${BACKEND_URL}/api/zamowienia/dodaj`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `CAKEPHP=${sesja}`
        },
        body: JSON.stringify({})
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error('Nie udało się utworzyć zamówienia');
    }

    throw redirect(302, `/zamowienia/${data.data.id}/edycja`);
}