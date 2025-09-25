import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Select } from './Select';
import { Input } from './Input';
import { Badge } from './Badge';
import { X, Filter, Calendar, MapPin, User } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'input' | 'date';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  onApply: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  values,
  onChange,
  onClear,
  onApply,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = Object.values(values).filter(value => 
    value !== '' && value !== null && value !== undefined
  ).length;

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            key={field.key}
            label={field.label}
            options={field.options || []}
            value={values[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      
      case 'input':
        return (
          <Input
            key={field.key}
            label={field.label}
            value={values[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      
      case 'date':
        return (
          <Input
            key={field.key}
            label={field.label}
            type="date"
            value={values[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Filter Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={<Filter className="h-4 w-4" />}
        className="relative"
      >
        Filtres
        {activeFiltersCount > 0 && (
          <Badge variant="error" size="sm" className="ml-2">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-strong z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {fields.map(renderField)}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                leftIcon={<X className="h-4 w-4" />}
              >
                Effacer
              </Button>
              
              <Button
                onClick={() => {
                  onApply();
                  setIsOpen(false);
                }}
              >
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
