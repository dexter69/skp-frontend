// src/lib/config.js
// Centralne miejsce dla konfiguracji aplikacji.
// Wszystkie zmienne środowiskowe czytamy tutaj — nigdzie indziej.

// Adres backendu CakePHP.
// Na DEV: https://skp2x.ddev.site (ustawione w .env)
// Na produkcji: pusty string (SvelteKit i CakePHP na tej samej domenie skp.lan)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';