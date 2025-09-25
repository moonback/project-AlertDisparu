import React from 'react';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Search, Filter, X } from 'lucide-react';

const genderOptions = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Search Missing Persons
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="h-4 w-4 mr-1" />
          {showAdvanced ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      <div className="space-y-4">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name or location..."
            value={localFilters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="md:col-span-2"
          />
          <Select
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
                label="Location"
                placeholder="City, State"
                value={localFilters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
              <Input
                label="Min Age"
                type="number"
                min="0"
                max="150"
                value={localFilters.minAge}
                onChange={(e) => handleFilterChange('minAge', e.target.value)}
              />
              <Input
                label="Max Age"
                type="number"
                min="0"
                max="150"
                value={localFilters.maxAge}
                onChange={(e) => handleFilterChange('maxAge', e.target.value)}
              />
              <div />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Date From"
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
              <Input
                label="Date To"
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};