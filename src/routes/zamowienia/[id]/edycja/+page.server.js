// Pobiera dane zamówienia z API i przekazuje do komponentu strony.
// Działa server-side — dane są dostępne w +page.svelte przez props.data.
import { error } from '@sveltejs/kit';
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

    return {
        zamowienie: data.data
    };
}