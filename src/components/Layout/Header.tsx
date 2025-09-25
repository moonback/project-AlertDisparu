import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { UserMenu } from './UserMenu';
import { Search, MapPin, Menu, X, AlertTriangle, Shield, Activity, Zap } from 'lucide-react';

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
    <header className="bg-dark-900/95 backdrop-blur-xl border-b border-dark-700/50 sticky top-0 z-50 shadow-dark-glass">
      {/* Ligne de scan futuriste */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-scan-line"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo futuriste */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-lg animate-pulse"></div>
              <Shield className="h-8 w-8 text-neon-blue group-hover:text-neon-cyan transition-colors relative z-10" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-system-error rounded-full animate-neon-flicker"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-white group-hover:text-neon-blue transition-colors">
                AlertDisparu
              </span>
              <span className="text-xs text-dark-400 font-mono tracking-wider">
                COMMAND CENTER
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation futuriste */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1 bg-dark-800/50 backdrop-blur-sm rounded-2xl p-1 border border-dark-600/30">
              <Link
                to="/rapports"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium font-display transition-all duration-300 relative ${
                  isActiveRoute('/rapports')
                    ? 'text-neon-blue bg-neon-blue/10 border border-neon-blue/30 shadow-neon-blue'
                    : 'text-dark-200 hover:text-neon-cyan hover:bg-dark-700/50 border border-transparent'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>RAPPORTS</span>
                {isActiveRoute('/rapports') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 rounded-xl"></div>
                )}
              </Link>
              
              <Link
                to="/carte"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium font-display transition-all duration-300 relative ${
                  isActiveRoute('/carte')
                    ? 'text-neon-green bg-neon-green/10 border border-neon-green/30 shadow-neon-green'
                    : 'text-dark-200 hover:text-neon-green hover:bg-dark-700/50 border border-transparent'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>CARTE</span>
                {isActiveRoute('/carte') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-neon-blue/5 rounded-xl"></div>
                )}
              </Link>
              
              <Link
                to="/mes-alertes"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium font-display transition-all duration-300 relative ${
                  isActiveRoute('/mes-alertes')
                    ? 'text-system-warning bg-system-warning/10 border border-system-warning/30 shadow-neon-amber'
                    : 'text-dark-200 hover:text-system-warning hover:bg-dark-700/50 border border-transparent'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>ALERTES</span>
                {isActiveRoute('/mes-alertes') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-system-warning/5 to-system-error/5 rounded-xl"></div>
                )}
              </Link>
              
              <Link
                to="/signalement"
                className="flex items-center space-x-2 bg-gradient-to-r from-system-error to-neon-red text-white px-4 py-2 rounded-xl text-sm font-medium font-display hover:from-red-600 hover:to-system-error transition-all duration-300 shadow-neon-red border border-system-error/30 transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                <Zap className="h-4 w-4 relative z-10" />
                <span className="relative z-10">SIGNALER</span>
              </Link>
            </nav>
          )}
          
          {/* Right side futuriste */}
          <div className="flex items-center space-x-3">
            {/* Indicateur de statut système */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-dark-800/50 rounded-lg border border-dark-600/30">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-system-success rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-dark-300">SYS</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3 text-neon-blue" />
                <span className="text-xs font-mono text-dark-300">ONLINE</span>
              </div>
            </div>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link to="/connexion">
                  <Button variant="glass" size="sm">CONNEXION</Button>
                </Link>
                <Link to="/inscription">
                  <Button variant="neon" size="sm" glow>INSCRIPTION</Button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button futuriste */}
            {isAuthenticated && (
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-xl text-dark-300 hover:text-neon-blue hover:bg-dark-800/50 transition-colors border border-dark-600/30"
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
        
        {/* Mobile Navigation futuriste */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-dark-700/50 bg-dark-900/95 backdrop-blur-xl">
            <nav className="py-4 space-y-2 px-4">
              <Link
                to="/rapports"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium font-display transition-colors border ${
                  isActiveRoute('/rapports')
                    ? 'text-neon-blue bg-neon-blue/10 border-neon-blue/30'
                    : 'text-dark-200 hover:text-neon-cyan hover:bg-dark-800/50 border-dark-600/30'
                }`}
              >
                <Search className="h-5 w-5" />
                <span>RECHERCHER LES RAPPORTS</span>
              </Link>
              
              <Link
                to="/carte"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium font-display transition-colors border ${
                  isActiveRoute('/carte')
                    ? 'text-neon-green bg-neon-green/10 border-neon-green/30'
                    : 'text-dark-200 hover:text-neon-green hover:bg-dark-800/50 border-dark-600/30'
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span>VUE CARTE</span>
              </Link>
              
              <Link
                to="/mes-alertes"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium font-display transition-colors border ${
                  isActiveRoute('/mes-alertes')
                    ? 'text-system-warning bg-system-warning/10 border-system-warning/30'
                    : 'text-dark-200 hover:text-system-warning hover:bg-dark-800/50 border-dark-600/30'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
                <span>MES ALERTES</span>
              </Link>
              
              <Link
                to="/signalement"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 bg-gradient-to-r from-system-error to-neon-red text-white px-4 py-3 rounded-xl text-sm font-medium font-display hover:from-red-600 hover:to-system-error transition-colors border border-system-error/30 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                <Zap className="h-5 w-5 relative z-10" />
                <span className="relative z-10">SIGNALER UNE DISPARITION</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};