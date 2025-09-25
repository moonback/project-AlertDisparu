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
    <header className="glass-nav sticky top-0 z-50 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Search className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors animate-glow" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full animate-pulse shadow-brand-glow"></div>
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
                className={`glass-nav-item flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/rapports') ? 'active' : ''
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Rapports</span>
              </Link>
              
              <Link
                to="/carte"
                className={`glass-nav-item flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/carte') ? 'active' : ''
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Carte</span>
              </Link>
              
              <Link
                to="/mes-alertes"
                className={`glass-nav-item flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/mes-alertes') ? 'active' : ''
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Mes Alertes</span>
              </Link>
              
              <Link
                to="/signalement"
                className="glass-button flex items-center space-x-2 px-4 py-2 text-sm font-medium"
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
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/20 transition-colors glass-nav-item"
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
          <div className="lg:hidden border-t border-white/20 glass-nav">
            <nav className="py-4 space-y-2">
              <Link
                to="/rapports"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`glass-nav-item flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActiveRoute('/rapports') ? 'active' : ''
                }`}
              >
                <Search className="h-5 w-5" />
                <span>Rechercher les rapports</span>
              </Link>
              
              <Link
                to="/carte"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`glass-nav-item flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActiveRoute('/carte') ? 'active' : ''
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span>Vue carte</span>
              </Link>
              
              <Link
                to="/mes-alertes"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`glass-nav-item flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActiveRoute('/mes-alertes') ? 'active' : ''
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Mes Alertes</span>
              </Link>
              
              <Link
                to="/signalement"
                onClick={() => setIsMobileMenuOpen(false)}
                className="glass-button flex items-center space-x-3 px-4 py-3 text-sm font-medium mx-4"
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