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
  const [userWallets, setUserWallets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchUserWallets();
  }, []);

  const fetchClients = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchUserWallets = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/user/wallets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUserWallets(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la transaction');
    } finally {
      setLoading(false);
    }
  };

  const transactionTypes = [
    { value: 'transfert', label: 'Transfert', icon: '🔄' },
    { value: 'pret', label: 'Prêt', icon: '💰' },
    { value: 'remboursement', label: 'Remboursement', icon: '📥' },
    { value: 'depot', label: 'Dépôt', icon: '💳' },
    { value: 'retrait', label: 'Retrait', icon: '🏧' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Nouvelle Transaction</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de transaction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Type de Transaction</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {transactionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({...formData, type: type.value})}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expéditeur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expéditeur</label>
              <select
                value={formData.from_wallet}
                onChange={(e) => setFormData({...formData, from_wallet: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionner un wallet</option>
                <optgroup label="Vos Wallets">
                  {userWallets.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {wallet.address} - {wallet.balance} XOF
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Clients">
                  {clients.map((client) => (
                    <option key={client.wallet_address} value={client.wallet_address}>
                      {client.name} - {client.wallet_address}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Destinataire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destinataire</label>
              <select
                value={formData.to_wallet}
                onChange={(e) => setFormData({...formData, to_wallet: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionner un wallet</option>
                <optgroup label="Clients">
                  {clients.map((client) => (
                    <option key={client.wallet_address} value={client.wallet_address}>
                      {client.name} - {client.wallet_address}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Vos Wallets">
                  {userWallets.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {wallet.address} - {wallet.balance} XOF
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Montant et Taux d'intérêt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant (XOF)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            {(formData.type === 'pret' || formData.type === 'remboursement') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux d'intérêt (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.0"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description de la transaction..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>Créer la Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}