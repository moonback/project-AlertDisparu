import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { UserMenu } from './UserMenu';
import { Search, MapPin, Menu, X, AlertTriangle } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Search className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
            <span className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors">
              AlertDisparu
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/rapports"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/rapports')
                    ? 'text-primary-600 bg-primary-50 shadow-soft'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Rapports</span>
              </Link>
              
              <Link
                to="/carte"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/carte')
                    ? 'text-primary-600 bg-primary-50 shadow-soft'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Carte</span>
              </Link>
              
              <Link
                to="/signalement"
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-all duration-200 shadow-soft hover:shadow-medium transform hover:scale-105"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Signaler</span>
              </Link>
            </nav>
          )}
          
          {/* Right side */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link to="/connexion">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link to="/inscription">
                  <Button size="sm">Inscription</Button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <nav className="py-4 space-y-2">
              <Link
                to="/rapports"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActiveRoute('/rapports')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Search className="h-5 w-5" />
                <span>Rechercher les rapports</span>
              </Link>
              
              <Link
                to="/carte"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActiveRoute('/carte')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span>Vue carte</span>
              </Link>
              
              <Link
                to="/signalement"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 bg-primary-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors mx-4"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Signaler une disparition</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};