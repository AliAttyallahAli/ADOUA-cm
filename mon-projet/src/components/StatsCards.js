import { useState, useEffect } from 'react';

export default function StatsCards({ stats }) {
  const [statCards, setStatCards] = useState([]);

  useEffect(() => {
    // S'assurer que les données sont correctement formatées
    const formattedStats = [
      {
        title: 'Solde Principal',
        value: `1,000,000,000 XOF`, // Valeur fixe comme spécifié
        change: '+2.5%',
        trend: 'up',
        icon: '💰',
        color: 'green'
      },
      {
        title: 'Transactions en attente',
        value: stats?.pendingTransactions?.toString() || '12',
        change: '+3',
        trend: 'up',
        icon: '⏳',
        color: 'yellow'
      },
      {
        title: 'Prêts Actifs',
        value: stats?.activeLoans?.toString() || '45',
        change: '+5%',
        trend: 'up',
        icon: '📊',
        color: 'blue'
      },
      {
        title: 'Clients Totals',
        value: stats?.totalClients?.toString() || '128',
        change: '+8',
        trend: 'up',
        icon: '👥',
        color: 'purple'
      }
    ];
    setStatCards(formattedStats);
  }, [stats]);

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
      blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
      purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
    };
    return colors[color] || colors.blue;
  };

  // Vérifier si statCards est un tableau avant de mapper
  if (!Array.isArray(statCards)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${getColorClasses(stat.color)} rounded-2xl border-2 p-6 transition-transform hover:scale-105 duration-200`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {/* S'assurer que value est une string */}
                {typeof stat.value === 'string' ? stat.value : JSON.stringify(stat.value)}
              </p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
          <div className={`flex items-center text-sm font-medium ${
            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{stat.change}</span>
            <span className="ml-1">ce mois</span>
          </div>
        </div>
      ))}
    </div>
  );
}