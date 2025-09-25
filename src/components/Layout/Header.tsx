import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { UserMenu } from './UserMenu';
import { Search, MapPin } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Search className="h-8 w-8 text-red-600" />
              <span className="font-bold text-xl text-gray-900">AlertDisparu</span>
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-6">
                <Link
                  to="/rapports"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute('/rapports')
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>Rechercher les rapports</span>
                </Link>
                
                <Link
                  to="/carte"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActiveRoute('/carte')
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Vue carte</span>
                </Link>
                
                <Link
                  to="/signalement"
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Signaler une disparition
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/connexion">
                  <Button variant="outline" size="sm">Connexion</Button>
                </Link>
                <Link to="/inscription">
                  <Button size="sm">Inscription</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};