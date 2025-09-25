import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { Button } from '../ui/Button';
import { LogOut, User, Settings, ChevronDown, Shield, Bell } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fermer le dropdown quand on navigue
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'family': return 'Famille';
      case 'authority': return 'Autorité';
      case 'volunteer': return 'Bénévole';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'family': return 'bg-blue-100 text-blue-800';
      case 'authority': return 'bg-red-100 text-red-800';
      case 'volunteer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton du menu utilisateur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl p-2 group"
      >
        <UserAvatar size="md" showIndicator={true} />
        <div className="hidden sm:block text-left">
          <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-xs text-gray-500">
            {user?.email}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-all duration-200 ${isOpen ? 'rotate-180 text-primary-600' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-strong border border-gray-200 focus:outline-none z-50 animate-slide-down">
          <div className="py-2">
            {/* En-tête avec info utilisateur */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <UserAvatar size="lg" showIndicator={true} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleLabel(user?.role || '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Liens de navigation */}
            <div className="py-2">
              <Link
                to="/profil"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary-600 transition-colors" />
                <span className="group-hover:text-primary-600 transition-colors">Mon Profil</span>
              </Link>

              <Link
                to="/profil"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary-600 transition-colors" />
                <span className="group-hover:text-primary-600 transition-colors">Paramètres</span>
              </Link>

              <Link
                to="/rapports"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                <Bell className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary-600 transition-colors" />
                <span className="group-hover:text-primary-600 transition-colors">Mes Alertes</span>
              </Link>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-100 my-2"></div>

            {/* Bouton de déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="h-4 w-4 mr-3 group-hover:text-red-700 transition-colors" />
              <span className="group-hover:text-red-700 transition-colors">Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
