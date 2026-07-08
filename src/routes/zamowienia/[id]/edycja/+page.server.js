// Pobiera dane zamówienia z API i przekazuje do komponentu strony.
// Działa server-side — dane są dostępne w +page.svelte przez props.data.
import { error } from '@sveltejs/kit';

export async function load({ params, cookies }) {
    const sesja = cookies.get('CAKEPHP');
    const id = params.id;

    const response = await fetch(`http://skp2x.ddev.site/api/zamowienia/${id}`, {
        method: 'GET',
        headers: {
            'Cookie': `CAKEPHP=${sesja}`
        }
    });

    const data = await response.json();

    if (!data.success) {
        throw error(data.code === 404 ? 404 : 500, data.error);
    }

    return {
        zamowienie: data.data
    };
}