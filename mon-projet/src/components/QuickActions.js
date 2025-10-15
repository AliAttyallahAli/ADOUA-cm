import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function QuickActions({ user }) {
  const [showQuickTransaction, setShowQuickTransaction] = useState(false);
  const router = useRouter();

  const actions = [
    {
      title: 'Nouvelle Transaction',
      description: 'Effectuer un transfert ou dépôt',
      icon: '💰',
      color: 'bg-green-500',
      onClick: () => setShowQuickTransaction(true),
      roles: ['admin', 'chef_operation', 'caissier', 'agent']
    },
    {
      title: 'Nouveau Prêt',
      description: 'Créer un nouveau prêt client',
      icon: '📊',
      color: 'bg-blue-500',
      onClick: () => router.push('/dashboard?tab=loans'),
      roles: ['admin', 'chef_operation']
    },
    {
      title: 'Ajouter Client',
      description: 'Enregistrer un nouveau client',
      icon: '👥',
      color: 'bg-purple-500',
      onClick: () => router.push('/dashboard?tab=clients'),
      roles: ['admin', 'chef_operation']
    },
    {
      title: 'Générer Rapport',
      description: 'Exporter les données en PDF',
      icon: '📄',
      color: 'bg-orange-500',
      onClick: () => window.open('/api/transactions/report/pdf', '_blank'),
      roles: ['admin', 'chef_operation']
    },
    {
      title: 'Vérifier Solde',
      description: 'Consulter le solde principal',
      icon: '💳',
      color: 'bg-indigo-500',
      onClick: () => router.push('/dashboard?tab=overview'),
      roles: ['admin', 'chef_operation', 'caissier', 'agent']
    },
    {
      title: 'Transactions en Attente',
      description: 'Valider les transactions',
      icon: '⏳',
      color: 'bg-yellow-500',
      onClick: () => router.push('/dashboard?tab=transactions'),
      roles: ['admin', 'chef_operation']
    }
  ];

  const filteredActions = actions.filter(action => 
    action.roles.includes(user.role)
  );

  return (
    <>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`p-4 text-left rounded-lg shadow hover:shadow-md transition-shadow ${action.color} text-white`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <h4 className="font-semibold">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showQuickTransaction && (
        <QuickTransactionForm onClose={() => setShowQuickTransaction(false)} />
      )}
    </>
  );
}

function QuickTransactionForm({ onClose }) {
  const [formData, setFormData] = useState({
    to_wallet: '',
    amount: '',
    type: 'transfert',
    description: ''
  });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implémentation simplifiée de la transaction
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Transaction Rapide</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Destinataire</label>
            <select
              value={formData.to_wallet}
              onChange={(e) => setFormData({...formData, to_wallet: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.wallet_address}>
                  {client.name} - {client.wallet_address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Montant (XOF)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Raison de la transaction..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Effectuer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}