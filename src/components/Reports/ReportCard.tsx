import React from 'react';
import { Link } from 'react-router-dom';
import { MissingPerson } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MapPin, Calendar, User, Share, Eye, Clock } from 'lucide-react';
import { CaseTypeBadge } from '../ui/CaseTypeBadge';

interface ReportCardProps {
  report: MissingPerson;
  variant?: 'default' | 'compact' | 'detailed';
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, variant = 'default' }) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Disparition: ${report.firstName} ${report.lastName}`,
          text: `Aidez à retrouver ${report.firstName} ${report.lastName}, vu pour la dernière fois à ${report.locationDisappeared.city}`,
          url: window.location.origin + `/rapports/${report.id}`
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const url = window.location.origin + `/rapports/${report.id}`;
    navigator.clipboard.writeText(url);
  };

  const daysSinceMissing = Math.floor(
    (new Date().getTime() - new Date(report.dateDisappeared).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (variant === 'compact') {
    return (
      <Link to={`/rapports/${report.id}`}>
        <Card variant="elevated" className="hover:shadow-strong transition-all duration-300 group cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {report.photo ? (
                <img
                  src={report.photo}
                  alt={`${report.firstName} ${report.lastName}`}
                  className="w-16 h-16 object-cover rounded-xl shadow-soft"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shadow-soft">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {report.firstName} {report.lastName}
                  </h3>
                  <div className="flex items-center gap-1">
                    <CaseTypeBadge 
                      caseType={report.caseType} 
                      priority={report.priority}
                      isEmergency={report.isEmergency}
                      className="text-xs"
                    />
                    <Badge variant={report.status === 'active' ? 'error' : 'success'} size="sm">
                      {report.status === 'active' ? 'Disparu' : 'Retrouvé'}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {report.age} ans • {report.locationDisappeared.city}
                </p>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Disparu le {new Date(report.dateDisappeared).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/rapports/${report.id}`}>
      <Card variant="cyber" className="h-full hover:shadow-neon-green transition-all duration-300 group cursor-pointer" glow>
        <CardContent className="p-0">
          <div className="flex flex-col h-full">
            {/* Image futuriste */}
            <div className="relative aspect-square bg-gradient-to-br from-dark-800 to-dark-700 rounded-t-2xl overflow-hidden border-b border-neon-green/30">
              {/* Effet de scan en arrière-plan */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-2000"></div>
              
              {report.photo ? (
                <img
                  src={report.photo}
                  alt={`${report.firstName} ${report.lastName}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-dark-900 relative z-10"
                  style={{ backgroundColor: "#0a0a0a" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-neon-green/20 rounded-full blur-lg"></div>
                    <User className="h-20 w-20 text-neon-green relative z-10" />
                  </div>
                </div>
              )}
              
              {/* Badge de statut futuriste */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 relative z-20">
                <CaseTypeBadge 
                  caseType={report.caseType} 
                  priority={report.priority}
                  isEmergency={report.isEmergency}
                />
                <Badge 
                  variant={report.status === 'active' ? 'error' : 'success'} 
                  size="sm"
                  glow={report.status === 'active'}
                  pulse={report.isEmergency}
                >
                  {report.status === 'active' ? 'DISPARU' : 'RETROUVÉ'}
                </Badge>
              </div>

              {/* Badge nombre de jours futuriste */}
              {daysSinceMissing > 0 && (
                <div className="absolute bottom-4 left-4 relative z-20">
                  <div className="bg-dark-900/90 text-neon-green px-3 py-1 rounded-lg text-sm font-mono font-bold backdrop-blur-sm border border-neon-green/30">
                    {daysSinceMissing} J{daysSinceMissing !== 1 ? 'S' : ''}
                  </div>
                </div>
              )}

              {/* Overlay futuriste */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
              
              {/* Lignes de données */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scan-line"></div>
                <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-scan-line" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
            
            {/* Content futuriste */}
            <div className="p-6 flex-1 flex flex-col bg-dark-800/30">
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl text-white group-hover:text-neon-green transition-colors mb-3 tracking-wider">
                  {report.firstName} {report.lastName}
                </h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-dark-300 font-mono">
                    <User className="h-4 w-4 mr-3 text-neon-blue" />
                    <span>{report.age} ANS • {report.gender.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-dark-300 font-mono">
                    <MapPin className="h-4 w-4 mr-3 text-neon-green" />
                    <span>{report.locationDisappeared.city.toUpperCase()}, {report.locationDisappeared.state.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-dark-300 font-mono">
                    <Calendar className="h-4 w-4 mr-3 text-neon-purple" />
                    <span>DISPARU LE {new Date(report.dateDisappeared).toLocaleDateString('fr-FR').toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600/30">
                  <p className="text-sm text-dark-200 line-clamp-3 leading-relaxed font-mono">
                    {report.description}
                  </p>
                </div>
              </div>
              
              {/* Actions futuristes */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-xs text-dark-400 font-mono">
                  ID: {report.id.slice(0, 8).toUpperCase()}...
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="cyber"
                    onClick={handleShare}
                    className="flex items-center space-x-1"
                  >
                    <Share className="h-4 w-4" />
                    <span>PARTAGER</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="neon"
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>VOIR</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};