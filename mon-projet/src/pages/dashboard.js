import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Composants d'interface
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import RecentTransactions from '../components/RecentTransactions';
import LoanManagement from '../components/LoanManagement';
import TransactionForm from '../components/TransactionForm';
import ClientManagement from '../components/ClientManagement';
import UserManagement from '../components/UserManagement';
import DocumentGenerator from '../components/DocumentGenerator';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab user={user} />;
      case 'clients':
        return <ClientManagement user={user} />;
      case 'transactions':
        return <TransactionsTab user={user} />;
      case 'loans':
        return <LoanManagement user={user} />;
      case 'users':
        return <UserManagement user={user} />;
      case 'documents':
        return <DocumentGenerator user={user} />;
      default:
        return <OverviewTab user={user} />;
    }
  };

  return (
    <>
      <Head>
        <title>ADOUAS-MC - Dashboard</title>
        <meta name="description" content="Système de gestion de micro-crédit" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            user={user} 
            onLogout={handleLogout}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}

// Composant Overview Tab
function OverviewTab({ user }) {
  const [stats, setStats] = useState({
    totalBalance: 0,
    pendingTransactions: 0,
    activeLoans: 0,
    totalClients: 0,
    todayTransactions: 0,
    monthlyRevenue: 0
  });

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
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Récupérer les transactions récentes
      const transactionsResponse = await fetch('http://localhost:5000/api/transactions?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Bienvenue, {user.name} 👋</h1>
        <p className="text-blue-100">Gérez votre agence de micro-crédit efficacement</p>
        <div className="flex items-center mt-4 space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">Système en ligne</span>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <StatsCards stats={stats} />

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions récentes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Transactions Récentes</h2>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('tabChange', { detail: 'transactions' }))}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voir tout
            </button>
          </div>
          <RecentTransactions transactions={recentTransactions} />
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionCard
              icon="💰"
              title="Nouvelle Transaction"
              description="Effectuer un transfert"
              onClick={() => window.dispatchEvent(new CustomEvent('openTransactionForm'))}
              color="blue"
            />
            <QuickActionCard
              icon="👥"
              title="Ajouter Client"
              description="Créer un nouveau client"
              onClick={() => window.dispatchEvent(new CustomEvent('tabChange', { detail: 'clients' }))}
              color="green"
            />
            <QuickActionCard
              icon="📊"
              title="Gérer Prêts"
              description="Voir les prêts actifs"
              onClick={() => window.dispatchEvent(new CustomEvent('tabChange', { detail: 'loans' }))}
              color="purple"
            />
            <QuickActionCard
              icon="🎫"
              title="Générer Carte"
              description="Créer carte Visa"
              onClick={() => window.dispatchEvent(new CustomEvent('tabChange', { detail: 'documents' }))}
              color="orange"
            />
          </div>
        </div>
      </div>

      {/* Graphiques et analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activité Mensuelle</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Graphique des transactions (à implémenter)
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Clients</h3>
          <div className="space-y-4">
            <ClientRankItem name="Moussa Diop" amount="750,000 XOF" />
            <ClientRankItem name="Aminata Sow" amount="620,000 XOF" />
            <ClientRankItem name="Ibrahima Fall" amount="580,000 XOF" />
            <ClientRankItem name="Fatou Bâ" amount="450,000 XOF" />
            <ClientRankItem name="Jean Kamga" amount="390,000 XOF" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Transactions Tab
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
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Transactions</h1>
          <p className="text-gray-600">Suivez et gérez toutes les transactions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>+</span>
          <span>Nouvelle Transaction</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complétées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="transfert">Transfert</option>
              <option value="pret">Prêt</option>
              <option value="remboursement">Remboursement</option>
              <option value="depot">Dépôt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', type: '', date: '' })}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">De</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vers</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <TransactionRow 
                  key={transaction.id} 
                  transaction={transaction} 
                  user={user}
                  onValidate={fetchTransactions}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransactionForm 
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}

// Composants supplémentaires
function QuickActionCard({ icon, title, description, onClick, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200'
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${colorClasses[color]}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm opacity-75">{description}</p>
    </button>
  );
}

function ClientRankItem({ name, amount }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {name.charAt(0)}
        </div>
        <span className="font-medium text-gray-700">{name}</span>
      </div>
      <span className="font-semibold text-green-600">{amount}</span>
    </div>
  );
}

function TransactionRow({ transaction, user, onValidate }) {
  const validateTransaction = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${transaction.id}/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        onValidate();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Complétée' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      transfert: '🔄',
      pret: '💰',
      remboursement: '📥',
      depot: '💳'
    };
    return icons[type] || '⚡';
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        #{transaction.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(transaction.type)}</span>
          <span className="font-mono text-xs">{transaction.from_wallet}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
        {transaction.to_wallet}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
        {parseFloat(transaction.amount).toLocaleString()} XOF
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
        {transaction.type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(transaction.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(transaction.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {(user.role === 'admin' || user.role === 'chef_operation') && 
         transaction.status === 'pending' && (
          <button
            onClick={validateTransaction}
            className="text-green-600 hover:text-green-900 font-medium"
          >
            Valider
          </button>
        )}
        <button className="text-blue-600 hover:text-blue-900 font-medium ml-3">
          Détails
        </button>
      </td>
    </tr>
  );
}