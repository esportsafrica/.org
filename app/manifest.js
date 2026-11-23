export default function manifest(){
  return {
    name: 'Esports Africa',
    short_name: 'EsportsAfrica',
    description: 'Competitive gaming tournaments across Africa. Register, follow live brackets and get tickets.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0c0c',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
}
