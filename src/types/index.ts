export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'family' | 'authority' | 'volunteer';
  createdAt?: string;
  updatedAt?: string;
}

export type CaseType = 'disappearance' | 'runaway' | 'abduction' | 'missing_adult' | 'missing_child';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export interface MissingPerson {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  dateDisappeared: string;
  timeDisappeared?: string;
  locationDisappeared: Location;
  description: string;
  reporterContact: ReporterContact;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'found' | 'closed';
  caseType: CaseType;
  priority: CasePriority;
  circumstances?: string;
  isEmergency: boolean;
  lastContactDate?: string;
  clothingDescription?: string;
  personalItems?: string;
  medicalInfo?: string;
  behavioralInfo?: string;
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
  caseType?: CaseType;
  priority?: CasePriority;
  isEmergency?: boolean;
  status?: 'active' | 'found' | 'closed';
}

export interface GeolocationAlert {
  id: string;
  missingPersonId: string;
  distance: number;
  location: Location;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface InvestigationObservation {
  id: string;
  missingPersonId: string;
  observerName: string;
  observerPhone?: string;
  observerEmail?: string;
  observationDate: string;
  observationTime?: string;
  location: Location;
  description: string;
  confidenceLevel: ConfidenceLevel;
  clothingDescription?: string;
  behaviorDescription?: string;
  companions?: string;
  vehicleInfo?: string;
  witnessContactConsent: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  distanceFromDisappearance?: number; // Distance en km depuis le lieu de disparition
  photos?: string[]; // URLs des photos jointes
  photoDescriptions?: string[]; // Descriptions des photos
}