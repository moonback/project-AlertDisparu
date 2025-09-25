import { supabase } from '../lib/supabase';
import { 
  AnalyticsData, 
  AnalyticsQuery, 
  TimelineEvent, 
  HeatmapData, 
  TemporalPattern, 
  WitnessCredibility,
  AnalyticsFilters 
} from '../types/analytics';
import { InvestigationObservation } from '../types';

/**
 * Service d'analytics pour les observations d'investigation
 */
export class AnalyticsService {
  
  /**
   * Récupère toutes les données d'analytics pour un cas
   */
  static async getAnalyticsData(query: AnalyticsQuery): Promise<AnalyticsData> {
    const { missingPersonId, filters = {}, timeRange = 'all' } = query;
    
    // Récupérer les observations de base
    const observations = await this.getObservations(missingPersonId, filters, timeRange);
    
    // Calculer les différentes analyses en parallèle
    const [
      timeline,
      heatmap,
      temporalPatterns,
      witnessCredibility,
      statistics
    ] = await Promise.all([
      this.buildTimeline(observations),
      this.buildHeatmap(observations),
      this.buildTemporalPatterns(observations),
      this.buildWitnessCredibility(observations),
      this.buildStatistics(observations)
    ]);
    
    return {
      timeline,
      heatmap,
      temporalPatterns,
      witnessCredibility,
      statistics
    };
  }
  
  /**
   * Récupère les observations avec filtres
   */
  private static async getObservations(
    missingPersonId: string, 
    filters: AnalyticsFilters,
    timeRange: string
  ): Promise<InvestigationObservation[]> {
    let query = supabase
      .from('investigation_observations')
      .select(`
        *,
        missing_persons!inner(location_lat, location_lng)
      `)
      .eq('missing_person_id', missingPersonId);
    
    // Appliquer les filtres de date
    const dateRange = this.getDateRange(timeRange);
    if (dateRange.start) {
      query = query.gte('observation_date', dateRange.start);
    }
    if (dateRange.end) {
      query = query.lte('observation_date', dateRange.end);
    }
    
    // Appliquer les filtres personnalisés
    if (filters.confidence && filters.confidence.length > 0) {
      query = query.in('confidence_level', filters.confidence);
    }
    
    if (filters.verified !== undefined) {
      query = query.eq('is_verified', filters.verified);
    }
    
    if (filters.location?.city) {
      query = query.eq('location_city', filters.location.city);
    }
    
    if (filters.observer) {
      query = query.eq('observer_name', filters.observer);
    }
    
    const { data, error } = await query.order('observation_date', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des observations:', error);
      throw new Error('Erreur lors de la récupération des données');
    }
    
    return this.mapObservations(data || []);
  }
  
  /**
   * Construit la timeline des événements
   */
  private static async buildTimeline(observations: InvestigationObservation[]): Promise<TimelineEvent[]> {
    const timeline: TimelineEvent[] = [];
    
    for (const obs of observations) {
      // Événement d'observation
      timeline.push({
        id: `obs-${obs.id}`,
        type: 'observation',
        title: `Observation par ${obs.observerName}`,
        description: obs.description,
        timestamp: obs.observationDate,
        confidence: obs.confidenceLevel,
        verified: obs.isVerified,
        location: {
          lat: obs.location.coordinates.lat,
          lng: obs.location.coordinates.lng,
          address: obs.location.address
        },
        metadata: {
          observerName: obs.observerName,
          distanceFromDisappearance: obs.distanceFromDisappearance,
          hasPhotos: obs.photos && obs.photos.length > 0
        }
      });
      
      // Événement de vérification si vérifié
      if (obs.isVerified && obs.verifiedAt) {
        timeline.push({
          id: `verif-${obs.id}`,
          type: 'verification',
          title: 'Observation vérifiée',
          description: `Vérifiée par les autorités`,
          timestamp: obs.verifiedAt,
          confidence: 'high',
          verified: true,
          location: {
            lat: obs.location.coordinates.lat,
            lng: obs.location.coordinates.lng,
            address: obs.location.address
          }
        });
      }
    }
    
    // Trier par timestamp
    return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  /**
   * Construit la heatmap géographique
   */
  private static async buildHeatmap(observations: InvestigationObservation[]): Promise<HeatmapData[]> {
    const locationMap = new Map<string, HeatmapData>();
    
    for (const obs of observations) {
      const key = `${obs.location.city}-${obs.location.coordinates.lat}-${obs.location.coordinates.lng}`;
      
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          lat: obs.location.coordinates.lat,
          lng: obs.location.coordinates.lng,
          intensity: 0,
          observationCount: 0,
          city: obs.location.city,
          confidence: { high: 0, medium: 0, low: 0 }
        });
      }
      
      const data = locationMap.get(key)!;
      data.observationCount++;
      data.confidence[obs.confidenceLevel]++;
    }
    
    // Calculer l'intensité normalisée (0-1)
    const maxCount = Math.max(...Array.from(locationMap.values()).map(d => d.observationCount));
    
    for (const data of locationMap.values()) {
      data.intensity = data.observationCount / maxCount;
    }
    
    return Array.from(locationMap.values());
  }
  
  /**
   * Construit les patterns temporels
   */
  private static async buildTemporalPatterns(observations: InvestigationObservation[]): Promise<TemporalPattern[]> {
    const patterns = new Map<string, TemporalPattern>();
    
    for (const obs of observations) {
      const date = new Date(obs.observationDate);
      const hour = obs.observationTime ? parseInt(obs.observationTime.split(':')[0]) : 12;
      const key = `${hour}-${date.getDay()}-${date.getMonth()}`;
      
      if (!patterns.has(key)) {
        patterns.set(key, {
          hour,
          dayOfWeek: date.getDay(),
          month: date.getMonth(),
          observationCount: 0,
          averageConfidence: 0,
          verifiedPercentage: 0
        });
      }
      
      const pattern = patterns.get(key)!;
      pattern.observationCount++;
      
      // Calculer la confiance moyenne
      const confidenceValue = obs.confidenceLevel === 'high' ? 3 : obs.confidenceLevel === 'medium' ? 2 : 1;
      pattern.averageConfidence = (pattern.averageConfidence * (pattern.observationCount - 1) + confidenceValue) / pattern.observationCount;
      
      // Calculer le pourcentage de vérification
      const verifiedCount = observations.filter(o => 
        new Date(o.observationDate).getDay() === pattern.dayOfWeek &&
        (o.observationTime ? parseInt(o.observationTime.split(':')[0]) : 12) === pattern.hour &&
        o.isVerified
      ).length;
      pattern.verifiedPercentage = (verifiedCount / pattern.observationCount) * 100;
    }
    
    return Array.from(patterns.values());
  }
  
  /**
   * Construit le score de crédibilité des témoins
   */
  private static async buildWitnessCredibility(observations: InvestigationObservation[]): Promise<WitnessCredibility[]> {
    const witnessMap = new Map<string, WitnessCredibility>();
    
    for (const obs of observations) {
      if (!witnessMap.has(obs.observerName)) {
        witnessMap.set(obs.observerName, {
          observerId: obs.observerName, // Utiliser le nom comme ID pour simplifier
          observerName: obs.observerName,
          totalObservations: 0,
          verifiedObservations: 0,
          credibilityScore: 0,
          factors: {
            consistency: 0,
            verificationRate: 0,
            detailQuality: 0,
            responseTime: 0,
            photoQuality: 0
          },
          trend: 'stable',
          lastObservation: obs.createdAt
        });
      }
      
      const witness = witnessMap.get(obs.observerName)!;
      witness.totalObservations++;
      
      if (obs.isVerified) {
        witness.verifiedObservations++;
      }
      
      // Calculer la qualité des détails
      const detailScore = this.calculateDetailQuality(obs);
      witness.factors.detailQuality = (witness.factors.detailQuality * (witness.totalObservations - 1) + detailScore) / witness.totalObservations;
      
      // Calculer la qualité des photos
      const photoScore = obs.photos && obs.photos.length > 0 ? 80 : 40; // Score basique
      witness.factors.photoQuality = (witness.factors.photoQuality * (witness.totalObservations - 1) + photoScore) / witness.totalObservations;
      
      if (obs.createdAt > witness.lastObservation) {
        witness.lastObservation = obs.createdAt;
      }
    }
    
    // Calculer les scores finaux
    for (const witness of witnessMap.values()) {
      witness.factors.verificationRate = (witness.verifiedObservations / witness.totalObservations) * 100;
      witness.factors.consistency = this.calculateConsistency(observations.filter(o => o.observerName === witness.observerName));
      witness.factors.responseTime = this.calculateResponseTime(observations.filter(o => o.observerName === witness.observerName));
      
      // Score global de crédibilité (moyenne pondérée)
      witness.credibilityScore = (
        witness.factors.consistency * 0.25 +
        witness.factors.verificationRate * 0.25 +
        witness.factors.detailQuality * 0.20 +
        witness.factors.responseTime * 0.15 +
        witness.factors.photoQuality * 0.15
      );
      
      // Déterminer la tendance
      witness.trend = this.calculateTrend(observations.filter(o => o.observerName === witness.observerName));
    }
    
    return Array.from(witnessMap.values()).sort((a, b) => b.credibilityScore - a.credibilityScore);
  }
  
  /**
   * Construit les statistiques globales
   */
  private static async buildStatistics(observations: InvestigationObservation[]): Promise<AnalyticsData['statistics']> {
    const totalObservations = observations.length;
    const verifiedObservations = observations.filter(o => o.isVerified).length;
    
    // Calculer la confiance moyenne
    const confidenceSum = observations.reduce((sum, obs) => {
      const value = obs.confidenceLevel === 'high' ? 3 : obs.confidenceLevel === 'medium' ? 2 : 1;
      return sum + value;
    }, 0);
    const averageConfidence = confidenceSum / totalObservations;
    
    // Top villes
    const cityCount = new Map<string, number>();
    observations.forEach(obs => {
      const count = cityCount.get(obs.location.city) || 0;
      cityCount.set(obs.location.city, count + 1);
    });
    const topCities = Array.from(cityCount.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Heures de pointe
    const hourCount = new Map<number, number>();
    observations.forEach(obs => {
      const hour = obs.observationTime ? parseInt(obs.observationTime.split(':')[0]) : 12;
      const count = hourCount.get(hour) || 0;
      hourCount.set(hour, count + 1);
    });
    const peakHours = Array.from(hourCount.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    
    // Distribution de crédibilité (basée sur les observations récentes)
    const recentObservations = observations.filter(obs => {
      const obsDate = new Date(obs.observationDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return obsDate >= thirtyDaysAgo;
    });
    
    const credibilityDistribution = {
      high: recentObservations.filter(obs => obs.confidenceLevel === 'high').length,
      medium: recentObservations.filter(obs => obs.confidenceLevel === 'medium').length,
      low: recentObservations.filter(obs => obs.confidenceLevel === 'low').length
    };
    
    return {
      totalObservations,
      verifiedObservations,
      averageConfidence,
      topCities,
      peakHours,
      credibilityDistribution
    };
  }
  
  /**
   * Calcule la qualité des détails d'une observation
   */
  private static calculateDetailQuality(obs: InvestigationObservation): number {
    let score = 0;
    
    // Description de base (20 points)
    if (obs.description && obs.description.length > 50) score += 20;
    else if (obs.description && obs.description.length > 20) score += 10;
    
    // Informations supplémentaires (40 points)
    if (obs.clothingDescription) score += 10;
    if (obs.behaviorDescription) score += 10;
    if (obs.companions) score += 10;
    if (obs.vehicleInfo) score += 10;
    
    // Photos (20 points)
    if (obs.photos && obs.photos.length > 0) score += 20;
    
    // Coordonnées précises (20 points)
    if (obs.location.coordinates.lat && obs.location.coordinates.lng) score += 20;
    
    return Math.min(score, 100);
  }
  
  /**
   * Calcule la cohérence des témoignages d'un observateur
   */
  private static calculateConsistency(observations: InvestigationObservation[]): number {
    if (observations.length < 2) return 50; // Score neutre pour un seul témoignage
    
    // Analyser la cohérence des descriptions
    const descriptions = observations.map(obs => obs.description.toLowerCase());
    const commonWords = this.findCommonWords(descriptions);
    const consistencyScore = (commonWords.length / Math.max(...descriptions.map(d => d.split(' ').length))) * 100;
    
    return Math.min(consistencyScore, 100);
  }
  
  /**
   * Calcule le temps de réponse moyen
   */
  private static calculateResponseTime(observations: InvestigationObservation[]): number {
    const verifiedObs = observations.filter(obs => obs.isVerified && obs.verifiedAt);
    
    if (verifiedObs.length === 0) return 50; // Score neutre si aucune vérification
    
    let totalResponseTime = 0;
    for (const obs of verifiedObs) {
      const obsDate = new Date(obs.observationDate);
      const verifDate = new Date(obs.verifiedAt!);
      const hours = (verifDate.getTime() - obsDate.getTime()) / (1000 * 60 * 60);
      totalResponseTime += hours;
    }
    
    const avgResponseTime = totalResponseTime / verifiedObs.length;
    
    // Score basé sur le temps de réponse (plus c'est rapide, mieux c'est)
    if (avgResponseTime < 24) return 100; // Moins de 24h
    if (avgResponseTime < 72) return 80;  // Moins de 3 jours
    if (avgResponseTime < 168) return 60; // Moins d'une semaine
    return 40; // Plus d'une semaine
  }
  
  /**
   * Calcule la tendance d'un témoin
   */
  private static calculateTrend(observations: InvestigationObservation[]): 'improving' | 'stable' | 'declining' {
    if (observations.length < 3) return 'stable';
    
    // Trier par date
    const sortedObs = observations.sort((a, b) => new Date(a.observationDate).getTime() - new Date(b.observationDate).getTime());
    
    // Calculer la qualité moyenne des 3 premières vs 3 dernières
    const firstHalf = sortedObs.slice(0, Math.floor(sortedObs.length / 2));
    const secondHalf = sortedObs.slice(Math.floor(sortedObs.length / 2));
    
    const firstHalfQuality = firstHalf.reduce((sum, obs) => sum + this.calculateDetailQuality(obs), 0) / firstHalf.length;
    const secondHalfQuality = secondHalf.reduce((sum, obs) => sum + this.calculateDetailQuality(obs), 0) / secondHalf.length;
    
    const improvement = secondHalfQuality - firstHalfQuality;
    
    if (improvement > 10) return 'improving';
    if (improvement < -10) return 'declining';
    return 'stable';
  }
  
  /**
   * Trouve les mots communs dans plusieurs descriptions
   */
  private static findCommonWords(descriptions: string[]): string[] {
    if (descriptions.length === 0) return [];
    
    const allWords = descriptions.flatMap(desc => 
      desc.split(' ').filter(word => word.length > 3) // Ignorer les mots courts
    );
    
    const wordCount = new Map<string, number>();
    allWords.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Retourner les mots qui apparaissent dans au moins 50% des descriptions
    const threshold = Math.ceil(descriptions.length * 0.5);
    return Array.from(wordCount.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([word, _]) => word);
  }
  
  /**
   * Mappe les données de la base vers le format TypeScript
   */
  private static mapObservations(data: any[]): InvestigationObservation[] {
    return data.map(row => ({
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
      distanceFromDisappearance: row.missing_persons?.location_lat && row.missing_persons?.location_lng && row.location_lat && row.location_lng
        ? this.calculateDistance(row.missing_persons.location_lat, row.missing_persons.location_lng, row.location_lat, row.location_lng)
        : undefined,
      photos: row.photos || undefined,
      photoDescriptions: row.photo_descriptions || undefined
    }));
  }
  
  /**
   * Calcule la distance entre deux points (formule de Haversine)
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  /**
   * Retourne la plage de dates selon le timeRange
   */
  private static getDateRange(timeRange: string): { start: string | null; end: string | null } {
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: weekAgo.toISOString().split('T')[0], end: null };
      
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: monthAgo.toISOString().split('T')[0], end: null };
      
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return { start: quarterAgo.toISOString().split('T')[0], end: null };
      
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return { start: yearAgo.toISOString().split('T')[0], end: null };
      
      default:
        return { start: null, end: null };
    }
  }
}
