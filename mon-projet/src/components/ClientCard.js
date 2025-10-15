import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ClientCard({ client }) {
  const [showActions, setShowActions] = useState(false);
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/clients/${client.id}`);
  };

  const handleGenerateCard = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/documents/generate-card/${client.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carte_${client.name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {client.photo ? (
              <img
                src={client.photo}
                alt={client.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
              <p className="text-sm text-gray-500">{client.email}</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={handleViewDetails}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Voir détails
                  </button>
                  <button
                    onClick={handleGenerateCard}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Générer carte
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Historique
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Téléphone:</span>
            <p className="font-medium">{client.phone}</p>
          </div>
          <div>
            <span className="text-gray-500">Wallet:</span>
            <p className="font-mono text-xs">{client.wallet_address}</p>
          </div>
          <div>
            <span className="text-gray-500">Solde:</span>
            <p className="font-semibold text-green-600">
              {parseFloat(client.balance || 0).toLocaleString()} XOF
            </p>
          </div>
          <div>
            <span className="text-gray-500">CIN:</span>
            <p className="font-medium">{client.cin}</p>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
          >
            Voir Profil
          </button>
          <button
            onClick={() => router.push(`/dashboard?tab=transactions&client=${client.id}`)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm"
          >
            Transactions
          </button>
        </div>
      </div>
    </div>
  );
}