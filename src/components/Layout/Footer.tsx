import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <Search className="h-8 w-8 text-primary-400" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
              <span className="font-bold text-xl">AlertDisparu</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Une plateforme sécurisée et conforme RGPD pour aider à retrouver les personnes disparues 
              en connectant familles, autorités et communautés.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Shield className="h-4 w-4" />
              <span>Conforme RGPD • Sécurisé • Fiable</span>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/rapports" className="text-gray-300 hover:text-white transition-colors">
                  Rechercher les rapports
                </Link>
              </li>
              <li>
                <Link to="/signalement" className="text-gray-300 hover:text-white transition-colors">
                  Signaler une disparition
                </Link>
              </li>
              <li>
                <Link to="/carte" className="text-gray-300 hover:text-white transition-colors">
                  Vue carte
                </Link>
              </li>
              <li>
                <Link to="/profil" className="text-gray-300 hover:text-white transition-colors">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact et urgence */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">contact@alertdisparu.fr</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">Support technique</span>
              </div>
            </div>
            
            
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 AlertDisparu. Tous droits réservés.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Conditions d'utilisation
              </Link>
              <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                Aide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
