import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function Analytics() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }
    
    const userObj = JSON.parse(userData);
    setUser(userObj);

    // Seuls les admins et chefs d'opération peuvent accéder aux analytics
    if (!['admin', 'chef_operation'].includes(userObj.role)) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytiques ADOUAS-MC</h1>
                <p className="text-gray-600">Statistiques et tendances de votre agence</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnalyticsDashboard />
      </main>
    </div>
  );
}