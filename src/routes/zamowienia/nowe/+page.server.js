// Tworzy nowe zamówienie przez API i przekierowuje do widoku edycji.
// Działa server-side — redirect następuje zanim przeglądarka cokolwiek wyrenderuje.
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sesja = cookies.get('CAKEPHP');

    const response = await fetch('http://skp2x.ddev.site/api/zamowienia/dodaj', {
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