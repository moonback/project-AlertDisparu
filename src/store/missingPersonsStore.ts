import { create } from 'zustand';
import { MissingPerson, SearchFilters, InvestigationObservation, SavedResolutionScenario } from '../types';
import { supabase } from '../lib/supabase';
import { SavedScenariosCache } from '../services/scenarioCache';
import { useAuthStore } from './authStore';

interface MissingPersonsState {
  reports: MissingPerson[];
  filteredReports: MissingPerson[];
  searchFilters: SearchFilters;
  isLoading: boolean;
  loadReports: () => Promise<void>;
  addReport: (report: Omit<MissingPerson, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateReport: (id: string, updates: Partial<MissingPerson>) => Promise<{ success: boolean; error?: string }>;
  deleteReport: (id: string) => Promise<{ success: boolean; error?: string }>;
  getReportsByUser: (userId: string) => Promise<MissingPerson[]>;
  updateFilters: (filters: SearchFilters) => void;
  getReportById: (id: string) => MissingPerson | undefined;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  // Méthodes pour les observations d'investigation
  getObservationsByReportId: (reportId: string) => Promise<InvestigationObservation[]>;
  addObservation: (observation: Omit<InvestigationObservation, 'id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'verifiedBy' | 'verifiedAt' | 'createdBy' | 'distanceFromDisappearance'>) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateObservation: (id: string, updates: Partial<InvestigationObservation>) => Promise<{ success: boolean; error?: string }>;
  deleteObservation: (id: string) => Promise<{ success: boolean; error?: string }>;
  // Méthodes pour les scénarios de résolution
  getResolutionScenariosByReportId: (reportId: string) => Promise<SavedResolutionScenario[]>;
  addResolutionScenario: (scenario: Omit<SavedResolutionScenario, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'generationDate' | 'aiModelUsed' | 'generationVersion'>) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateResolutionScenario: (id: string, updates: Partial<SavedResolutionScenario>) => Promise<{ success: boolean; error?: string }>;
  deleteResolutionScenario: (id: string) => Promise<{ success: boolean; error?: string }>;
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
        timeDisappeared: row.time_disappeared || undefined,
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
        caseType: row.case_type || 'disappearance',
        priority: row.priority || 'medium',
        circumstances: row.circumstances || undefined,
        isEmergency: row.is_emergency || false,
        lastContactDate: row.last_contact_date || undefined,
        clothingDescription: row.clothing_description || undefined,
        personalItems: row.personal_items || undefined,
        medicalInfo: row.medical_info || undefined,
        behavioralInfo: row.behavioral_info || undefined,
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
        time_disappeared: reportData.timeDisappeared || null,
        location_address: reportData.locationDisappeared.address,
        location_city: reportData.locationDisappeared.city,
        location_state: reportData.locationDisappeared.state,
        location_country: reportData.locationDisappeared.country,
        location_lat: reportData.locationDisappeared.coordinates.lat,
        location_lng: reportData.locationDisappeared.coordinates.lng,
        description: reportData.description,
        case_type: reportData.caseType || 'disappearance',
        priority: reportData.priority || 'medium',
        circumstances: reportData.circumstances || null,
        clothing_description: reportData.clothingDescription || null,
        personal_items: reportData.personalItems || null,
        medical_info: reportData.medicalInfo || null,
        behavioral_info: reportData.behavioralInfo || null,
        is_emergency: reportData.isEmergency || false,
        reporter_name: reportData.reporterContact.name,
        reporter_relationship: reportData.reporterContact.relationship,
        reporter_phone: reportData.reporterContact.phone,
        reporter_email: reportData.reporterContact.email,
        consent_given: reportData.consentGiven,
        status: 'active',
        created_by: authState.user.id,
      };

      console.log('📦 Payload pour Supabase:', payload);
      console.log('🗺️ Coordonnées dans le payload:', {
        lat: payload.location_lat,
        lng: payload.location_lng,
        address: payload.location_address,
        city: payload.location_city
      });

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

  updateReport: async (id, updates) => {
    console.log('🔄 Mise à jour du rapport:', id, updates);
    
    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Préparer les données pour la mise à jour
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Mapper les champs selon la structure de la base de données
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.age !== undefined) updateData.age = updates.age;
      if (updates.gender) updateData.gender = updates.gender;
      if (updates.photo !== undefined) updateData.photo = updates.photo;
      if (updates.dateDisappeared) updateData.date_disappeared = updates.dateDisappeared;
      if (updates.timeDisappeared !== undefined) updateData.time_disappeared = updates.timeDisappeared;
      if (updates.description) updateData.description = updates.description;
      if (updates.circumstances !== undefined) updateData.circumstances = updates.circumstances;
      if (updates.clothingDescription !== undefined) updateData.clothing_description = updates.clothingDescription;
      if (updates.personalItems !== undefined) updateData.personal_items = updates.personalItems;
      if (updates.medicalInfo !== undefined) updateData.medical_info = updates.medicalInfo;
      if (updates.behavioralInfo !== undefined) updateData.behavioral_info = updates.behavioralInfo;
      if (updates.status) updateData.status = updates.status;
      if (updates.caseType) updateData.case_type = updates.caseType;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.isEmergency !== undefined) updateData.is_emergency = updates.isEmergency;

      // Mettre à jour la localisation si nécessaire
      if (updates.locationDisappeared) {
        updateData.location_address = updates.locationDisappeared.address;
        updateData.location_city = updates.locationDisappeared.city;
        updateData.location_state = updates.locationDisappeared.state;
        updateData.location_country = updates.locationDisappeared.country;
        updateData.location_lat = updates.locationDisappeared.coordinates.lat;
        updateData.location_lng = updates.locationDisappeared.coordinates.lng;
      }

      // Mettre à jour les informations du déclarant si nécessaire
      if (updates.reporterContact) {
        updateData.reporter_name = updates.reporterContact.name;
        updateData.reporter_relationship = updates.reporterContact.relationship;
        updateData.reporter_phone = updates.reporterContact.phone;
        updateData.reporter_email = updates.reporterContact.email;
      }

      const { error } = await supabase
        .from('missing_persons')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', authState.user.id); // S'assurer que l'utilisateur peut seulement modifier ses propres rapports

      if (error) {
        console.error('❌ Erreur mise à jour rapport:', error);
        return { success: false, error: error.message };
      }

      // Recharger la liste
      await get().loadReports();
      
      return { success: true };
    } catch (err) {
      console.error('💥 Exception dans updateReport:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
  },

  deleteReport: async (id) => {
    console.log('🗑️ Suppression du rapport:', id);
    
    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const { error } = await supabase
        .from('missing_persons')
        .delete()
        .eq('id', id)
        .eq('created_by', authState.user.id); // S'assurer que l'utilisateur peut seulement supprimer ses propres rapports

      if (error) {
        console.error('❌ Erreur suppression rapport:', error);
        return { success: false, error: error.message };
      }

      // Recharger la liste
      await get().loadReports();
      
      return { success: true };
    } catch (err) {
      console.error('💥 Exception dans deleteReport:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
  },

  getReportsByUser: async (userId) => {
    console.log('👤 Chargement des rapports pour l\'utilisateur:', userId);
    
    try {
      const { data, error } = await supabase
        .from('missing_persons')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement rapports utilisateur:', error);
        throw error;
      }

      const mapped: MissingPerson[] = (data || []).map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        age: row.age,
        gender: row.gender,
        photo: row.photo || undefined,
        dateDisappeared: row.date_disappeared,
        timeDisappeared: row.time_disappeared || undefined,
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
        caseType: row.case_type || 'disappearance',
        priority: row.priority || 'medium',
        circumstances: row.circumstances || undefined,
        isEmergency: row.is_emergency || false,
        lastContactDate: row.last_contact_date || undefined,
        clothingDescription: row.clothing_description || undefined,
        personalItems: row.personal_items || undefined,
        medicalInfo: row.medical_info || undefined,
        behavioralInfo: row.behavioral_info || undefined,
      }));

      return mapped;
    } catch (err) {
      console.error('💥 Exception dans getReportsByUser:', err);
      throw err;
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
    
    if (filters.caseType && filters.caseType !== 'all') {
      filtered = filtered.filter(report => report.caseType === filters.caseType);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(report => report.priority === filters.priority);
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }
    
    if (filters.isEmergency !== undefined) {
      filtered = filtered.filter(report => report.isEmergency === filters.isEmergency);
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
  },

  getObservationsByReportId: async (reportId) => {
    console.log('🔍 Chargement des observations pour le rapport:', reportId);
    
    try {
      const { data, error } = await supabase
        .from('investigation_observations')
        .select(`
          *,
          missing_persons!inner(location_lat, location_lng)
        `)
        .eq('missing_person_id', reportId)
        .order('observation_date', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement observations:', error);
        throw error;
      }

      const mapped: InvestigationObservation[] = (data || []).map(row => {
        const report = row.missing_persons;
        const distanceFromDisappearance = report?.location_lat && report?.location_lng && row.location_lat && row.location_lng
          ? get().calculateDistance(
              report.location_lat, 
              report.location_lng, 
              row.location_lat, 
              row.location_lng
            )
          : undefined;

        return {
          id: row.id,
          missingPersonId: row.missing_person_id,
          observerName: row.observer_name,
          observerPhone: row.observer_phone || undefined,
          observerEmail: row.observer_email || undefined,
          observationDate: row.observation_date,
          observationTime: row.observation_time || undefined,
          location: {
            address: row.location_address,
            city: row.location_city,
            state: row.location_state,
            country: row.location_country,
            coordinates: { lat: row.location_lat, lng: row.location_lng }
          },
          description: row.description,
          confidenceLevel: row.confidence_level,
          clothingDescription: row.clothing_description || undefined,
          behaviorDescription: row.behavior_description || undefined,
          companions: row.companions || undefined,
          vehicleInfo: row.vehicle_info || undefined,
          witnessContactConsent: row.witness_contact_consent,
          isVerified: row.is_verified,
          verifiedBy: row.verified_by || undefined,
          verifiedAt: row.verified_at || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          createdBy: row.created_by || undefined,
          distanceFromDisappearance,
          photos: row.photos || undefined,
          photoDescriptions: row.photo_descriptions || undefined
        };
      });

      return mapped;
    } catch (err) {
      console.error('💥 Exception dans getObservationsByReportId:', err);
      throw err;
    }
  },

  addObservation: async (observationData) => {
    console.log('➕ Ajout d\'une observation:', observationData);
    
    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const payload = {
        missing_person_id: observationData.missingPersonId,
        observer_name: observationData.observerName,
        observer_phone: observationData.observerPhone || null,
        observer_email: observationData.observerEmail || null,
        observation_date: observationData.observationDate,
        observation_time: observationData.observationTime || null,
        location_address: observationData.location.address,
        location_city: observationData.location.city,
        location_state: observationData.location.state,
        location_country: observationData.location.country,
        location_lat: observationData.location.coordinates.lat,
        location_lng: observationData.location.coordinates.lng,
        description: observationData.description,
        confidence_level: observationData.confidenceLevel,
        clothing_description: observationData.clothingDescription || null,
        behavior_description: observationData.behaviorDescription || null,
        companions: observationData.companions || null,
        vehicle_info: observationData.vehicleInfo || null,
        witness_contact_consent: observationData.witnessContactConsent,
        photos: observationData.photos || null,
        photo_descriptions: observationData.photoDescriptions || null,
        created_by: authState.user.id
      };

      const { data, error } = await supabase
        .from('investigation_observations')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur insertion observation:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    } catch (err) {
      console.error('💥 Exception dans addObservation:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
  },

  updateObservation: async (id, updates) => {
    console.log('🔄 Mise à jour de l\'observation:', id, updates);
    
    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Mapper les champs selon la structure de la base de données
      if (updates.observerName) updateData.observer_name = updates.observerName;
      if (updates.observerPhone !== undefined) updateData.observer_phone = updates.observerPhone;
      if (updates.observerEmail !== undefined) updateData.observer_email = updates.observerEmail;
      if (updates.observationDate) updateData.observation_date = updates.observationDate;
      if (updates.observationTime !== undefined) updateData.observation_time = updates.observationTime;
      if (updates.description) updateData.description = updates.description;
      if (updates.confidenceLevel) updateData.confidence_level = updates.confidenceLevel;
      if (updates.clothingDescription !== undefined) updateData.clothing_description = updates.clothingDescription;
      if (updates.behaviorDescription !== undefined) updateData.behavior_description = updates.behaviorDescription;
      if (updates.companions !== undefined) updateData.companions = updates.companions;
      if (updates.vehicleInfo !== undefined) updateData.vehicle_info = updates.vehicleInfo;
      if (updates.witnessContactConsent !== undefined) updateData.witness_contact_consent = updates.witnessContactConsent;

      // Mettre à jour la localisation si nécessaire
      if (updates.location) {
        updateData.location_address = updates.location.address;
        updateData.location_city = updates.location.city;
        updateData.location_state = updates.location.state;
        updateData.location_country = updates.location.country;
        updateData.location_lat = updates.location.coordinates.lat;
        updateData.location_lng = updates.location.coordinates.lng;
      }

      const { error } = await supabase
        .from('investigation_observations')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', authState.user.id); // S'assurer que l'utilisateur peut seulement modifier ses propres observations

      if (error) {
        console.error('❌ Erreur mise à jour observation:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('💥 Exception dans updateObservation:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
  },

  deleteObservation: async (id) => {
    console.log('🗑️ Suppression de l\'observation:', id);
    
    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const { error } = await supabase
        .from('investigation_observations')
        .delete()
        .eq('id', id)
        .eq('created_by', authState.user.id); // S'assurer que l'utilisateur peut seulement supprimer ses propres observations

      if (error) {
        console.error('❌ Erreur suppression observation:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('💥 Exception dans deleteObservation:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
  },

  getResolutionScenariosByReportId: async (reportId) => {
    console.log('🔍 Chargement des scénarios de résolution pour le rapport:', reportId);
    
    // Vérifier le cache d'abord
    const cached = SavedScenariosCache.get(reportId);
    if (cached) {
      console.log('🎯 Utilisation du cache pour les scénarios sauvegardés');
      return cached;
    }
    
    try {
      const { data, error } = await supabase
        .from('resolution_scenarios')
        .select('*')
        .eq('missing_person_id', reportId)
        .order('generation_date', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement scénarios:', error);
        throw error;
      }

      const mapped: SavedResolutionScenario[] = (data || []).map(row => ({
        id: row.id,
        missingPersonId: row.missing_person_id,
        scenario1: {
          title: row.scenario1_title,
          description: row.scenario1_description,
          probability: row.scenario1_probability,
          actions: row.scenario1_actions || [],
          timeline: row.scenario1_timeline,
          keyFactors: row.scenario1_key_factors || [],
          resources: row.scenario1_resources || []
        },
        scenario2: {
          title: row.scenario2_title,
          description: row.scenario2_description,
          probability: row.scenario2_probability,
          actions: row.scenario2_actions || [],
          timeline: row.scenario2_timeline,
          keyFactors: row.scenario2_key_factors || [],
          resources: row.scenario2_resources || []
        },
        summary: row.summary,
        recommendations: row.recommendations || [],
        generationDate: row.generation_date,
        aiModelUsed: row.ai_model_used,
        generationVersion: row.generation_version,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by || undefined
      }));

      // Mettre en cache le résultat
      SavedScenariosCache.set(reportId, mapped);
      
      return mapped;
    } catch (err) {
      console.error('💥 Exception dans getResolutionScenariosByReportId:', err);
      throw err;
    }
  },

  addResolutionScenario: async (scenarioData) => {
    console.log('➕ Ajout d\'un scénario de résolution:', scenarioData);
    
    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const payload = {
        missing_person_id: scenarioData.missingPersonId,
        scenario1_title: scenarioData.scenario1.title,
        scenario1_description: scenarioData.scenario1.description,
        scenario1_probability: scenarioData.scenario1.probability,
        scenario1_actions: scenarioData.scenario1.actions,
        scenario1_timeline: scenarioData.scenario1.timeline,
        scenario1_key_factors: scenarioData.scenario1.keyFactors,
        scenario1_resources: scenarioData.scenario1.resources,
        scenario2_title: scenarioData.scenario2.title,
        scenario2_description: scenarioData.scenario2.description,
        scenario2_probability: scenarioData.scenario2.probability,
        scenario2_actions: scenarioData.scenario2.actions,
        scenario2_timeline: scenarioData.scenario2.timeline,
        scenario2_key_factors: scenarioData.scenario2.keyFactors,
        scenario2_resources: scenarioData.scenario2.resources,
        summary: scenarioData.summary,
        recommendations: scenarioData.recommendations,
        generation_date: new Date().toISOString(),
        ai_model_used: 'gemini-1.5-flash',
        generation_version: '1.0',
        created_by: authState.user.id
      };

      const { data, error } = await supabase
        .from('resolution_scenarios')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur insertion scénario:', error);
        return { success: false, error: error.message };
      }

      // Invalider le cache pour ce rapport
      SavedScenariosCache.invalidate(scenarioData.missingPersonId);

      return { success: true, id: data?.id };
    } catch (err) {
      console.error('💥 Exception dans addResolutionScenario:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
  },

  updateResolutionScenario: async (id, updates) => {
    console.log('🔄 Mise à jour du scénario de résolution:', id, updates);
    
    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Mapper les champs selon la structure de la base de données
      if (updates.scenario1) {
        if (updates.scenario1.title) updateData.scenario1_title = updates.scenario1.title;
        if (updates.scenario1.description) updateData.scenario1_description = updates.scenario1.description;
        if (updates.scenario1.probability) updateData.scenario1_probability = updates.scenario1.probability;
        if (updates.scenario1.actions) updateData.scenario1_actions = updates.scenario1.actions;
        if (updates.scenario1.timeline) updateData.scenario1_timeline = updates.scenario1.timeline;
        if (updates.scenario1.keyFactors) updateData.scenario1_key_factors = updates.scenario1.keyFactors;
        if (updates.scenario1.resources) updateData.scenario1_resources = updates.scenario1.resources;
      }

      if (updates.scenario2) {
        if (updates.scenario2.title) updateData.scenario2_title = updates.scenario2.title;
        if (updates.scenario2.description) updateData.scenario2_description = updates.scenario2.description;
        if (updates.scenario2.probability) updateData.scenario2_probability = updates.scenario2.probability;
        if (updates.scenario2.actions) updateData.scenario2_actions = updates.scenario2.actions;
        if (updates.scenario2.timeline) updateData.scenario2_timeline = updates.scenario2.timeline;
        if (updates.scenario2.keyFactors) updateData.scenario2_key_factors = updates.scenario2.keyFactors;
        if (updates.scenario2.resources) updateData.scenario2_resources = updates.scenario2.resources;
      }

      if (updates.summary) updateData.summary = updates.summary;
      if (updates.recommendations) updateData.recommendations = updates.recommendations;

      const { error } = await supabase
        .from('resolution_scenarios')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', authState.user.id); // S'assurer que l'utilisateur peut seulement modifier ses propres scénarios

      if (error) {
        console.error('❌ Erreur mise à jour scénario:', error);
        return { success: false, error: error.message };
      }

      // Invalider le cache pour tous les rapports (car on ne connaît pas le rapportId ici)
      // En production, on pourrait optimiser en passant le rapportId en paramètre
      SavedScenariosCache.clear();

      return { success: true };
    } catch (err) {
      console.error('💥 Exception dans updateResolutionScenario:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
  },

  deleteResolutionScenario: async (id) => {
    console.log('🗑️ Suppression du scénario de résolution:', id);
    
    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const { error } = await supabase
        .from('resolution_scenarios')
        .delete()
        .eq('id', id)
        .eq('created_by', authState.user.id); // S'assurer que l'utilisateur peut seulement supprimer ses propres scénarios

      if (error) {
        console.error('❌ Erreur suppression scénario:', error);
        return { success: false, error: error.message };
      }

      // Invalider le cache pour tous les rapports (car on ne connaît pas le rapportId ici)
      // En production, on pourrait optimiser en passant le rapportId en paramètre
      SavedScenariosCache.clear();

      return { success: true };
    } catch (err) {
      console.error('💥 Exception dans deleteResolutionScenario:', err);
      return { success: false, error: `Erreur: ${err}` };
    }
  }
}));