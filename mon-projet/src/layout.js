import { Inter } from 'next/font/google'
// import { global } from '../app/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'ADOUAS-MC - Système de Micro Crédit',
    template: '%s | ADOUAS-MC'
  },
  description: 'Plateforme de gestion de micro crédit pour l\'agence ADOUAS-MC',
  keywords: ['microcrédit', 'finance', 'prêt', 'ADOUAS', 'Côte d\'Ivoire'],
  authors: [{ name: 'ADOUAS-MC Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'ADOUAS-MC - Système de Micro Crédit',
    description: 'Plateforme de gestion de micro crédit pour l\'agence ADOUAS-MC',
    type: 'website',
    locale: 'fr_CI',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}