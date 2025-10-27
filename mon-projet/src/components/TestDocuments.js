import { useState } from 'react';

export default function TestDocuments() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testDocuments = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test-documents');
      const data = await response.json();
      setMessage(`✅ ${data.message}\nEndpoints disponibles:\n${data.endpoints.join('\n')}`);
    } catch (error) {
      setMessage('❌ Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test des Documents</h3>
      <button
        onClick={testDocuments}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Test en cours...' : 'Tester la connexion'}
      </button>
      
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <pre className="text-sm whitespace-pre-wrap">{message}</pre>
        </div>
      )}
    </div>
  );
}