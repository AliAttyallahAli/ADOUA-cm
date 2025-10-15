import { useState, useEffect } from 'react';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, user }) {
  const menuItems = [
    { id: 'overview', label: 'Aperçu', icon: '📊', roles: ['admin', 'chef_operation', 'caissier', 'agent'] },
    { id: 'clients', label: 'Clients', icon: '👥', roles: ['admin', 'chef_operation', 'caissier', 'agent'] },
    { id: 'transactions', label: 'Transactions', icon: '🔄', roles: ['admin', 'chef_operation', 'caissier', 'agent'] },
    { id: 'loans', label: 'Prêts', icon: '💰', roles: ['admin', 'chef_operation', 'caissier'] },
    { id: 'users', label: 'Utilisateurs', icon: '👨‍💼', roles: ['admin', 'chef_operation'] },
    { id: 'documents', label: 'Documents', icon: '🎫', roles: ['admin', 'chef_operation', 'caissier', 'agent'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  useEffect(() => {
    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('tabChange', handleTabChange);
    return () => window.removeEventListener('tabChange', handleTabChange);
  }, [setActiveTab]);

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">
              AM
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ADOUAS-MC</h1>
              <p className="text-xs text-gray-500">Micro Crédit</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}