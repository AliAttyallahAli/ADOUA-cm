import { useState, useEffect } from 'react';

export default function LoanManagement({ user }) {
  const [loans, setLoans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/loans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLoans(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const totalStats = {
    totalAmount: loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0),
    totalPaid: loans.reduce((sum, loan) => sum + parseFloat(loan.paid_amount), 0),
    totalRemaining: loans.reduce((sum, loan) => sum + parseFloat(loan.remaining_amount), 0),
    activeLoans: loans.filter(loan => loan.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* En-tête et statistiques */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Prêts</h1>
          <p className="text-gray-600">{loans.length} prêts au total</p>
        </div>
        
        {(user.role === 'admin' || user.role === 'chef_operation') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <span>+</span>
            <span>Nouveau Prêt</span>
          </button>
        )}
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Montant Total"
          value={`${totalStats.totalAmount.toLocaleString()} XOF`}
          icon="💰"
          color="blue"
        />
        <StatCard
          title="Total Payé"
          value={`${totalStats.totalPaid.toLocaleString()} XOF`}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Total Restant"
          value={`${totalStats.totalRemaining.toLocaleString()} XOF`}
          icon="⏳"
          color="orange"
        />
        <StatCard
          title="Prêts Actifs"
          value={totalStats.activeLoans.toString()}
          icon="📊"
          color="purple"
        />
      </div>

      {/* Tableau des prêts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payé
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reste
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <LoanRow 
                  key={loan.id} 
                  loan={loan} 
                  onView={() => setSelectedLoan(loan)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loans.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun prêt enregistré</h3>
          <p className="text-gray-500 mb-4">Commencez par créer votre premier prêt</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer un prêt
          </button>
        </div>
      )}
    </div>
  );
}

function LoanRow({ loan, onView }) {
  const progress = (loan.paid_amount / loan.total_amount) * 100;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="font-medium text-gray-900">{loan.client_name}</div>
          <div className="text-sm text-gray-500 font-mono">{loan.wallet_address}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
        {parseFloat(loan.amount).toLocaleString()} XOF
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {loan.interest_rate}%
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
        {parseFloat(loan.paid_amount).toLocaleString()} XOF
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
        {parseFloat(loan.remaining_amount).toLocaleString()} XOF
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          loan.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {loan.status === 'active' ? 'Actif' : 'Terminé'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={onView}
          className="text-blue-600 hover:text-blue-900 font-medium"
        >
          Détails
        </button>
      </td>
    </tr>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
  };

  return (
    <div className={`${colorClasses[color]} rounded-2xl border-2 p-6 transition-transform hover:scale-105 duration-200`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}