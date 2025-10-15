import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TransactionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const fetchTransaction = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTransaction(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!transaction) {
    return <div>Transaction non trouvée</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard?tab=transactions" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Retour aux transactions
        </Link>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Détails de la Transaction #{transaction.id}
            </h1>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informations Générales</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Référence</dt>
                    <dd className="text-sm text-gray-900">#{transaction.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date et Heure</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'depot' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'retrait' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Détails Financiers</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Montant</dt>
                    <dd className="text-2xl font-bold text-green-600">
                      {parseFloat(transaction.amount).toLocaleString()} XOF
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Frais</dt>
                    <dd className="text-sm text-gray-900">
                      {parseFloat(transaction.fee || 0).toLocaleString()} XOF
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Montant Net</dt>
                    <dd className="text-sm text-gray-900">
                      {parseFloat(transaction.net_amount || transaction.amount).toLocaleString()} XOF
                    </dd>
                  </div>
                  {transaction.interest_rate > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Taux d'intérêt</dt>
                      <dd className="text-sm text-gray-900">{transaction.interest_rate}%</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Expéditeur</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-mono text-sm">{transaction.from_wallet}</p>
                  {transaction.from_client_name && (
                    <p className="text-sm text-gray-600 mt-1">{transaction.from_client_name}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Destinataire</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-mono text-sm">{transaction.to_wallet}</p>
                  {transaction.to_client_name && (
                    <p className="text-sm text-gray-600 mt-1">{transaction.to_client_name}</p>
                  )}
                </div>
              </div>
            </div>

            {transaction.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900">{transaction.description}</p>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Créée par</h3>
                <p className="text-sm text-gray-900">{transaction.created_by_name || 'Système'}</p>
              </div>

              {transaction.validated_by_name && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Validée par</h3>
                  <p className="text-sm text-gray-900">{transaction.validated_by_name}</p>
                  <p className="text-xs text-gray-500">
                    le {new Date(transaction.validated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}