import { useState, useEffect } from 'react';

export default function DocumentGenerator({ user }) {
  const [activeTab, setActiveTab] = useState('visa');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportType, setReportType] = useState('transactions');
  const [loading, setLoading] = useState(false);

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

  const generateVisaCard = async () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/generate-card/${selectedClient}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carte_visa_${selectedClient}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // Notification de succès
        alert('Carte Visa générée avec succès!');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération de la carte');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      alert('Veuillez sélectionner une période');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: reportType,
          startDate: dateRange.start,
          endDate: dateRange.end
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_${reportType}_${dateRange.start}_${dateRange.end}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        alert('Rapport généré avec succès!');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  const generateClientStatement = async () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/generate-statement/${selectedClient}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startDate: dateRange.start,
          endDate: dateRange.end
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const clientName = clients.find(c => c.id == selectedClient)?.name || 'client';
        a.download = `releve_${clientName}_${dateRange.start}_${dateRange.end}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        alert('Relevé généré avec succès!');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération du relevé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Génération de Documents</h1>
        <p className="text-gray-600">Générez des cartes Visa, rapports et relevés clients</p>
      </div>

      {/* Navigation des types de documents */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'visa', label: 'Cartes Visa', icon: '🎫' },
              { id: 'reports', label: 'Rapports', icon: '📊' },
              { id: 'statements', label: 'Relevés Clients', icon: '📄' },
              { id: 'contracts', label: 'Contrats', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {activeTab === 'visa' && (
            <VisaCardGenerator
              clients={clients}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              onGenerate={generateVisaCard}
              loading={loading}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsGenerator
              dateRange={dateRange}
              setDateRange={setDateRange}
              reportType={reportType}
              setReportType={setReportType}
              onGenerate={generateReport}
              loading={loading}
            />
          )}

          {activeTab === 'statements' && (
            <StatementsGenerator
              clients={clients}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onGenerate={generateClientStatement}
              loading={loading}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsGenerator
              clients={clients}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les cartes Visa
function VisaCardGenerator({ clients, selectedClient, setSelectedClient, onGenerate, loading }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Génération de Carte Visa</h3>
            <p className="text-gray-600 mb-6">
              Générez une carte Visa personnalisée pour vos clients avec QR code et numéro de compte.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sélectionner un Client *
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choisir un client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.wallet_address}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Informations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Carte Visa personnalisée avec logo ADOUAS-MC</li>
              <li>• QR code contenant les informations du client</li>
              <li>• Numéro de compte et solde actuel</li>
              <li>• Design professionnel et sécurisé</li>
            </ul>
          </div>

          <button
            onClick={onGenerate}
            disabled={!selectedClient || loading}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <span>🎫</span>
                <span>Générer la Carte Visa</span>
              </>
            )}
          </button>
        </div>

        {/* Aperçu */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-blue-200 text-sm font-medium mb-1">ADOUAS-MC VISA</div>
                <div className="text-2xl font-bold">Micro Crédit Card</div>
              </div>
              <div className="text-right">
                <div className="text-blue-200 text-sm">Valide jusqu'au</div>
                <div className="text-lg font-semibold">12/25</div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-blue-200 text-sm mb-2">Titulaire de la carte</div>
              <div className="text-xl font-bold uppercase">
                {selectedClient ? 
                  clients.find(c => c.id == selectedClient)?.name.toUpperCase() || 'NOM DU CLIENT' 
                  : 'NOM DU CLIENT'
                }
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-blue-200 text-sm mb-2">Numéro de compte</div>
                <div className="font-mono text-lg tracking-wider">
                  {selectedClient ? 
                    clients.find(c => c.id == selectedClient)?.wallet_address.slice(0, 16) || 'XXXX XXXX XXXX XXXX'
                    : 'XXXX XXXX XXXX XXXX'
                  }
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-200 text-sm mb-2">QR Code</div>
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="text-2xl">📱</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Effets décoratifs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les rapports
function ReportsGenerator({ dateRange, setDateRange, reportType, setReportType, onGenerate, loading }) {
  const reportTypes = [
    { id: 'transactions', label: 'Rapport des Transactions', icon: '🔄', description: 'Toutes les transactions sur la période' },
    { id: 'loans', label: 'Rapport des Prêts', icon: '💰', description: 'État des prêts et remboursements' },
    { id: 'clients', label: 'Rapport des Clients', icon: '👥', description: 'Liste et statistiques clients' },
    { id: 'financial', label: 'Rapport Financier', icon: '📈', description: 'Bilan financier complet' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Génération de Rapports</h3>
        <p className="text-gray-600">
          Générez des rapports détaillés pour analyser l'activité de votre agence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de Rapport *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setReportType(type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    reportType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{type.icon}</div>
                    <div>
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-sm opacity-75">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Période */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={!dateRange.start || !dateRange.end || loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Génération du rapport...</span>
              </>
            ) : (
              <>
                <span>📊</span>
                <span>Générer le Rapport</span>
              </>
            )}
          </button>
        </div>

        {/* Aperçu du rapport */}
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300">
          <h4 className="font-semibold text-gray-900 mb-4">Aperçu du Rapport</h4>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium capitalize">
                {reportTypes.find(t => t.id === reportType)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Période:</span>
              <span className="font-medium">
                {dateRange.start ? new Date(dateRange.start).toLocaleDateString() : '--'} 
                {' au '}
                {dateRange.end ? new Date(dateRange.end).toLocaleDateString() : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="font-medium">PDF Professionnel</span>
            </div>
            <div className="flex justify-between">
              <span>Contenu:</span>
              <span className="font-medium text-right">
                {reportType === 'transactions' && 'Liste détaillée des transactions\nGraphiques et statistiques'}
                {reportType === 'loans' && 'État des prêts actifs\nHistorique des remboursements'}
                {reportType === 'clients' && 'Liste complète des clients\nStatistiques par segment'}
                {reportType === 'financial' && 'Bilan financier\nTableaux de bord détaillés'}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>📋 En-tête avec logo ADOUAS-MC</div>
              <div>📊 Tableaux et graphiques</div>
              <div>🔢 Chiffres et statistiques</div>
              <div>📅 Période couverte</div>
              <div>👤 Informations de l'agence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les relevés clients
function StatementsGenerator({ clients, selectedClient, setSelectedClient, dateRange, setDateRange, onGenerate, loading }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relevés Clients</h3>
        <p className="text-gray-600">
          Générez des relevés détaillés pour vos clients avec leur historique de transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Sélection du client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sélectionner un Client *
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choisir un client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.wallet_address}
                </option>
              ))}
            </select>
          </div>

          {/* Période */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Contenu du Relevé</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Informations client complètes</li>
              <li>• Solde actuel du wallet</li>
              <li>• Historique des transactions</li>
              <li>• Détails des prêts et remboursements</li>
              <li>• Signature et cachet de l'agence</li>
            </ul>
          </div>

          <button
            onClick={onGenerate}
            disabled={!selectedClient || loading}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>Générer le Relevé</span>
              </>
            )}
          </button>
        </div>

        {/* Aperçu du relevé */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-gray-900">ADOUAS-MC</div>
            <div className="text-sm text-gray-600">Relevé de Compte Client</div>
          </div>

          {selectedClient ? (
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <div className="font-semibold text-gray-900">
                  {clients.find(c => c.id == selectedClient)?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {clients.find(c => c.id == selectedClient)?.wallet_address}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Période</div>
                  <div className="font-medium">
                    {dateRange.start ? new Date(dateRange.start).toLocaleDateString() : 'Début'} - 
                    {dateRange.end ? new Date(dateRange.end).toLocaleDateString() : 'Aujourd\'hui'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Date d'émission</div>
                  <div className="font-medium">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center text-sm text-gray-600">
                  Historique des transactions et solde actuel
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 text-xs text-gray-500 text-center">
                Document officiel ADOUAS-MC - Micro Crédit
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📄</div>
              <p>Sélectionnez un client pour voir l'aperçu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les contrats
function ContractsGenerator({ clients, selectedClient, setSelectedClient, loading }) {
  const generateContract = async (type) => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/generate-contract/${selectedClient}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const clientName = clients.find(c => c.id == selectedClient)?.name || 'client';
        a.download = `contrat_${type}_${clientName}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        alert('Contrat généré avec succès!');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération du contrat');
    }
  };

  const contractTypes = [
    {
      id: 'pret',
      label: 'Contrat de Prêt',
      icon: '💰',
      description: 'Contrat standard pour octroi de prêt',
      color: 'blue'
    },
    {
      id: 'renouvellement',
      label: 'Avenant de Renouvellement',
      icon: '🔄',
      description: 'Pour renouvellement de prêt existant',
      color: 'green'
    },
    {
      id: 'echeancier',
      label: 'Échéancier de Paiement',
      icon: '📅',
      description: 'Calendrier de remboursement détaillé',
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
  {/* En-tête */}
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Génération de Documents</h1>
    <p className="text-gray-600">Générez des cartes Visa, rapports et relevés clients</p>
  </div>

  {/* Navigation des types de documents */} 

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Sélection du client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sélectionner un Client *
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choisir un client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.wallet_address}
                </option>
              ))}
            </select>
          </div>

          {/* Types de contrats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de Document *
            </label>
            <div className="space-y-3">
              {contractTypes.map((contract) => (
                <button
                  key={contract.id}
                  onClick={() => generateContract(contract.id)}
                  disabled={!selectedClient || loading}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    contract.color === 'blue' ? 'border-blue-200 hover:border-blue-300' :
                    contract.color === 'green' ? 'border-green-200 hover:border-green-300' :
                    'border-purple-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{contract.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{contract.label}</div>
                      <div className="text-sm text-gray-600">{contract.description}</div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Informations légales */}
        <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-4">Informations Légales</h4>
          <div className="space-y-3 text-sm text-yellow-800">
            <div className="flex items-start space-x-2">
              <span>⚖️</span>
              <span>Tous les contrats sont conformes à la réglementation des micro-crédits</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>📋</span>
              <span>Incluent les clauses légales obligatoires</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>🔒</span>
              <span>Protection des données client conformément à la loi</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>📞</span>
              <span>Service client et médiation inclus</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-yellow-300">
            <div className="text-xs text-yellow-700">
              <strong>Important:</strong> Tous les documents générés portent le cachet officiel 
              d'ADOUAS-MC et sont des documents légaux opposables.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}