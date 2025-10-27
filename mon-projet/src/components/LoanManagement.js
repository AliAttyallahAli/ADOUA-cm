import { useState, useEffect } from 'react';

export default function LoanManagement({ user }) {
  const [loans, setLoans] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRepayment, setShowRepayment] = useState(null);

  useEffect(() => {
    fetchLoans();
    fetchClients();
  }, []);

  const fetchLoans = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/loans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLoans(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

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

  const handleRepayment = async (loanId, amount) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/loans/${loanId}/repayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      if (response.ok) {
        fetchLoans();
        setShowRepayment(null);
        alert('Remboursement effectué avec succès');
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Prêts</h2>
        {(user.role === 'admin' || user.role === 'chef_operation') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Nouveau Prêt
          </button>
        )}
      </div>

      {showForm && (
        <LoanForm 
          clients={clients}
          onClose={() => setShowForm(false)}
          onSuccess={fetchLoans}
        />
      )}

      {showRepayment && (
        <RepaymentForm 
          loan={showRepayment}
          onClose={() => setShowRepayment(null)}
          onRepayment={handleRepayment}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Prêts Actifs</h3>
          <p className="text-3xl font-bold text-blue-600">
            {loans.filter(l => l.status === 'active').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Montant Total Prêts</h3>
          <p className="text-3xl font-bold text-green-600">
            {loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0).toLocaleString()} XOF
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Montant à Récupérer</h3>
          <p className="text-3xl font-bold text-orange-600">
            {loans.reduce((sum, loan) => sum + parseFloat(loan.remaining_amount), 0).toLocaleString()} XOF
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {loan.client_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {parseFloat(loan.amount).toLocaleString()} XOF
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {loan.interest_rate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(loan.total_amount).toLocaleString()} XOF
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {parseFloat(loan.paid_amount).toLocaleString()} XOF
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {parseFloat(loan.remaining_amount).toLocaleString()} XOF
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    loan.status === 'active' ? 'bg-green-100 text-green-800' :
                    loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {loan.status === 'active' && (
                    <button
                      onClick={() => setShowRepayment(loan)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Rembourser
                    </button>
                  )}
                  <button className="text-blue-600 hover:text-blue-900">
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoanForm({ clients, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    interest_rate: '10',
    duration: '12'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          interest_rate: parseFloat(formData.interest_rate),
          duration: parseInt(formData.duration)
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du prêt');
    }
  };

  const totalAmount = formData.amount ? 
    (parseFloat(formData.amount) * (1 + parseFloat(formData.interest_rate) / 100)).toFixed(2) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Nouveau Prêt</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.wallet_address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Montant du prêt (XOF)</label>
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
            <label className="block text-sm font-medium text-gray-700">Taux d'intérêt (%)</label>
            <select
              value={formData.interest_rate}
              onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({length: 20}, (_, i) => i + 1).map(rate => (
                <option key={rate} value={rate}>{rate}%</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Durée (mois)</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="6">6 mois</option>
              <option value="12">12 mois</option>
              <option value="24">24 mois</option>
              <option value="36">36 mois</option>
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-semibold mb-2">Récapitulatif</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Montant initial:</span>
                <span>{formData.amount || 0} XOF</span>
              </div>
              <div className="flex justify-between">
                <span>Intérêts ({formData.interest_rate}%):</span>
                <span>{(formData.amount * formData.interest_rate / 100) || 0} XOF</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>Total à rembourser:</span>
                <span className="text-green-600">{totalAmount} XOF</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Mensualité estimée:</span>
                <span>{(totalAmount / formData.duration).toFixed(2)} XOF/mois</span>
              </div>
            </div>
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
              Créer le Prêt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RepaymentForm({ loan, onClose, onRepayment }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(amount) > parseFloat(loan.remaining_amount)) {
      alert('Le montant ne peut pas dépasser le reste à payer');
      return;
    }
    onRepayment(loan.id, amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Remboursement de Prêt</h3>
        <p className="text-sm text-gray-600 mb-4">
          Client: <strong>{loan.client_name}</strong><br />
          Reste à payer: <strong>{parseFloat(loan.remaining_amount).toLocaleString()} XOF</strong>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Montant du remboursement (XOF)</label>
            <input
              type="number"
              step="0.01"
              max={loan.remaining_amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Intérêts pour cette transaction: {(amount * loan.interest_rate / 100).toFixed(2)} XOF
            </p>
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Effectuer le Remboursement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}