import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Backup() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const router = useRouter();

  const createBackup = async () => {
    setIsCreatingBackup(true);
    setBackupMessage('');
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/admin/backup', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBackupMessage(`Backup créé avec succès: ${data.file}`);
      } else {
        setBackupMessage('Erreur lors de la création du backup');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setBackupMessage('Erreur de connexion');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← Retour au Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Sauvegarde de la Base de Données</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Sauvegarde Manuelle</h2>
            <p className="text-gray-600 mb-4">
              Créez une sauvegarde complète de la base de données. Cette opération peut prendre quelques instants.
            </p>
            
            <button
              onClick={createBackup}
              disabled={isCreatingBackup}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreatingBackup ? 'Création en cours...' : 'Créer un Backup'}
            </button>
          </div>

          {backupMessage && (
            <div className={`p-4 rounded-md ${
              backupMessage.includes('succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {backupMessage}
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Recommandations de Sauvegarde</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Effectuez une sauvegarde quotidienne en période d'activité normale</li>
              <li>Effectuez une sauvegarde avant toute mise à jour majeure du système</li>
              <li>Stockez les sauvegardes dans un emplacement sécurisé</li>
              <li>Testez régulièrement la restauration des sauvegardes</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}