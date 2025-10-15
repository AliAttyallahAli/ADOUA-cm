import { useState, useEffect } from 'react';

export default function ClientDetails({ client, onClose, onUpdate, user }) {
  const [activeTab, setActiveTab] = useState('info');
  const [clientLoans, setClientLoans] = useState([]);
  const [clientTransactions, setClientTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchClientData();
  }, [client.id]);

  const fetchClientData = async () => {
    const token = localStorage.getItem('token');
    
    // Récupérer les prêts du client
    try {
      const loansResponse = await fetch(`http://localhost:5000/api/clients/${client.id}/loans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (loansResponse.ok) {
        const loansData = await loansResponse.json();
        setClientLoans(loansData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }

    // Récupérer les transactions du client
    try {
      const transactionsResponse = await fetch(`http://localhost:5000/api/clients/${client.id}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setClientTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }

    // Récupérer le solde du wallet
    try {
      const walletResponse = await fetch(`http://localhost:5000/api/wallets/${client.wallet_address}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWalletBalance(walletData.balance);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const generateVisaCard = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/generate-card/${client.id}`, {
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
    }
  };

  const totalLoansAmount = clientLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
  const totalPaid = clientLoans.reduce((sum, loan) => sum + parseFloat(loan.paid_amount), 0);
  const totalRemaining = clientLoans.reduce((sum, loan) => sum + parseFloat(loan.remaining_amount), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {client.photo ? (
                <img
                  src={client.photo}
                  alt={client.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {client.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                <p className="text-gray-600">{client.email}</p>
              </div>
            </div>
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

        {/* Navigation tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['info', 'prets', 'transactions', 'wallet'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'info' && 'Informations'}
                {tab === 'prets' && `Prêts (${clientLoans.length})`}
                {tab === 'transactions' && `Transactions (${clientTransactions.length})`}
                {tab === 'wallet' && 'Portefeuille'}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'info' && <ClientInfoTab client={client} />}
          {activeTab === 'prets' && <ClientLoansTab loans={clientLoans} />}
          {activeTab === 'transactions' && <ClientTransactionsTab transactions={clientTransactions} />}
          {activeTab === 'wallet' && (
            <ClientWalletTab 
              client={client} 
              balance={walletBalance}
              onGenerateCard={generateVisaCard}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Client depuis {new Date(client.created_at).toLocaleDateString()}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generateVisaCard}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
              >
                <span>🎫</span>
                <span>Générer Carte</span>
              </button>
              {(user.role === 'admin' || user.role === 'chef_operation') && (
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Modifier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientInfoTab({ client }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>
          <div className="space-y-3">
            <InfoRow label="Nom Complet" value={client.name} />
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Téléphone" value={client.phone} />
            <InfoRow label="CIN" value={client.cin} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">{client.address || 'Aucune adresse renseignée'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet</h3>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="font-mono text-sm text-blue-800 break-all">{client.wallet_address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientLoansTab({ loans }) {
  if (loans.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">💰</div>
        <p>Aucun prêt pour ce client</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <div key={loan.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">Prêt #{loan.id}</h4>
              <p className="text-sm text-gray-500">
                Créé le {new Date(loan.start_date).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {loan.status === 'active' ? 'Actif' : 'Terminé'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Montant initial</p>
              <p className="font-semibold">{parseFloat(loan.amount).toLocaleString()} XOF</p>
            </div>
            <div>
              <p className="text-gray-500">Taux d'intérêt</p>
              <p className="font-semibold">{loan.interest_rate}%</p>
            </div>
            <div>
              <p className="text-gray-500">Payé</p>
              <p className="font-semibold text-green-600">{parseFloat(loan.paid_amount).toLocaleString()} XOF</p>
            </div>
            <div>
              <p className="text-gray-500">Reste</p>
              <p className="font-semibold text-orange-600">{parseFloat(loan.remaining_amount).toLocaleString()} XOF</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progression</span>
              <span>{Math.round((loan.paid_amount / loan.total_amount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(loan.paid_amount / loan.total_amount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientTransactionsTab({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🔄</div>
        <p>Aucune transaction pour ce client</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              transaction.type === 'depot' ? 'bg-green-100 text-green-600' :
              transaction.type === 'retrait' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {transaction.type === 'depot' ? '📥' :
               transaction.type === 'retrait' ? '📤' : '🔄'}
            </div>
            <div>
              <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
              <p className="text-sm text-gray-500">
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${
              transaction.type === 'depot' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'depot' ? '+' : '-'}{parseFloat(transaction.amount).toLocaleString()} XOF
            </p>
            <p className="text-sm text-gray-500">{transaction.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientWalletTab({ client, balance, onGenerateCard }) {
  return (
    <div className="space-y-6">
      {/* Carte Visa virtuelle */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-200 text-sm">ADOUAS-MC VISA</p>
            <p className="text-2xl font-bold mt-2">{client.name.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Solde</p>
            <p className="text-2xl font-bold">{balance.toLocaleString()} XOF</p>
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-blue-200 text-sm mb-1">Numéro de compte</p>
            <p className="font-mono text-lg">{client.wallet_address}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Valide jusqu'au</p>
            <p className="text-lg font-semibold">12/25</p>
          </div>
        </div>
      </div>

      {/* Actions du wallet */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onGenerateCard}
          className="bg-white border-2 border-green-200 rounded-xl p-4 text-center hover:border-green-300 transition-colors group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎫</div>
          <p className="font-semibold text-green-700">Générer Carte</p>
          <p className="text-sm text-green-600">PDF avec QR Code</p>
        </button>

        <button className="bg-white border-2 border-blue-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
          <p className="font-semibold text-blue-700">Historique</p>
          <p className="text-sm text-blue-600">Toutes transactions</p>
        </button>
      </div>

      {/* Détails du wallet */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Détails du Wallet</h4>
        <div className="space-y-2 text-sm">
          <InfoRow label="Adresse Wallet" value={client.wallet_address} />
          <InfoRow label="Type" value="Client" />
          <InfoRow label="Statut" value="Actif" />
          <InfoRow label="Date de création" value={new Date(client.created_at).toLocaleDateString()} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}