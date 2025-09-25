import React from 'react';
import { Link } from 'react-router-dom';
import { MissingPerson } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Calendar, User, Share } from 'lucide-react';

interface ReportCardProps {
  report: MissingPerson;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Missing: ${report.firstName} ${report.lastName}`,
          text: `Help find ${report.firstName} ${report.lastName}, last seen in ${report.locationDisappeared.city}`,
          url: window.location.origin + `/rapports/${report.id}`
        });
      } catch (err) {
        // Fallback to copying to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const url = window.location.origin + `/rapports/${report.id}`;
    navigator.clipboard.writeText(url);
    // In a real app, you'd show a toast notification here
  };

  const daysSinceMissing = Math.floor(
    (new Date().getTime() - new Date(report.dateDisappeared).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link to={`/rapports/${report.id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-200 group cursor-pointer">
        <CardContent className="p-0">
          <div className="flex flex-col h-full">
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              {report.photo ? (
                <img
                  src={report.photo}
                  alt={`${report.firstName} ${report.lastName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === 'active' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {report.status === 'active' ? 'Missing' : 'Found'}
                </span>
              </div>

              {/* Days missing badge */}
              {daysSinceMissing > 0 && (
                <div className="absolute bottom-3 left-3">
                  <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {daysSinceMissing} day{daysSinceMissing !== 1 ? 's' : ''} ago
                  </span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
                  {report.firstName} {report.lastName}
                </h3>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{report.age} years old • {report.gender}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{report.locationDisappeared.city}, {report.locationDisappeared.state}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(report.dateDisappeared).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="mt-3 text-sm text-gray-700 line-clamp-2">
                  {report.description}
                </p>
              </div>
              
              {/* Actions */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  ID: {report.id}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center space-x-1"
                >
                  <Share className="h-3 w-3" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};