// Configuration des rôles utilisateurs avec leurs traductions et permissions

export interface RoleConfig {
  value: 'family' | 'authority' | 'volunteer';
  label: string;
  description: string;
  permissions: string[];
}

export const USER_ROLES: RoleConfig[] = [
  {
    value: 'family',
    label: 'Membre de la famille',
    description: 'Personne proche d\'une personne disparue',
    permissions: [
      'Créer des signalements',
      'Modifier ses propres signalements',
      'Voir tous les signalements publics',
      'Recevoir des alertes géolocalisées'
    ]
  },
  {
    value: 'authority',
    label: 'Forces de l\'ordre',
    description: 'Agent de police, gendarme ou autre autorité',
    permissions: [
      'Créer des signalements',
      'Voir tous les signalements (publics et privés)',
      'Modifier le statut des signalements',
      'Accéder aux données complètes',
      'Recevoir des alertes prioritaires'
    ]
  },
  {
    value: 'volunteer',
    label: 'Bénévole',
    description: 'Personne souhaitant aider dans les recherches',
    permissions: [
      'Voir les signalements publics',
      'Recevoir des alertes géolocalisées',
      'Partager des informations utiles'
    ]
  }
];

export const getRoleConfig = (role: string): RoleConfig | undefined => {
  return USER_ROLES.find(r => r.value === role);
};

export const getRoleLabel = (role: string): string => {
  const config = getRoleConfig(role);
  return config?.label || role;
};

export const getRoleDescription = (role: string): string => {
  const config = getRoleConfig(role);
  return config?.description || '';
};

export const getRolePermissions = (role: string): string[] => {
  const config = getRoleConfig(role);
  return config?.permissions || [];
};
