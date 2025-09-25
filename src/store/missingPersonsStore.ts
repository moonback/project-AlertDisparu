import { create } from 'zustand';
import { MissingPerson, SearchFilters } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface MissingPersonsState {
  reports: MissingPerson[];
  filteredReports: MissingPerson[];
  searchFilters: SearchFilters;
  isLoading: boolean;
  loadReports: () => Promise<void>;
  addReport: (report: Omit<MissingPerson, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateFilters: (filters: SearchFilters) => void;
  getReportById: (id: string) => MissingPerson | undefined;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

// Pas de données mock en prod: on charge depuis Supabase

export const useMissingPersonsStore = create<MissingPersonsState>((set, get) => ({
  reports: [],
  filteredReports: [],
  searchFilters: {},
  isLoading: false,
  
  loadReports: async () => {
    console.log('📥 Chargement des rapports...');
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('missing_persons')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Réponse chargement rapports:', { data, error });

      if (error) {
        set({ isLoading: false });
        console.error('❌ Erreur chargement rapports:', error.message);
        return;
      }

      const mapped: MissingPerson[] = (data || []).map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        age: row.age,
        gender: row.gender,
        photo: row.photo || undefined,
        dateDisappeared: row.date_disappeared,
        locationDisappeared: {
          address: row.location_address,
          city: row.location_city,
          state: row.location_state,
          country: row.location_country,
          coordinates: { lat: row.location_lat, lng: row.location_lng }
        },
        description: row.description,
        reporterContact: {
          name: row.reporter_name,
          relationship: row.reporter_relationship,
          phone: row.reporter_phone,
          email: row.reporter_email,
        },
        consentGiven: row.consent_given,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        status: row.status,
      }));

      console.log('✅ Rapports mappés:', mapped.length, 'éléments');
      set({ reports: mapped, filteredReports: mapped, isLoading: false });
    } catch (err) {
      console.error('💥 Exception lors du chargement:', err);
      set({ isLoading: false });
    }
  },

  addReport: async (reportData) => {
    console.log('🔍 Store: Début addReport avec:', reportData);
    
    try {
      // Utiliser l'utilisateur du store d'authentification au lieu de supabase.auth.getUser()
      const authState = useAuthStore.getState();
      console.log('👤 État d\'authentification du store:', authState);
      
      if (!authState.isAuthenticated || !authState.user) {
        console.error('❌ Pas d\'utilisateur authentifié dans le store');
        return { success: false, error: 'Utilisateur non authentifié' };
      }
      
      console.log('✅ Utilisateur authentifié:', authState.user.id);
      
      const payload = {
        first_name: reportData.firstName,
        last_name: reportData.lastName,
        age: reportData.age,
        gender: reportData.gender,
        photo: reportData.photo || null,
        date_disappeared: reportData.dateDisappeared,
        location_address: reportData.locationDisappeared.address,
        location_city: reportData.locationDisappeared.city,
        location_state: reportData.locationDisappeared.state,
        location_country: reportData.locationDisappeared.country,
        location_lat: reportData.locationDisappeared.coordinates.lat,
        location_lng: reportData.locationDisappeared.coordinates.lng,
        description: reportData.description,
        reporter_name: reportData.reporterContact.name,
        reporter_relationship: reportData.reporterContact.relationship,
        reporter_phone: reportData.reporterContact.phone,
        reporter_email: reportData.reporterContact.email,
        consent_given: reportData.consentGiven,
        status: 'active',
        created_by: authState.user.id,
      };

      console.log('📦 Payload pour Supabase:', payload);

      // S'assurer que le token est correctement configuré
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔑 Session pour insertion:', session?.access_token ? 'Token présent' : 'Token manquant');

      const { data, error } = await supabase
        .from('missing_persons')
        .insert(payload)
        .select('*')
        .single();

      console.log('📊 Réponse Supabase:', { data, error });

      if (error) {
        console.error('❌ Erreur insertion rapport:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Rapport inséré avec succès, rechargement...');
      
      // Recharger la liste depuis la base pour rester source de vérité
      await get().loadReports();
      
      console.log('✅ Liste rechargée');
      return { success: true, id: data?.id };
    } catch (err) {
      console.error('💥 Exception dans addReport:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
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