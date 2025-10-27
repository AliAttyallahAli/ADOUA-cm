import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // Récupérer les données du client
      const clientResponse = await fetch(`/api/clients/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const clientData = await clientResponse.json();
      setClient(clientData);

      // Récupérer les transactions du client
      const transactionsResponse = await fetch(`/api/clients/${id}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData);

      // Récupérer les prêts du client
      const loansResponse = await fetch(`/api/clients/${id}/loans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const loansData = await loansResponse.json();
      setLoans(loansData);

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateVisaCard = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/generate-card/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carte_visa_${client.name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération de la carte');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données du client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Client non trouvé</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard?tab=clients" className="text-blue-600 hover:text-blue-800">
                ← Retour
              </Link>
              <div className="flex items-center space-x-4">
                {client.photo ? (
                  <img
                    src={client.photo}
                    alt={client.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-2xl">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                  <p className="text-gray-600">{client.email} • {client.phone}</p>
                  <p className="text-sm text-gray-500">Client depuis {new Date(client.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generateVisaCard}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Générer Carte Visa
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Modifier
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats rapides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Solde Actuel</h3>
            <p className="text-3xl font-bold text-green-600">
              {parseFloat(client.balance || 0).toLocaleString()} XOF
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Transactions</h3>
            <p className="text-3xl font-bold text-blue-600">
              {transactions.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Prêts Actifs</h3>
            <p className="text-3xl font-bold text-orange-600">
              {loans.filter(loan => loan.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Dette Totale</h3>
            <p className="text-3xl font-bold text-red-600">
              {loans
                .filter(loan => loan.status === 'active')
                .reduce((sum, loan) => sum + parseFloat(loan.remaining_amount), 0)
                .toLocaleString()} XOF
            </p>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <nav className="flex space-x-8 px-6">
            {[
              'overview', 
              'personal', 
              'transactions', 
              'loans', 
              'documents'
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && 'Aperçu'}
                {tab === 'personal' && 'Informations Personnelles'}
                {tab === 'transactions' && 'Transactions'}
                {tab === 'loans' && 'Prêts'}
                {tab === 'documents' && 'Documents'}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {activeTab === 'overview' && <OverviewTab client={client} transactions={transactions} loans={loans} />}
          {activeTab === 'personal' && <PersonalInfoTab client={client} />}
          {activeTab === 'transactions' && <TransactionsTab transactions={transactions} />}
          {activeTab === 'loans' && <LoansTab loans={loans} clientId={id} />}
          {activeTab === 'documents' && <DocumentsTab client={client} />}
        </div>
      </div>
    </div>
  );
}

// Composant Onglet Aperçu
function OverviewTab({ client, transactions, loans }) {
  const recentTransactions = transactions.slice(0, 5);
  const activeLoans = loans.filter(loan => loan.status === 'active');

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Aperçu du Client</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de base */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Informations de Contact</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{client.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd className="text-sm text-gray-900">{client.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                <dd className="text-sm text-gray-900">{client.address || 'Non renseignée'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">CIN</dt>
                <dd className="text-sm text-gray-900">{client.cin}</dd>
              </div>
            </dl>
          </div>

          {/* Wallet */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-3">Informations Wallet</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-blue-600">Adresse Wallet</span>
                <span className="text-sm font-mono text-blue-800">{client.wallet_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-blue-600">Solde</span>
                <span className="text-sm font-bold text-green-600">
                  {parseFloat(client.balance || 0).toLocaleString()} XOF
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="space-y-6">
          {/* Transactions récentes */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">Transactions Récentes</h3>
            </div>
            <div className="p-4">
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune transaction récente</p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{transaction.type}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'depot' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount} XOF
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Prêts actifs */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">Prêts Actifs</h3>
            </div>
            <div className="p-4">
              {activeLoans.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun prêt actif</p>
              ) : (
                <div className="space-y-3">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Prêt #{loan.id}</span>
                        <span className="text-red-600">{loan.remaining_amount} XOF</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ 
                            width: `${((loan.total_amount - loan.remaining_amount) / loan.total_amount) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Payé: {loan.paid_amount} XOF</span>
                        <span>Total: {loan.total_amount} XOF</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Informations Personnelles
function PersonalInfoTab({ client }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Informations Personnelles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Coordonnées</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nom Complet</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.phone}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Adresse</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.address || 'Non renseignée'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Ville</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.city || 'Non renseignée'}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Informations d'Identité</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">CIN/Numéro d'Identité</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.cin}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Profession</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.profession || 'Non renseignée'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date de Naissance</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'Non renseignée'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date d'Inscription</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(client.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  client.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {client.is_active ? 'Actif' : 'Inactif'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Informations financières */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Informations Financières</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Score de Crédit</dt>
              <dd className="mt-1 text-2xl font-bold text-blue-600">
                {client.credit_score || 100}/100
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
              <dd className="mt-1 font-mono text-sm text-gray-900">{client.wallet_address}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Dernière Mise à Jour</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(client.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Transactions
function TransactionsTab({ transactions }) {
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    date: ''
  });

  useEffect(() => {
    let filtered = transactions;
    
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    if (filters.date) {
      filtered = filtered.filter(t => 
        new Date(t.created_at).toLocaleDateString() === new Date(filters.date).toLocaleDateString()
      );
    }
    
    setFilteredTransactions(filtered);
  }, [filters, transactions]);

  const exportToPDF = async () => {
    // Implémentation de l'export PDF
    alert('Fonction d\'export PDF à implémenter');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Historique des Transactions</h2>
        <div className="flex space-x-3">
          <button
            onClick={exportToPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Tous les types</option>
              <option value="transfert">Transfert</option>
              <option value="depot">Dépôt</option>
              <option value="retrait">Retrait</option>
              <option value="pret">Prêt</option>
              <option value="remboursement">Remboursement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complétée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ type: '', status: '', date: '' })}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune transaction trouvée
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                    <br />
                    <span className="text-xs text-gray-400">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'depot' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'retrait' ? 'bg-red-100 text-red-800' :
                      transaction.type === 'pret' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                    transaction.type === 'depot' ? 'text-green-600' : 'text-red-600'
                  }">
                    {parseFloat(transaction.amount).toLocaleString()} XOF
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {transaction.description || 'Aucune description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Détails
                    </button>
                    {transaction.status === 'pending' && (
                      <button className="text-green-600 hover:text-green-900">
                        Valider
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Affichage de <span className="font-medium">{filteredTransactions.length}</span> transactions
        </p>
        <div className="flex space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Précédent
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant Prêts
function LoansTab({ loans, clientId }) {
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showRepayment, setShowRepayment] = useState(null);

  const calculateProgress = (loan) => {
    return (parseFloat(loan.paid_amount) / parseFloat(loan.total_amount)) * 100;
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
        alert('Remboursement effectué avec succès');
        setShowRepayment(null);
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du remboursement');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gestion des Prêts</h2>
        <button
          onClick={() => setShowLoanForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Nouveau Prêt
        </button>
      </div>

      {showLoanForm && (
        <LoanForm 
          clientId={clientId}
          onClose={() => setShowLoanForm(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {showRepayment && (
        <RepaymentForm 
          loan={showRepayment}
          onClose={() => setShowRepayment(null)}
          onRepayment={handleRepayment}
        />
      )}

      {loans.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun prêt</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouveau prêt pour ce client.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Prêt #{loan.id}</h3>
                  <p className="text-sm text-gray-600">
                    Créé le {new Date(loan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    loan.status === 'active' ? 'bg-green-100 text-green-800' :
                    loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    loan.status === 'defaulted' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.status}
                  </span>
                  {loan.status === 'active' && (
                    <button
                      onClick={() => setShowRepayment(loan)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Rembourser
                    </button>
                  )}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression du remboursement</span>
                  <span>{parseFloat(loan.paid_amount).toLocaleString()} / {parseFloat(loan.total_amount).toLocaleString()} XOF</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(loan)}%` }}
                  ></div>
                </div>
              </div>

              {/* Détails du prêt */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Montant initial</span>
                  <p className="text-gray-900">{parseFloat(loan.amount).toLocaleString()} XOF</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Taux d'intérêt</span>
                  <p className="text-gray-900">{loan.interest_rate}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Total à payer</span>
                  <p className="text-green-600 font-semibold">{parseFloat(loan.total_amount).toLocaleString()} XOF</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Reste à payer</span>
                  <p className="text-red-600 font-semibold">{parseFloat(loan.remaining_amount).toLocaleString()} XOF</p>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Durée</span>
                  <p className="text-gray-900">{loan.duration} mois</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Mensualité</span>
                  <p className="text-gray-900">{parseFloat(loan.monthly_payment).toLocaleString()} XOF/mois</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Date de fin</span>
                  <p className="text-gray-900">
                    {loan.end_date ? new Date(loan.end_date).toLocaleDateString() : 'Non définie'}
                  </p>
                </div>
              </div>

              {loan.purpose && (
                <div className="mt-4">
                  <span className="font-medium text-gray-500">Objet du prêt</span>
                  <p className="text-gray-900">{loan.purpose}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant Documents
function DocumentsTab({ client }) {
  const [documents, setDocuments] = useState([]);

  const generateVisaCard = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/generate-card/${client.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carte_visa_${client.name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération de la carte');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Documents du Client</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Visa */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Carte Visa ADOUAS-MC</h3>
          <p className="text-sm text-gray-600 mb-4">
            Carte de crédit personnalisée avec QR code contenant les informations du wallet.
          </p>
          <button
            onClick={generateVisaCard}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Générer la Carte
          </button>
        </div>

        {/* Contrat de prêt */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contrat de Prêt</h3>
          <p className="text-sm text-gray-600 mb-4">
            Document contractuel pour les prêts accordés au client.
          </p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Générer Contrat
          </button>
        </div>

        {/* Relevé de compte */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Relevé de Compte</h3>
          <p className="text-sm text-gray-600 mb-4">
            Historique complet des transactions et soldes.
          </p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
            Générer Relevé
          </button>
        </div>
      </div>

      {/* Documents existants */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents Générés</h3>
        {documents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Aucun document généré pour le moment</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-sm text-gray-500">
                          Généré le {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-700 active:bg-blue-700 transition duration-150 ease-in-out">
                        Télécharger
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Composants modaux (à implémenter)
function LoanForm({ clientId, onClose, onSuccess }) {
  // Implémentation du formulaire de prêt
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Nouveau Prêt</h3>
        {/* Formulaire de prêt */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Créer
          </button>
        </div>
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
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant du remboursement (XOF)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={loan.remaining_amount}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Reste à payer: {parseFloat(loan.remaining_amount).toLocaleString()} XOF
            </p>
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
              Effectuer le Remboursement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}