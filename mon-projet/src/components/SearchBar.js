import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length > 2) {
      searchData();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const searchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
  };

  const handleResultClick = (item) => {
    setQuery('');
    setShowResults(false);
    
    if (item.type === 'client') {
      router.push(`/clients/${item.id}`);
    } else if (item.type === 'transaction') {
      // Naviguer vers les transactions
      router.push('/dashboard?tab=transactions');
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher clients, transactions..."
          className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="ml-2 p-2 text-gray-600 hover:text-gray-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((item, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(item)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{item.name || item.title}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.type === 'client' ? 'bg-blue-100 text-blue-800' :
                  item.type === 'transaction' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}