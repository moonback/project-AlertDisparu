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
        <Card variant="glass" className="hover:shadow-brand-glow transition-all duration-300 group cursor-pointer">
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
      <Card variant="glass" className="h-full hover:shadow-brand-glow transition-all duration-300 group cursor-pointer">
        <CardContent className="p-0">
          <div className="flex flex-col h-full">
            {/* Image */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
              {report.photo ? (
                <img
                  src={report.photo}
                  alt={`${report.firstName} ${report.lastName}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-white"
                  style={{ backgroundColor: "#fff" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-20 w-20 text-gray-400" />
                </div>
              )}
              
              {/* Badge de statut */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <CaseTypeBadge 
                  caseType={report.caseType} 
                  priority={report.priority}
                  isEmergency={report.isEmergency}
                />
                <Badge variant={report.status === 'active' ? 'error' : 'success'} size="sm">
                  {report.status === 'active' ? 'Disparu' : 'Retrouvé'}
                </Badge>
              </div>

              {/* Badge nombre de jours */}
              {daysSinceMissing > 0 && (
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
                    {daysSinceMissing} jour{daysSinceMissing !== 1 ? 's' : ''}
                  </div>
                </div>
              )}

              {/* Overlay dégradé */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  {report.firstName} {report.lastName}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{report.age} ans • {report.gender}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{report.locationDisappeared.city}, {report.locationDisappeared.state}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Disparu le {new Date(report.dateDisappeared).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                  {report.description}
                </p>
              </div>
              
              {/* Actions */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  ID: {report.id.slice(0, 8)}...
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleShare}
                    className="flex items-center space-x-1"
                  >
                    <Share className="h-4 w-4" />
                    <span>Partager</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Voir</span>
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