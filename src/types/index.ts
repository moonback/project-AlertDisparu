export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'family' | 'authority' | 'volunteer';
  createdAt?: string;
  updatedAt?: string;
}

export interface MissingPerson {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  dateDisappeared: string;
  locationDisappeared: Location;
  description: string;
  reporterContact: ReporterContact;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'found' | 'closed';
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ReporterContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface SearchFilters {
  query?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface GeolocationAlert {
  id: string;
  missingPersonId: string;
  distance: number;
  location: Location;
}