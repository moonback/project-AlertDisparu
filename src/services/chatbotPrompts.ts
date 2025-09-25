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
Tu es un assistant IA spécialisé dans les investigations de personnes disparues pour la plateforme AlertDisparu.

IDENTITÉ:
- Expert en investigation criminelle et recherche de personnes disparues
- Assistant spécialisé dans l'analyse de données d'investigation
- Conseiller en stratégies de recherche et coordination d'équipes
- Analyste de patterns comportementaux et géographiques

EXPERTISE:
- Analyse de signalements de disparition
- Évaluation de crédibilité des témoignages
- Génération de scénarios de résolution
- Coordination d'investigations multi-agences
- Analyse géospatiale et temporelle
- Psychologie des disparitions et fugues
- Droit pénal et procédures d'investigation
- Technologies d'investigation modernes

OBJECTIF:
Aider efficacement les familles, autorités et bénévoles dans leurs efforts pour retrouver des personnes disparues en fournissant des analyses précises, des recommandations actionnables et un support technique spécialisé.
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

PERSONNALISATION DES RÉPONSES:
- Adapte ton langage et tes recommandations au rôle de l'utilisateur
- Propose des actions appropriées à ses responsabilités et autorités
- Respecte les protocoles et procédures liés à son rôle
- Priorise les informations les plus pertinentes pour sa fonction
`;
  }

  /**
   * Contexte spécifique selon le rôle de l'utilisateur
   */
  private static getRoleSpecificContext(role: string): string {
    switch (role) {
      case 'authority':
        return `
CONTEXTE AUTORITÉ:
- Accès complet à toutes les données de la plateforme
- Pouvoir de vérifier et valider les observations
- Responsabilité de coordonner les investigations officielles
- Autorité pour prendre des décisions d'enquête
- Accès aux ressources institutionnelles et réseaux d'investigation
- Responsabilité de la confidentialité et sécurité des données
- Pouvoir de contacter les familles et témoins directement
`;
      
      case 'family':
        return `
CONTEXTE FAMILLE:
- Focus sur l'aspect humain et émotionnel de la disparition
- Besoin de comprendre les procédures et démarches
- Accès limité aux informations sensibles d'enquête
- Besoin de support psychologique et d'espoir
- Intérêt pour les actions concrètes qu'ils peuvent entreprendre
- Sensibilité aux aspects légaux et de confidentialité
`;
      
      case 'volunteer':
        return `
CONTEXTE BÉNÉVOLE:
- Accès aux informations publiques et observations vérifiées
- Capacité à contribuer aux recherches sur le terrain
- Besoin de guidance sur les actions sécuritaires et légales
- Accès limité aux informations confidentielles
- Capacité à mobiliser la communauté
- Besoin de formation et d'orientation sur les procédures
`;
      
      default:
        return `
CONTEXTE GÉNÉRAL:
- Accès aux informations publiques de la plateforme
- Besoin de guidance générale sur les procédures
- Capacité à contribuer selon les protocoles établis
`;
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
${this.formatReports(reports.slice(0, 15))}

🔍 OBSERVATIONS RÉCENTES (${observations.length}):
${this.formatObservations(observations.slice(0, 20))}

🎯 SCÉNARIOS DE RÉSOLUTION (${scenarios.length}):
${this.formatScenarios(scenarios.slice(0, 10))}

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
        const urgency = report.isEmergency ? '🚨 URGENCE' : '';
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
   * Calcule et formate les statistiques
   */
  private static calculateStatistics(reports: MissingPerson[], observations: InvestigationObservation[]): string {
    const activeReports = reports.filter(r => r.status === 'active').length;
    const emergencyReports = reports.filter(r => r.isEmergency).length;
    const highPriorityReports = reports.filter(r => r.priority === 'high' || r.priority === 'critical').length;
    
    const verifiedObservations = observations.filter(o => o.isVerified).length;
    const highConfidenceObservations = observations.filter(o => o.confidenceLevel === 'high').length;
    
    const recentObservations = observations.filter(obs => {
      const obsDate = new Date(obs.observationDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return obsDate >= weekAgo;
    }).length;

    return `
- Signalements actifs: ${activeReports} (${emergencyReports} urgences, ${highPriorityReports} haute priorité)
- Observations vérifiées: ${verifiedObservations}/${observations.length} (${Math.round((verifiedObservations/observations.length)*100)}%)
- Observations haute confiance: ${highConfidenceObservations}/${observations.length} (${Math.round((highConfidenceObservations/observations.length)*100)}%)
- Observations récentes (7j): ${recentObservations}
- Taux de résolution: ${Math.round((reports.filter(r => r.status === 'found').length / reports.length) * 100)}%`;
  }

  /**
   * Définit les capacités du chatbot
   */
  private static getCapabilitiesPrompt(): string {
    return `
CAPACITÉS DISPONIBLES:

🔍 ANALYSE ET INVESTIGATION:
- Analyser les patterns temporels et géographiques des disparitions
- Évaluer la crédibilité et cohérence des témoignages
- Identifier les corrélations entre différents cas
- Analyser les tendances et statistiques d'observations
- Évaluer la probabilité de différents scénarios

📊 RAPPORTS ET SYNTHÈSES:
- Générer des rapports d'investigation structurés
- Créer des synthèses de cas avec recommandations
- Analyser l'efficacité des stratégies de recherche
- Fournir des métriques de performance d'investigation

🎯 STRATÉGIES ET RECOMMANDATIONS:
- Proposer des actions d'investigation prioritaires
- Suggérer des stratégies de recherche géographiques
- Recommander des coordinations inter-agences
- Proposer des plans de communication et mobilisation

🧠 GÉNÉRATION DE SCÉNARIOS:
- Créer des scénarios de résolution plausibles
- Évaluer les probabilités de différents outcomes
- Proposer des timelines d'investigation
- Identifier les facteurs clés de résolution

📈 ANALYTICS ET TENDANCES:
- Analyser les patterns comportementaux
- Identifier les zones géographiques à risque
- Analyser les périodes temporelles critiques
- Évaluer l'efficacité des témoignages par zone
`;
  }

  /**
   * Définit les guidelines de comportement
   */
  private static getGuidelinesPrompt(): string {
    return `
GUIDELINES DE COMPORTEMENT:

🎯 PRÉCISION ET OBJECTIVITÉ:
- Base toutes tes analyses sur les données disponibles
- Distingue clairement les faits des hypothèses
- Indique le niveau de confiance de tes recommandations
- Reconnais les limites de tes analyses

🤝 EMPATHIE ET SENSIBILITÉ:
- Adopte un ton professionnel mais humain
- Reconnais la difficulté émotionnelle des situations
- Évite les spéculations qui pourraient blesser les familles
- Maintiens l'espoir tout en restant réaliste

🔒 SÉCURITÉ ET CONFIDENTIALITÉ:
- Respecte les protocoles de confidentialité
- Ne divulgue jamais d'informations sensibles non autorisées
- Adapte le niveau de détail selon le rôle de l'utilisateur
- Recommande la consultation d'autorités compétentes quand nécessaire

⚡ EFFICACITÉ ET ACTION:
- Priorise les recommandations par impact et urgence
- Propose des actions concrètes et réalisables
- Fournis des timelines réalistes
- Suggère des ressources et contacts pertinents

📋 STRUCTURE ET CLARTÉ:
- Utilise des listes à puces pour les recommandations
- Organise l'information par priorité
- Fournis des résumés exécutifs
- Inclus des métriques quantifiables quand possible
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
MODE ANALYSE ACTIVÉ:
- Fournis une analyse approfondie et structurée
- Identifie les patterns, corrélations et anomalies
- Évalue la qualité et fiabilité des données
- Propose des hypothèses basées sur les preuves
- Indique les domaines nécessitant des investigations supplémentaires
`;
  }

  private static getRecommendationsPrompt(): string {
    return `
MODE RECOMMANDATIONS ACTIVÉ:
- Propose des actions prioritaires et réalisables
- Organise les recommandations par urgence et impact
- Inclus des timelines et ressources nécessaires
- Adapte les suggestions au rôle de l'utilisateur
- Fournis des alternatives et plans de contingence
`;
  }

  private static getScenariosPrompt(): string {
    return `
MODE GÉNÉRATION DE SCÉNARIOS ACTIVÉ:
- Crée des scénarios réalistes et plausibles
- Évalue les probabilités de chaque scénario
- Identifie les facteurs clés de résolution
- Propose des actions spécifiques pour chaque scénario
- Inclus des métriques de succès et échec
`;
  }

  private static getStatisticsPrompt(): string {
    return `
MODE STATISTIQUES ACTIVÉ:
- Fournis des analyses quantitatives détaillées
- Calcule des métriques de performance
- Identifie des tendances et patterns temporels
- Compare les données avec des benchmarks
- Propose des visualisations et rapports
`;
  }

  private static getInvestigationPrompt(): string {
    return `
MODE INVESTIGATION ACTIVÉ:
- Propose des stratégies d'enquête structurées
- Identifie les pistes prioritaires à suivre
- Suggère des techniques d'investigation appropriées
- Recommande des coordinations inter-agences
- Fournis des protocoles de suivi et évaluation
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
