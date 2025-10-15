'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './hooks/useAuth'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')
  const { login, user } = useAuth()
  const router = useRouter()

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Vérifier le statut de l'API au chargement
  useEffect(() => {
    checkAPIStatus()
  }, [])

  const checkAPIStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      })
      
      if (response.ok) {
        setApiStatus('online')
      } else {
        setApiStatus('error')
      }
    } catch (error) {
      console.error('API non accessible:', error)
      setApiStatus('error')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Test CORS avant le login
    try {
      const testResponse = await fetch('http://localhost:5000/api/test-cors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      })

      if (!testResponse.ok) {
        throw new Error('Problème de connexion CORS avec le serveur')
      }
    } catch (error) {
      setError('Serveur inaccessible. Vérifiez que le backend est démarré sur le port 5000.')
      setLoading(false)
      return
    }

    const result = await login(email, password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* En-tête */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">ADOUAS-MC</h1>
          <p className="mt-2 text-blue-100">Système de Gestion de Micro Crédit</p>
          
          {/* Statut de l'API */}
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm">
            {apiStatus === 'checking' && (
              <span className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-2 animate-pulse"></div>
                Vérification du serveur...
              </span>
            )}
            {apiStatus === 'online' && (
              <span className="flex items-center text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Serveur connecté
              </span>
            )}
            {apiStatus === 'error' && (
              <span className="flex items-center text-red-300">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                Serveur inaccessible
              </span>
            )}
          </div>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">Connexion</h2>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Accédez à votre espace administrateur
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="alert-error">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="admin@adouas-mc.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || apiStatus === 'error'}
              className="w-full btn-primary py-3 text-base font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Informations de test */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Compte de démonstration :</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Email:</strong> admin@adouas-mc.com</p>
              <p><strong>Mot de passe:</strong> admin123</p>
            </div>
          </div>

          {/* Dépannage */}
          {apiStatus === 'error' && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                🔧 Problème de connexion détecté
              </h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Vérifiez que le serveur backend est démarré</li>
                <li>• Port backend: <code className="bg-yellow-100 px-1 rounded">5000</code></li>
                <li>• Commandes: 
                  <code className="bg-yellow-100 px-1 rounded ml-1">cd backend && npm start</code>
                </li>
                <li>• Vérifiez que le CORS est configuré</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-blue-200">
            © 2024 ADOUAS Micro Crédit. Tous droits réservés.
          </p>
          <p className="text-xs text-blue-300 mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container-custom py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ADOUAS-MC
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Système de Gestion de Micro Crédit
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card-hover p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion Clients</h3>
              <p className="text-gray-600">Gérez efficacement votre portefeuille clients</p>
            </div>
            
            <div className="card-hover p-6 text-center">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-success-600 text-xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transactions</h3>
              <p className="text-gray-600">Suivez toutes les opérations financières</p>
            </div>
            
            <div className="card-hover p-6 text-center">
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-warning-600 text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytiques</h3>
              <p className="text-gray-600">Tableaux de bord et rapports détaillés</p>
            </div>
          </div>
          
          <div className="mt-12">
            <button className="btn-primary px-8 py-3 text-lg">
              Démarrer l'Application
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}