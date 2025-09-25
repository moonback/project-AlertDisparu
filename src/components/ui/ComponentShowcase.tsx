import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Select, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  LoadingSpinner,
  UserAvatar,
  Alert,
  Badge,
  Skeleton,
  Modal,
  Toast,
  Progress,
  Breadcrumb,
  Pagination,
  SearchInput,
  StatCard,
  FilterPanel,
  Table,
  ProximityAlert
} from './index';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Settings,
  Heart,
  Star,
  Eye,
  Share,
  Plus,
  Filter,
  ChevronRight
} from 'lucide-react';

export const ComponentShowcase: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [progress, setProgress] = useState(65);

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Rapports', href: '/rapports' },
    { label: 'Détails', href: '/rapports/123' }
  ];

  const tableData = [
    { id: 1, name: 'Jean Dupont', age: 25, status: 'Actif', location: 'Paris' },
    { id: 2, name: 'Marie Martin', age: 30, status: 'Retrouvé', location: 'Lyon' },
    { id: 3, name: 'Pierre Durand', age: 45, status: 'Actif', location: 'Marseille' }
  ];

  const tableColumns = [
    { key: 'name', label: 'Nom' },
    { key: 'age', label: 'Âge' },
    { key: 'status', label: 'Statut' },
    { key: 'location', label: 'Localisation' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Design System AlertDisparu</h1>
        <p className="text-xl text-gray-600">Composants UI modernisés avec Tailwind CSS et Lucide React</p>
      </div>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Boutons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="primary">Primaire</Button>
              <Button variant="secondary">Secondaire</Button>
              <Button variant="outline">Contour</Button>
              <Button variant="ghost">Fantôme</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Attention</Button>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Tailles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="xs">Très petit</Button>
              <Button size="sm">Petit</Button>
              <Button size="md">Moyen</Button>
              <Button size="lg">Grand</Button>
              <Button size="xl">Très grand</Button>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Avec icônes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Ajouter</Button>
              <Button rightIcon={<ChevronRight className="h-4 w-4" />}>Suivant</Button>
              <Button isLoading>Chargement...</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Form Elements */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Éléments de formulaire</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Champs de saisie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                label="Nom complet" 
                placeholder="Votre nom"
                leftIcon={<User className="h-5 w-5" />}
              />
              <Input 
                label="Email" 
                type="email" 
                placeholder="votre@email.com"
                leftIcon={<Mail className="h-5 w-5" />}
                success
              />
              <Input 
                label="Mot de passe" 
                type="password" 
                placeholder="Votre mot de passe"
                leftIcon={<Phone className="h-5 w-5" />}
                showPasswordToggle
                error="Le mot de passe est requis"
              />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Sélecteurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Genre"
                placeholder="Sélectionner un genre"
                leftIcon={<User className="h-5 w-5" />}
                options={[
                  { value: 'male', label: 'Homme' },
                  { value: 'female', label: 'Femme' },
                  { value: 'other', label: 'Autre' }
                ]}
              />
              <SearchInput 
                placeholder="Rechercher des rapports..."
                onSearch={(query) => console.log('Recherche:', query)}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cartes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Par défaut</CardTitle>
              <CardDescription>Description de la carte par défaut</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Contenu de la carte avec style par défaut.</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Élevée</CardTitle>
              <CardDescription>Description de la carte élevée</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Contenu de la carte avec ombre plus prononcée.</p>
            </CardContent>
          </Card>

          <Card variant="outlined" interactive>
            <CardHeader>
              <CardTitle>Interactive</CardTitle>
              <CardDescription>Description de la carte interactive</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Contenu de la carte avec effets de survol.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Status Elements */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Éléments de statut</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Par défaut</Badge>
                <Badge variant="success">Succès</Badge>
                <Badge variant="error">Erreur</Badge>
                <Badge variant="warning">Attention</Badge>
                <Badge variant="info">Info</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge size="sm">Petit</Badge>
                <Badge size="md">Moyen</Badge>
                <Badge size="lg">Grand</Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Alertes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="success" title="Succès">
                Opération réussie avec succès.
              </Alert>
              <Alert variant="error" title="Erreur">
                Une erreur s'est produite lors du traitement.
              </Alert>
              <Alert variant="warning" title="Attention">
                Veuillez vérifier vos informations.
              </Alert>
              <Alert variant="info" title="Information">
                Informations importantes à retenir.
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">États de chargement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Spinners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="xs" />
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
                <LoadingSpinner size="xl" />
              </div>
              <div className="space-y-4">
                <LoadingSpinner variant="dots" text="Chargement avec points..." />
                <LoadingSpinner variant="pulse" text="Chargement avec pulsation..." />
                <LoadingSpinner variant="search" text="Recherche en cours..." />
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Squelettes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkeletonCard />
              <SkeletonList />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Components */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Composants interactifs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Modal et Toast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowModal(true)}>
                Ouvrir la modal
              </Button>
              <Button onClick={() => setShowToast(true)}>
                Afficher le toast
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Breadcrumb items={breadcrumbItems} />
              <Pagination 
                currentPage={2} 
                totalPages={10} 
                onPageChange={(page) => console.log('Page:', page)}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Progress and Stats */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progression et statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Barre de progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} max={100} />
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                  -10%
                </Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                  +10%
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Cartes de statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatCard
                title="Rapports actifs"
                value="24"
                icon={<AlertTriangle className="h-6 w-6" />}
                trend="+12%"
                trendUp
              />
              <StatCard
                title="Personnes retrouvées"
                value="156"
                icon={<CheckCircle className="h-6 w-6" />}
                trend="+8%"
                trendUp
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* User Elements */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Éléments utilisateur</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <UserAvatar size="xs" />
                <UserAvatar size="sm" />
                <UserAvatar size="md" />
                <UserAvatar size="lg" />
                <UserAvatar size="xl" />
              </div>
              <div className="flex items-center space-x-4">
                <UserAvatar variant="ring" showIndicator />
                <UserAvatar variant="shadow" showIndicator />
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Tableau</CardTitle>
            </CardHeader>
            <CardContent>
              <Table 
                data={tableData} 
                columns={tableColumns}
                onRowClick={(row) => console.log('Clic sur:', row)}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Specialized Components */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Composants spécialisés</h2>
        <div className="grid grid-cols-1 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Panneau de filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <FilterPanel
                filters={[
                  { key: 'status', label: 'Statut', type: 'select', options: [
                    { value: 'active', label: 'Actif' },
                    { value: 'found', label: 'Retrouvé' }
                  ]},
                  { key: 'age', label: 'Âge', type: 'range', min: 0, max: 100 },
                  { key: 'location', label: 'Localisation', type: 'text' }
                ]}
                onFiltersChange={(filters) => console.log('Filtres:', filters)}
              />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Alerte de proximité</CardTitle>
            </CardHeader>
            <CardContent>
              <ProximityAlert
                distance={2.5}
                location="Paris, France"
                personName="Jean Dupont"
                onContact={() => console.log('Contacté')}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Exemple de modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Ceci est un exemple de modal avec le nouveau design system.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowModal(false)}>
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <Toast
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        title="Notification"
        message="Ceci est un exemple de toast"
        type="success"
        duration={3000}
      />
    </div>
  );
};
