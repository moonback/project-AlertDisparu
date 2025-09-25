import React from 'react';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Search, Filter, X, MapPin, Calendar, User } from 'lucide-react';

const genderOptions = [
  { value: 'all', label: 'Tous les genres' },
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'other', label: 'Autre' }
];

export const SearchFilters: React.FC = () => {
  const { searchFilters, updateFilters } = useMissingPersonsStore();
  const [localFilters, setLocalFilters] = React.useState({
    query: searchFilters.query || '',
    gender: searchFilters.gender || 'all',
    location: searchFilters.location || '',
    minAge: searchFilters.ageRange?.min?.toString() || '',
    maxAge: searchFilters.ageRange?.max?.toString() || '',
    startDate: searchFilters.dateRange?.start || '',
    endDate: searchFilters.dateRange?.end || ''
  });

  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleFilterChange = (field: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    const filters: any = {
      query: localFilters.query || undefined,
      gender: localFilters.gender !== 'all' ? localFilters.gender : undefined,
      location: localFilters.location || undefined
    };

    if (localFilters.minAge || localFilters.maxAge) {
      filters.ageRange = {
        min: localFilters.minAge ? parseInt(localFilters.minAge) : 0,
        max: localFilters.maxAge ? parseInt(localFilters.maxAge) : 150
      };
    }

    if (localFilters.startDate || localFilters.endDate) {
      filters.dateRange = {
        start: localFilters.startDate || undefined,
        end: localFilters.endDate || undefined
      };
    }

    updateFilters(filters);
  };

  const clearFilters = () => {
    setLocalFilters({
      query: '',
      gender: 'all',
      location: '',
      minAge: '',
      maxAge: '',
      startDate: '',
      endDate: ''
    });
    updateFilters({});
  };

  React.useEffect(() => {
    applyFilters();
  }, [localFilters.query, localFilters.gender, localFilters.location]);

  return (
    <Card variant="elevated" className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-primary-600" />
            Rechercher des personnes disparues
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            {showAdvanced ? 'Masquer' : 'Afficher'} les filtres
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        <div className="space-y-4">
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rechercher par nom ou localisation..."
              leftIcon={<Search className="h-5 w-5" />}
              value={localFilters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="md:col-span-2"
            />
            <Select
              placeholder="Genre"
              leftIcon={<User className="h-5 w-5" />}
              options={genderOptions}
              value={localFilters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            />
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Localisation"
                  placeholder="Ville, Région"
                  leftIcon={<MapPin className="h-5 w-5" />}
                  value={localFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
                <Input
                  label="Âge minimum"
                  type="number"
                  min="0"
                  max="150"
                  leftIcon={<User className="h-5 w-5" />}
                  value={localFilters.minAge}
                  onChange={(e) => handleFilterChange('minAge', e.target.value)}
                />
                <Input
                  label="Âge maximum"
                  type="number"
                  min="0"
                  max="150"
                  leftIcon={<User className="h-5 w-5" />}
                  value={localFilters.maxAge}
                  onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                />
                <div />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Date de début"
                  type="date"
                  leftIcon={<Calendar className="h-5 w-5" />}
                  value={localFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
                <Input
                  label="Date de fin"
                  type="date"
                  leftIcon={<Calendar className="h-5 w-5" />}
                  value={localFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Effacer les filtres
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};