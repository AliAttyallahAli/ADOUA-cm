export default function RecentTransactions({ transactions }) {
  // S'assurer que transactions est un tableau
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const getTransactionIcon = (type) => {
    const icons = {
      transfert: '🔄',
      pret: '💰',
      remboursement: '📥',
      depot: '💳'
    };
    return icons[type] || '⚡';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  if (safeTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📝</div>
        <p>Aucune transaction récente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {safeTransactions.slice(0, 5).map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="text-2xl">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <p className="font-medium text-gray-900 capitalize">
                {transaction.type || 'Transaction'}
              </p>
              <p className="text-sm text-gray-500">
                De {(transaction.from_wallet || '').slice(0, 8)}...
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {parseFloat(transaction.amount || 0).toLocaleString()} XOF
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
              {transaction.status === 'completed' ? 'Complété' : 
               transaction.status === 'pending' ? 'En attente' : 'Annulé'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}