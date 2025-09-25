import { create } from 'zustand';
import { MissingPerson, SearchFilters } from '../types';

interface MissingPersonsState {
  reports: MissingPerson[];
  filteredReports: MissingPerson[];
  searchFilters: SearchFilters;
  isLoading: boolean;
  addReport: (report: Omit<MissingPerson, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateFilters: (filters: SearchFilters) => void;
  getReportById: (id: string) => MissingPerson | undefined;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

// Mock data for demonstration
const mockReports: MissingPerson[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    age: 28,
    gender: 'female',
    photo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    dateDisappeared: '2024-01-15',
    locationDisappeared: {
      address: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      coordinates: { lat: 30.2672, lng: -97.7431 }
    },
    description: 'Last seen wearing a blue jacket and jeans. She was walking her dog in the park.',
    reporterContact: {
      name: 'Mark Johnson',
      relationship: 'Husband',
      phone: '+1-555-0123',
      email: 'mark.johnson@email.com'
    },
    consentGiven: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    age: 16,
    gender: 'male',
    photo: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    dateDisappeared: '2024-01-20',
    locationDisappeared: {
      address: '456 Oak Avenue',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      coordinates: { lat: 47.6062, lng: -122.3321 }
    },
    description: 'Missing after school. Was supposed to meet friends at the library but never showed up.',
    reporterContact: {
      name: 'Lisa Chen',
      relationship: 'Mother',
      phone: '+1-555-0456',
      email: 'lisa.chen@email.com'
    },
    consentGiven: true,
    createdAt: '2024-01-20T15:45:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    status: 'active'
  }
];

export const useMissingPersonsStore = create<MissingPersonsState>((set, get) => ({
  reports: mockReports,
  filteredReports: mockReports,
  searchFilters: {},
  isLoading: false,
  
  addReport: (reportData) => {
    const newReport: MissingPerson = {
      ...reportData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    
    set(state => ({
      reports: [...state.reports, newReport],
      filteredReports: [...state.filteredReports, newReport]
    }));
  },
  
  updateFilters: (filters) => {
    set({ searchFilters: filters });
    
    const { reports } = get();
    let filtered = [...reports];
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(report => 
        report.firstName.toLowerCase().includes(query) ||
        report.lastName.toLowerCase().includes(query) ||
        report.locationDisappeared.city.toLowerCase().includes(query)
      );
    }
    
    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(report => report.gender === filters.gender);
    }
    
    if (filters.ageRange) {
      filtered = filtered.filter(report => 
        report.age >= (filters.ageRange?.min || 0) &&
        report.age <= (filters.ageRange?.max || 150)
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(report =>
        report.locationDisappeared.city.toLowerCase().includes(filters.location?.toLowerCase() || '')
      );
    }
    
    if (filters.dateRange) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.dateDisappeared);
        const startDate = filters.dateRange?.start ? new Date(filters.dateRange.start) : new Date('1900-01-01');
        const endDate = filters.dateRange?.end ? new Date(filters.dateRange.end) : new Date();
        return reportDate >= startDate && reportDate <= endDate;
      });
    }
    
    set({ filteredReports: filtered });
  },
  
  getReportById: (id) => {
    return get().reports.find(report => report.id === id);
  },
  
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}));