import { useState } from 'react';

export default function BalanceChecker() {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkBalance = async (e) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;

    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/wallet/balance/${walletAddress}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      } else {
        const error = await response.json();
        alert(error.error);
        setBalance(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Vérificateur de Solde</h3>
      <form onSubmit={checkBalance} className="flex space-x-4">
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Entrez l'adresse du wallet"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </button>
      </form>
      
      {balance !== null && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <p className="text-green-800">
            <strong>Solde:</strong> {parseFloat(balance).toLocaleString()} XOF
          </p>
        </div>
      )}
    </div>
  );
}