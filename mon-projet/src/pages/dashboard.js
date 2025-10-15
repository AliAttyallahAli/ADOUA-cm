import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Notifications from '../components/Notifications';
import QuickActions from '../components/QuickActions';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserManagement from '../components/UserManagement';
import LoanManagement from '@/components/LoanManagement';
import Link from 'next/link';
import TransactionForm from '../components/TransactionForm';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ADOUAS-MC</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {user.role}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Notifications />
              <Link href="/profile" className="text-blue-600 hover:text-blue-800">
                Mon Profil
              </Link>
              <span>Bonjour, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'clients', 'transactions', 'loans', 'users', 'analytics', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab === 'overview' && 'Aperçu'}
                {tab === 'clients' && 'Clients'}
                {tab === 'transactions' && 'Transactions'}
                {tab === 'loans' && 'Prêts'}
                {tab === 'users' && 'Utilisateurs'}
                {tab === 'analytics' && 'Analytiques'}
                {tab === 'documents' && 'Documents'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <>
            <QuickActions user={user} />
            <OverviewTab user={user} />
          </>
        )}
        {activeTab === 'clients' && <ClientsTab user={user} />}
        {activeTab === 'transactions' && <TransactionsTab user={user} />}
        {activeTab === 'loans' && <LoanManagement user={user} />}
        {activeTab === 'users' && <UserManagement user={user} />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'documents' && <DocumentsTab user={user} />}
      </main>
    </div>
  );
}

// Composants pour chaque onglet
function OverviewTab({ user }) {
  const [stats, setStats] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    try {
      // Récupérer les statistiques
      const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Récupérer les transactions récentes
      const transactionsResponse = await fetch('http://localhost:5000/api/transactions?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const transactionsData = await transactionsResponse.json();
      setRecentTransactions(transactionsData);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Tableau de Bord ADOUAS-MC</h2>

      {/* Statistiques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Solde Principal</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.mainBalance ? stats.mainBalance.toLocaleString() : '0'} XOF
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Transactions Aujourd'hui</h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.todayTransactions?.count || 0}
          </p>
          <p className="text-sm text-gray-500">
            {stats.todayTransactions?.total ? stats.todayTransactions.total.toLocaleString() : '0'} XOF
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Prêts Actifs</h3>
          <p className="text-2xl font-bold text-orange-600">
            {stats.activeLoans?.count || 0}
          </p>
          <p className="text-sm text-gray-500">
            {stats.activeLoans?.total ? stats.activeLoans.total.toLocaleString() : '0'} XOF
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">En Attente</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingTransactions || 0}
          </p>
          <p className="text-sm text-gray-500">Transactions à valider</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions récentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Transactions Récentes</h3>
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{transaction.type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                    {transaction.amount} XOF
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Clients</h3>
          <div className="space-y-3">
            {stats.topClients?.map((client, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-gray-500">Solde actuel</p>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {client.balance} XOF
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function ClientsTab({ user }) {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Clients</h2>
        {(user.role === 'admin' || user.role === 'chef_operation') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Ajouter Client
          </button>
        )}
      </div>

      {showForm && <ClientForm onClose={() => setShowForm(false)} onSuccess={fetchClients} />}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {client.photo && (
                      <img className="h-10 w-10 rounded-full mr-3" src={client.photo} alt="" />
                    )}
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.wallet_address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Voir</button>
                  <button className="text-green-600 hover:text-green-900">Carte</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cin: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Nouveau Client</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom complet"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Adresse"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="CIN"
            value={formData.cin}
            onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Implémenter les autres composants de la même manière...
function TransactionsTab({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append('status', filters.status);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.date) queryParams.append('date', filters.date);

    try {
      const response = await fetch(`http://localhost:5000/api/transactions?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const validateTransaction = async (transactionId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchTransactions(); // Rafraîchir la liste
        alert('Transaction validée avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation');
    }
  };

  const downloadReport = async () => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append('status', filters.status);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.date) queryParams.append('date', filters.date);

    try {
      const response = await fetch(`http://localhost:5000/api/transactions/report/pdf?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapport_transactions.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <div className="flex space-x-3">
          <button
            onClick={downloadReport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Télécharger PDF
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Nouvelle Transaction
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="completed">Complétées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Tous</option>
              <option value="transfert">Transfert</option>
              <option value="pret">Prêt</option>
              <option value="remboursement">Remboursement</option>
              <option value="depot">Dépôt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', type: '', date: '' })}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={fetchTransactions}
        />
      )}

      {/* Tableau des transactions */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">De</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{transaction.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{transaction.from_wallet}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{transaction.to_wallet}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{transaction.amount} XOF</td>
                <td className="px-6 py-4 text-sm text-gray-500">{transaction.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {(user.role === 'admin' || user.role === 'chef_operation') &&
                    transaction.status === 'pending' && (
                      <button
                        onClick={() => validateTransaction(transaction.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Valider
                      </button>
                    )}
                  <button className="text-blue-600 hover:text-blue-900">Détails</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoansTab({ user }) {
  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des Prêts</h2>
      {/* Implémenter la gestion des prêts */}
    </div>
  );
}

function UsersTab({ user }) {
  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h2>
      {/* Implémenter la gestion des utilisateurs */}
    </div>
  );
}

function DocumentsTab({ user }) {
  const generateCard = async (clientId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/generate-card/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carte_visa.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Génération de Documents</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Cartes Visa Clients</h3>
        <p className="text-gray-600 mb-4">
          Générez des cartes Visa personnalisées pour vos clients avec QR Code.
        </p>
        <button
          onClick={() => generateCard(1)} // Remplacer par l'ID du client sélectionné
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Générer Carte Visa
        </button>
      </div>
    </div>
  );
}