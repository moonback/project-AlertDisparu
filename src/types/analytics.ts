export interface TimelineEvent {
  id: string;
  type: 'observation' | 'verification' | 'update';
  title: string;
  description: string;
  timestamp: string;
  confidence: 'low' | 'medium' | 'high';
  verified: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  metadata?: {
    observerName?: string;
    distanceFromDisappearance?: number;
    hasPhotos?: boolean;
  };
}

export interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number; // 0-1, basé sur le nombre d'observations
  observationCount: number;
  city: string;
  confidence: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface TemporalPattern {
  hour: number;
  dayOfWeek: number;
  month: number;
  observationCount: number;
  averageConfidence: number;
  verifiedPercentage: number;
}

export interface WitnessCredibility {
  observerId: string;
  observerName: string;
  totalObservations: number;
  verifiedObservations: number;
  credibilityScore: number; // 0-100
  factors: {
    consistency: number; // Cohérence des témoignages
    verificationRate: number; // Taux de vérification
    detailQuality: number; // Qualité des détails fournis
    responseTime: number; // Temps de réponse aux vérifications
    photoQuality: number; // Qualité des photos fournies
  };
  trend: 'improving' | 'stable' | 'declining';
  lastObservation: string;
}

export interface AnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  confidence?: ('low' | 'medium' | 'high')[];
  verified?: boolean;
  location?: {
    city?: string;
    radius?: number; // en km
    center?: { lat: number; lng: number };
  };
  observer?: string;
}

export interface AnalyticsData {
  timeline: TimelineEvent[];
  heatmap: HeatmapData[];
  temporalPatterns: TemporalPattern[];
  witnessCredibility: WitnessCredibility[];
  statistics: {
    totalObservations: number;
    verifiedObservations: number;
    averageConfidence: number;
    topCities: Array<{ city: string; count: number }>;
    peakHours: Array<{ hour: number; count: number }>;
    credibilityDistribution: {
      high: number; // 80-100
      medium: number; // 60-79
      low: number; // 0-59
    };
  };
}

export interface AnalyticsQuery {
  missingPersonId: string;
  filters?: AnalyticsFilters;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}
