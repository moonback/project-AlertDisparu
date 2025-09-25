refonte complète du design de l'application mobile-first "AlertDisparu"
1. Contexte Général du Projet
L'application "AlertDisparu" est une plateforme moderne, développée en React (TypeScript, Vite, Tailwind CSS), qui vise à faciliter le signalement et la recherche de personnes disparues. Elle intègre Supabase pour l'authentification et la gestion de la base de données, et Leaflet pour la cartographie interactive. La refonte actuelle se concentre sur une amélioration significative du design pour offrir une expérience utilisateur (UX) optimale, en priorisant une approche mobile-first.
2. Objectifs de la Refonte du Design
Modernisation de l'UI/UX : Créer une interface utilisateur visuellement attrayante, intuitive et cohérente, qui reflète la nature sérieuse et l'importance de l'application, tout en restant facile à utiliser.
Mobile-First Design : Assurer que le design est optimisé et fluide sur les appareils mobiles avant tout, avec une adaptation élégante aux écrans plus grands (tablette, desktop).
Cohérence Visuelle : Appliquer un design system uniforme sur l'ensemble de l'application, en utilisant Tailwind CSS et les icônes Lucide React.
Accessibilité : Améliorer l'accessibilité pour tous les utilisateurs.
Performance : Maintenir et améliorer la réactivité et la fluidité de l'application.
Personnalisation : Rendre l'expérience utilisateur plus personnelle et professionnelle.
3. Composants et Pages Clés à Designer (avec améliorations spécifiques)
A. Authentification (Pages : /connexion, /inscription)
Formulaires :
Design épuré et moderne, facile à remplir.
Feedback visuel clair pour la validation des champs et les messages d'erreur.
Animations subtiles pour les transitions et les états de chargement.
Messages : Affichage clair et centré des messages d'erreur (ex: "Erreur de connexion", "Mots de passe ne correspondent pas") et de succès.
Liens : Mise en évidence des liens vers l'inscription/connexion.
B. Navigation et Layout (Composants : Header, Layout, UserMenu)
Header :
Logo "AlertDisparu" (icône Search de Lucide React, texte en gras) bien visible.
Navigation claire et intuitive pour les utilisateurs authentifiés (/rapports, /carte, /signalement).
Boutons d'action (Signaler une disparition) mis en évidence.
Menu Utilisateur (UserMenu) :
Intégration de la photo de profil (UserAvatar) dans le header.
Menu déroulant stylisé avec informations utilisateur (nom, email, rôle traduit) et liens rapides (Mon Profil, Paramètres, Déconnexion).
Animations fluides pour l'ouverture/fermeture.
Footer (à ajouter si pertinent) : Design simple et informatif avec liens importants (confidentialité, contact, etc.).
Layout Général : Structure d'une colonne sur mobile, potentiellement deux colonnes sur desktop (ex: contenu principal + sidebar).
C. Gestion des Rapports
Liste des Rapports (Page : /rapports) :
Mise en page des cartes de rapports (ex: ReportCard) claire, avec les informations essentielles (nom, âge, lieu, date, photo).
Icônes pertinentes pour le statut, le genre, etc.
Options de tri et de filtre facilement accessibles et visuellement intégrées.
Détail d'un Rapport (Page : /rapports/:id) :
Page dédiée avec toutes les informations sur la personne disparue.
Affichage de la photo principale et d'autres images si disponibles.
Section pour les informations de localisation avec une mini-carte interactive.
Boutons d'action clairs (ex: "Contacter le rapporteur", "Partager l'alerte").
Formulaire de Signalement (Page : /signalement) :
Formulaire multi-étapes ou sections claires pour la saisie des informations (informations sur la personne, localisation, description, contact du rapporteur).
Validation en temps réel avec feedback visuel.
Intégration d'un sélecteur de date et d'un champ pour la géolocalisation.
Option d'upload de photo avec prévisualisation.
D. Carte Interactive (Page : /carte)
Mise en page : La carte doit être l'élément central, avec des légendes claires.
Marqueurs :
Icônes personnalisées pour les positions de disparition (rouge) et la position de l'utilisateur (bleu).
Popups informatifs au clic sur les marqueurs, incluant photo, nom, âge, localisation et un bouton "Voir les détails".
Alertes de Proximité :
Bannière d'alerte visible et stylisée pour indiquer les personnes disparues à proximité de l'utilisateur.
Informations synthétiques sur le nombre de personnes et la distance.
Légende : Une légende claire expliquant les différents marqueurs et informations affichées.
E. Page de Profil (Page : /profil)
Design : Layout adaptable (colonne unique sur mobile, deux colonnes sur desktop).
Informations Personnelles :
Formulaire de modification du profil (prénom, nom, email, rôle) avec validation.
Section pour le changement de mot de passe.
Gestion de la Photo de Profil (ProfilePicture) :
Interface conviviale pour l'upload d'image (bouton d'upload, indicateur de chargement, prévisualisation).
Gestion des erreurs de fichier (taille, type).
Indicateur visuel si aucune photo n'est présente.
Statistiques Utilisateur : Affichage clair des statistiques (rapports créés, actifs, retrouvés).
Gestion des Rapports : Liste des rapports créés par l'utilisateur avec leur statut.
Activité Récente (à développer) : Section pour les actions récentes (rapports consultés, alertes).
F. Composants UI Génériques (Button, Input, Select, Card, LoadingSpinner, UserAvatar, SetupHelper)
Consistance : Tous les composants doivent respecter le thème visuel général (couleurs, typographie, espacements, ombres).
États : Définir les états hover, focus, active, disabled, loading pour les boutons et champs de formulaire.
Feedback : Indicateurs visuels clairs pour le chargement (LoadingSpinner), les messages de succès/erreur.
SetupHelper : Si Supabase n'est pas configuré, une bannière d'alerte avec des instructions claires pour la configuration et un mode démo intuitif.
4. Design System et Technologies
Styling : Tailwind CSS pour toutes les classes utilitaires.
Icônes : Lucide React (pas d'autres bibliothèques d'icônes).
Typographie : Choisir une ou deux polices de caractères modernes et lisibles pour les titres et le corps de texte.
Palette de Couleurs : Utiliser une palette de couleurs cohérente, avec le rouge (red-600) comme couleur d'accentuation principale pour les actions clés, et des tons de gris pour les éléments neutres. Une couleur orange/ambre (amber-600) pour les avertissements/alertes.
Animations/Transitions : Utiliser des transitions douces et des animations subtiles pour améliorer l'expérience utilisateur (ex: transition-colors, rotate-180).
Illustrations / Visuels : Penser à l'utilisation de visuels adaptés et respectueux de la thématique.
5. Comportements Clés à Intégrer dans le Design
Responsive Design : Adapter la mise en page de toutes les pages et composants pour une expérience fluide sur mobile, tablette et desktop.
États de Chargement : Afficher des spinners ou des skeletons pour indiquer que du contenu est en cours de chargement.
Gestion des Erreurs : Messages d'erreur localisés et contextuels pour les formulaires et les opérations backend.
Mode Démo : Une interface claire indiquant le mode démo si Supabase n'est pas configuré, avec une bannière informative.
Localisation : Traduction complète en français, y compris les messages d'erreur et les labels.