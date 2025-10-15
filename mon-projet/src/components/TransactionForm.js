import { useState, useEffect } from 'react';

export default function TransactionForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    from_wallet: '',
    to_wallet: '',
    amount: '',
    type: 'transfert',
    description: '',
    interest_rate: 0
  });
  const [clients, setClients] = useState([]);
  const [userWallet, setUserWallet] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchClients();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUserWallet(data.wallet_address);
      setFormData(prev => ({ ...prev, from_wallet: data.wallet_address }));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

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
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la transaction');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Nouvelle Transaction</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Depuis le wallet</label>
            <input
              type="text"
              value={formData.from_wallet}
              onChange={(e) => setFormData({...formData, from_wallet: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Votre wallet: {userWallet}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vers le wallet</label>
            <select
              value={formData.to_wallet}
              onChange={(e) => setFormData({...formData, to_wallet: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionner un destinataire</option>
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
            <label className="block text-sm font-medium text-gray-700">Type de transaction</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="transfert">Transfert</option>
              <option value="pret">Prêt</option>
              <option value="remboursement">Remboursement</option>
              <option value="depot">Dépôt</option>
              <option value="credit">Crédit</option>
            </select>
          </div>

          {formData.type === 'pret' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Taux d'intérêt (%)</label>
              <input
                type="number"
                min="1"
                max="20"
                step="0.1"
                value={formData.interest_rate}
                onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}