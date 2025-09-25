import { MissingPerson, InvestigationObservation, SavedResolutionScenario, User } from '../types';

/**
 * Système de prompts avancé pour le chatbot AlertDisparu
 */
export class ChatbotPromptSystem {
  
  /**
   * Construit le prompt système principal avec le contexte complet
   */
  static buildSystemPrompt(
    user: User | null,
    availableData: {
      reports: MissingPerson[];
      observations: InvestigationObservation[];
      scenarios: SavedResolutionScenario[];
    }
  ): string {
    // Vérification de sécurité des données
    if (!user) {
      return "Erreur: Utilisateur non connecté";
    }

    if (!availableData || !availableData.reports || !availableData.observations || !availableData.scenarios) {
      return "Erreur: Données non disponibles";
    }

    console.log('📊 Construction du prompt système avec:', {
      user: user.firstName,
      reportsCount: availableData.reports.length,
      observationsCount: availableData.observations.length,
      scenariosCount: availableData.scenarios.length
    });

    const basePrompt = this.getBaseSystemPrompt();
    const contextPrompt = this.buildDataContext(availableData);
    const userContextPrompt = this.buildUserContext(user);
    const capabilitiesPrompt = this.getCapabilitiesPrompt();
    const guidelinesPrompt = this.getGuidelinesPrompt();

    return `
${basePrompt}

${userContextPrompt}

${contextPrompt}

${capabilitiesPrompt}

${guidelinesPrompt}
`;
  }

  /**
   * Prompt de base définissant l'identité et le rôle du chatbot
   */
  private static getBaseSystemPrompt(): string {
    return `
Tu es un assistant IA spécialisé et concis pour les investigations de personnes disparues.

RÔLE ESSENTIEL:
Expert en analyse rapide et recommandations précises pour retrouver les personnes disparues.

DIRECTIVE PRINCIPALE:
Réponds DIRECTEMENT et BRIEVEMENT aux demandes, en allant à l'essentiel. Évite les longs préambules.

PRIORITÉ:
Pertinence > Complétude. Réponses ciblées et actionnables en priorité.
`;
  }

  /**
   * Construit le contexte utilisateur personnalisé
   */
  private static buildUserContext(user: User): string {
    const roleContext = this.getRoleSpecificContext(user.role);
    
    return `
CONTEXTE UTILISATEUR:
- Nom: ${user.firstName} ${user.lastName}
- Rôle: ${user.role}
- Email: ${user.email}

${roleContext}

PERSONNALISATION:
- Langage adapté au rôle
- Actions selon responsabilités
- Informations pertinentes uniquement
`;
  }

  /**
   * Contexte spécifique selon le rôle de l'utilisateur
   */
  private static getRoleSpecificContext(role: string): string {
    switch (role) {
      case 'authority':
        return `CONTEXTE AUTORITÉ: Accès complet, coordination investigations, validation données`;

      case 'family':
        return `CONTEXTE FAMILLE: Support émotionnel, actions concrètes, compréhension procédures`;

      case 'volunteer':
        return `CONTEXTE BÉNÉVOLE: Recherche terrain, informations publiques, guidance sécurité`;

      default:
        return `CONTEXTE GÉNÉRAL: Informations publiques, guidance procédures`;
    }
  }

  /**
   * Construit le contexte des données disponibles
   */
  private static buildDataContext(availableData: {
    reports: MissingPerson[];
    observations: InvestigationObservation[];
    scenarios: SavedResolutionScenario[];
  }): string {
    const { reports, observations, scenarios } = availableData;
    
    // Vérification de sécurité
    if (!reports || !observations || !scenarios) {
      return "Erreur: Données non disponibles";
    }
    
    return `
DONNÉES DISPONIBLES (${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}):

📊 SIGNALEMENTS ACTIFS (${reports.length}):
${this.formatReports(reports.slice(0, 5))}

🔍 OBSERVATIONS RÉCENTES (${observations.length}):
${this.formatObservations(observations.slice(0, 8))}

🎯 SCÉNARIOS DE RÉSOLUTION (${scenarios.length}):
${this.formatScenarios(scenarios.slice(0, 3))}

📈 STATISTIQUES GÉNÉRALES:
${this.calculateStatistics(reports, observations)}
`;
  }

  /**
   * Formate les signalements pour le prompt
   */
  private static formatReports(reports: MissingPerson[]): string {
    if (reports.length === 0) {
      return "Aucun signalement actif";
    }

    console.log('🔍 Formatage des signalements:', reports.slice(0, 2)); // Debug

    return reports.map((report, index) => {
      try {
        const daysSince = Math.floor(
          (new Date().getTime() - new Date(report.dateDisappeared).getTime()) / (1000 * 60 * 60 * 24)
        );
        const urgency = report.isEmergency ? ' URGENCE' : '';
        const priority = this.getPriorityIcon(report.priority);
        
        // Vérification sécurisée des données
        const location = report.locationDisappeared || {};
        const city = location.city || 'Non spécifié';
        const state = location.state || 'Non spécifié';
        const description = report.description || 'Aucune description';
        
        return `
${index + 1}. ${priority} ${report.firstName || 'Nom inconnu'} ${report.lastName || 'Prénom inconnu'} (${report.age || 'Âge inconnu'} ans, ${this.formatGender(report.gender)})
   - Disparu depuis: ${daysSince} jour${daysSince !== 1 ? 's' : ''} (${new Date(report.dateDisappeared).toLocaleDateString('fr-FR')})
   - Lieu: ${city}, ${state}
   - Type: ${this.formatCaseType(report.caseType)}
   - Priorité: ${this.formatPriority(report.priority)} ${urgency}
   - Statut: ${this.formatStatus(report.status)}
   - Description: ${description.substring(0, 150)}${description.length > 150 ? '...' : ''}`;
      } catch (error) {
        console.error('Erreur lors du formatage du signalement:', error, report);
        return `
${index + 1}. ❌ Signalement ${report.id} - Erreur de formatage`;
      }
    }).join('');
  }

  /**
   * Formate les observations pour le prompt
   */
  private static formatObservations(observations: InvestigationObservation[]): string {
    if (observations.length === 0) {
      return "Aucune observation disponible";
    }

    return observations.map((obs, index) => {
      const confidenceIcon = this.getConfidenceIcon(obs.confidenceLevel);
      const verifiedIcon = obs.isVerified ? '✅' : '⏳';
      
      return `
${index + 1}. ${confidenceIcon} ${obs.observerName} - ${new Date(obs.observationDate).toLocaleDateString('fr-FR')}
   - Lieu: ${(obs.location || {}).city || 'Non spécifié'}, ${(obs.location || {}).state || 'Non spécifié'}
   - Confiance: ${this.formatConfidence(obs.confidenceLevel)} ${verifiedIcon}
   - Description: ${obs.description?.substring(0, 120) || 'Aucune description'}${obs.description?.length > 120 ? '...' : ''}
   ${obs.clothingDescription ? `- Vêtements: ${obs.clothingDescription.substring(0, 80)}${obs.clothingDescription.length > 80 ? '...' : ''}` : ''}
   ${obs.behaviorDescription ? `- Comportement: ${obs.behaviorDescription.substring(0, 80)}${obs.behaviorDescription.length > 80 ? '...' : ''}` : ''}`;
    }).join('');
  }

  /**
   * Formate les scénarios pour le prompt
   */
  private static formatScenarios(scenarios: SavedResolutionScenario[]): string {
    if (scenarios.length === 0) {
      return "Aucun scénario de résolution disponible";
    }

    return scenarios.map((scenario, index) => {
      const prob1 = this.getProbabilityIcon(scenario.scenario1.probability);
      const prob2 = this.getProbabilityIcon(scenario.scenario2.probability);
      
      return `
${index + 1}. Généré le ${new Date(scenario.generationDate).toLocaleDateString('fr-FR')}
   - Scénario 1: ${prob1} ${scenario.scenario1.title} (${this.formatProbability(scenario.scenario1.probability)})
   - Scénario 2: ${prob2} ${scenario.scenario2.title} (${this.formatProbability(scenario.scenario2.probability)})
   - Résumé: ${scenario.summary.substring(0, 150)}${scenario.summary.length > 150 ? '...' : ''}`;
    }).join('');
  }

  /**
   * Calcule et formate les statistiques essentielles
   */
  private static calculateStatistics(reports: MissingPerson[], observations: InvestigationObservation[]): string {
    const emergencyReports = reports.filter(r => r.isEmergency).length;
    const highPriorityReports = reports.filter(r => r.priority === 'high' || r.priority === 'critical').length;

    const recentObservations = observations.filter(obs => {
      const obsDate = new Date(obs.observationDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return obsDate >= weekAgo;
    }).length;

    // Statistiques essentielles uniquement
    const stats = [];
    if (emergencyReports > 0) stats.push(`${emergencyReports} urgences`);
    if (highPriorityReports > 0) stats.push(`${highPriorityReports} haute priorité`);
    if (recentObservations > 0) stats.push(`${recentObservations} obs. récentes`);

    return stats.length > 0 ? `- ${stats.join(', ')}` : `- Aucun élément critique`;
  }

  /**
   * Génère un prompt ultra-concis pour les demandes rapides
   */
  static buildQuickResponsePrompt(userMessage: string, userRole: string): string {
    return `
RÉPONSE RAPIDE - MODE ULTRA-CONCIS:

Tu dois répondre en 1-2 phrases maximum, directement à la question.

Question: ${userMessage}

Rôle: ${userRole}

Réponse directe et essentielle uniquement.
`;
  }

  /**
   * Définit les capacités du chatbot
   */
  private static getCapabilitiesPrompt(): string {
    return `
CAPACITÉS CLÉS:

🔍 ANALYSE RAPIDE:
- Identifier patterns et corrélations
- Évaluer crédibilité des témoignages
- Analyser tendances géographiques/temporelles

🎯 RECOMMANDATIONS CIBLÉES:
- Actions prioritaires par impact
- Stratégies de recherche optimisées
- Coordination inter-agences

🧠 SCÉNARIOS PRÉCIS:
- Scénarios réalistes avec probabilités
- Facteurs clés de résolution
- Timelines d'action

📊 DONNÉES ESSENTIELLES:
- Métriques de performance
- Statistiques pertinentes
- Tendances critiques
`;
  }

  /**
   * Définit les guidelines de comportement
   */
  private static getGuidelinesPrompt(): string {
    return `
RÈGLES DE RÉPONSE:

🎯 CONCISION OBLIGATOIRE:
- Réponds DIRECTEMENT sans introduction longue
- Va à l'ESSENTIEL de la demande
- Réponses brèves mais complètes
- Évite les répétitions et les formulations verbeuses

⚡ STRUCTURE OPTIMALE:
- Commence par la réponse principale
- Utilise des listes pour les actions/recommandations
- Classe par priorité (1. Plus important, 2. Secondaire...)
- Termine par des éléments de contexte si nécessaire

📊 PERTINENCE MAXIMALE:
- Adapte la réponse au rôle de l'utilisateur
- Focus sur les informations actionnables
- Élimine les détails non-essentiels
- Priorise la qualité sur la quantité

🔒 SÉCURITÉ:
- Respecte la confidentialité
- Recommande les experts quand nécessaire
`;
  }

  /**
   * Construit un prompt spécialisé pour un type de demande
   */
  static buildSpecializedPrompt(
    requestType: 'analysis' | 'recommendations' | 'scenarios' | 'statistics' | 'investigation',
    context: {
      user: User | null;
      availableData: {
        reports: MissingPerson[];
        observations: InvestigationObservation[];
        scenarios: SavedResolutionScenario[];
      };
    },
    userMessage: string
  ): string {
    const basePrompt = this.buildSystemPrompt(
      context.user as User || null, 
      context.availableData || { reports: [], observations: [], scenarios: [] }
    );
    
    const specializedPrompts = {
      analysis: this.getAnalysisPrompt(),
      recommendations: this.getRecommendationsPrompt(),
      scenarios: this.getScenariosPrompt(),
      statistics: this.getStatisticsPrompt(),
      investigation: this.getInvestigationPrompt()
    };

    return `
${basePrompt}

${specializedPrompts[requestType]}

DEMANDE UTILISATEUR: ${userMessage}

RÉPONSE REQUISE:`;
  }

  private static getAnalysisPrompt(): string {
    return `
MODE ANALYSE CONCISE:
- Analyse directe et ciblée
- Patterns et corrélations clés uniquement
- Fiabilité des données essentielles
- Hypothèses brèves et factuelles
- Focus sur les actions prioritaires
`;
  }

  private static getRecommendationsPrompt(): string {
    return `
MODE RECOMMANDATIONS DIRECTES:
- Actions prioritaires en premier
- Liste claire et numérotée
- Timelines concrètes
- Adapté au rôle utilisateur
- Alternatives rapides si nécessaire
`;
  }

  private static getScenariosPrompt(): string {
    return `
MODE SCÉNARIOS CIBLÉS:
- 2-3 scénarios maximum
- Probabilités réalistes
- Actions spécifiques immédiates
- Facteurs de succès essentiels
`;
  }

  private static getStatisticsPrompt(): string {
    return `
MODE DONNÉES ESSENTIELLES:
- Métriques clés uniquement
- Tendances importantes
- Comparaisons pertinentes
- Insights actionnables
`;
  }

  private static getInvestigationPrompt(): string {
    return `
MODE ENQUÊTE OPTIMISÉE:
- Pistes prioritaires en premier
- Techniques d'investigation directes
- Coordination nécessaire uniquement
- Protocoles de suivi concis
`;
  }

  // Méthodes utilitaires pour le formatage
  private static getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  private static getConfidenceIcon(confidence: string): string {
    switch (confidence) {
      case 'high': return '🟢';
      case 'medium': return '🟡';
      case 'low': return '🔴';
      default: return '⚪';
    }
  }

  private static getProbabilityIcon(probability: string): string {
    switch (probability) {
      case 'high': return '🟢';
      case 'medium': return '🟡';
      case 'low': return '🔴';
      default: return '⚪';
    }
  }

  private static formatGender(gender: string): string {
    switch (gender) {
      case 'male': return 'Homme';
      case 'female': return 'Femme';
      case 'other': return 'Autre';
      default: return gender;
    }
  }

  private static formatCaseType(caseType: string): string {
    switch (caseType) {
      case 'disappearance': return 'Disparition';
      case 'runaway': return 'Fugue';
      case 'abduction': return 'Enlèvement';
      case 'missing_adult': return 'Adulte disparu';
      case 'missing_child': return 'Enfant disparu';
      default: return caseType;
    }
  }

  private static formatPriority(priority: string): string {
    switch (priority) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  }

  private static formatStatus(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'found': return 'Retrouvé';
      case 'closed': return 'Fermé';
      default: return status;
    }
  }

  private static formatConfidence(confidence: string): string {
    switch (confidence) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return confidence;
    }
  }

  private static formatProbability(probability: string): string {
    switch (probability) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return probability;
    }
  }
}
