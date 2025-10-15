export default function manifest() {
  return {
    name: 'ADOUAS-MC - Système de Micro Crédit',
    short_name: 'ADOUAS-MC',
    description: 'Plateforme de gestion de micro crédit',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}