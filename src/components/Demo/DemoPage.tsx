import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { StatCard } from '../ui/StatCard';
import { CaseTypeBadge } from '../ui/CaseTypeBadge';
import { 
  Search, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Zap, 
  Activity,
  Target,
  CheckCircle,
  Eye,
  Share,
  Mail,
  Lock,
  Plus,
  Filter,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';

export const DemoPage: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'cyber' | 'glass' | 'neon'>('cyber');
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Arrière-plan futuriste */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
      
      {/* Lignes de données en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent animate-data-stream"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/10 to-transparent animate-data-stream" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/10 to-transparent animate-data-stream" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header de démonstration */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-xl animate-pulse"></div>
              <Shield className="h-16 w-16 text-neon-blue relative z-10" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-system-error rounded-full animate-neon-flicker"></div>
            </div>
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-4 tracking-wider">
            ALERTDISPARU
          </h1>
          <p className="text-2xl font-mono text-dark-300 mb-6">
            DÉMONSTRATION DU NOUVEAU DESIGN FUTURISTE
          </p>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-system-success rounded-full animate-pulse"></div>
              <span className="text-sm font-mono text-dark-400">SYSTEM STATUS: ONLINE</span>
            </div>
            <div className="w-px h-6 bg-dark-600"></div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-neon-blue" />
              <span className="text-sm font-mono text-dark-400">COMMAND CENTER ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Sélecteur de variante */}
        <div className="mb-8">
          <Card variant="glass" className="p-6">
            <CardTitle className="text-center mb-4">SÉLECTEUR DE VARIANTE</CardTitle>
            <div className="flex justify-center space-x-4">
              {(['default', 'cyber', 'glass', 'neon'] as const).map((variant) => (
                <Button
                  key={variant}
                  variant={selectedVariant === variant ? 'neon' : 'outline'}
                  onClick={() => setSelectedVariant(variant)}
                  className="uppercase"
                >
                  {variant}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Démonstration des boutons */}
        <div className="mb-12">
          <Card variant={selectedVariant} className="p-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">BOUTONS FUTURISTES</CardTitle>
              <CardDescription className="text-center">
                Différentes variantes de boutons avec effets spéciaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="primary" glow>PRIMAIRE</Button>
                <Button variant="cyber">CYBER</Button>
                <Button variant="glass">GLASS</Button>
                <Button variant="neon" glow>NEON</Button>
                <Button variant="secondary">SECONDAIRE</Button>
                <Button variant="danger">DANGER</Button>
                <Button variant="outline">OUTLINE</Button>
                <Button variant="warning">WARNING</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Démonstration des cartes */}
        <div className="mb-12">
          <Card variant={selectedVariant} className="p-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">CARTES FUTURISTES</CardTitle>
              <CardDescription className="text-center">
                Différentes variantes de cartes avec effets visuels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>CARTE DÉFAUT</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-dark-300">Contenu de la carte par défaut avec style futuriste.</p>
                  </CardContent>
                </Card>

                <Card variant="cyber" glow>
                  <CardHeader>
                    <CardTitle>CARTE CYBER</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-dark-300">Carte avec effet cyber et animation de scan.</p>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>CARTE GLASS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-dark-300">Carte avec effet de verre et transparence.</p>
                  </CardContent>
                </Card>

                <Card variant="neon" glow>
                  <CardHeader>
                    <CardTitle>CARTE NEON</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-dark-300">Carte avec effet néon et pulsation lumineuse.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Démonstration des badges */}
        <div className="mb-12">
          <Card variant={selectedVariant} className="p-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">BADGES FUTURISTES</CardTitle>
              <CardDescription className="text-center">
                Différentes variantes de badges avec animations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">DÉFAUT</Badge>
                  <Badge variant="success">SUCCÈS</Badge>
                  <Badge variant="warning">WARNING</Badge>
                  <Badge variant="error">ERREUR</Badge>
                  <Badge variant="info">INFO</Badge>
                  <Badge variant="neon" glow>NEON</Badge>
                  <Badge variant="cyber">CYBER</Badge>
                  <Badge variant="glass">GLASS</Badge>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Badge variant="success" pulse>PULSE</Badge>
                  <Badge variant="error" glow pulse>GLOW PULSE</Badge>
                  <Badge variant="cyber" glow>CYBER GLOW</Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-display text-white">Badges de type de cas :</h4>
                  <div className="flex flex-wrap gap-3">
                    <CaseTypeBadge caseType="disappearance" priority="medium" />
                    <CaseTypeBadge caseType="abduction" priority="critical" isEmergency />
                    <CaseTypeBadge caseType="missing_child" priority="high" />
                    <CaseTypeBadge caseType="runaway" priority="low" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Démonstration des inputs */}
        <div className="mb-12">
          <Card variant={selectedVariant} className="p-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">CHAMPS DE SAISIE FUTURISTES</CardTitle>
              <CardDescription className="text-center">
                Différentes variantes d'inputs avec effets de focus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  leftIcon={<Mail className="h-5 w-5" />}
                  variant="default"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Votre mot de passe"
                  leftIcon={<Lock className="h-5 w-5" />}
                  showPasswordToggle
                  variant="cyber"
                />
                
                <Input
                  label="Recherche"
                  type="text"
                  placeholder="Rechercher..."
                  leftIcon={<Search className="h-5 w-5" />}
                  variant="glass"
                />
                
                <Input
                  label="Code d'accès"
                  type="text"
                  placeholder="CODE-1234"
                  variant="neon"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Démonstration des cartes de statistiques */}
        <div className="mb-12">
          <Card variant={selectedVariant} className="p-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">CARTES DE STATISTIQUES</CardTitle>
              <CardDescription className="text-center">
                Différentes variantes de cartes de statistiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Cas actifs"
                  value={24}
                  description="En cours d'investigation"
                  icon={<AlertTriangle className="h-6 w-6" />}
                  variant="default"
                />
                
                <StatCard
                  title="Résolus"
                  value={156}
                  description="Cas fermés"
                  icon={<CheckCircle className="h-6 w-6" />}
                  variant="cyber"
                  glow
                />
                
                <StatCard
                  title="Urgences"
                  value={3}
                  description="Cas critiques"
                  icon={<Zap className="h-6 w-6" />}
                  variant="glass"
                  pulse
                />
                
                <StatCard
                  title="Recherches"
                  value={89}
                  description="En cours"
                  icon={<Target className="h-6 w-6" />}
                  variant="neon"
                  glow
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Démonstration des icônes et effets */}
        <div className="mb-12">
          <Card variant={selectedVariant} className="p-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">ICÔNES ET EFFETS VISUELS</CardTitle>
              <CardDescription className="text-center">
                Différentes icônes avec effets lumineux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-neon-blue/10 rounded-xl border border-neon-blue/30 mb-2">
                    <Search className="h-8 w-8 text-neon-blue mx-auto" />
                  </div>
                  <p className="text-xs font-mono text-dark-300">RECHERCHE</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-neon-green/10 rounded-xl border border-neon-green/30 mb-2">
                    <MapPin className="h-8 w-8 text-neon-green mx-auto" />
                  </div>
                  <p className="text-xs font-mono text-dark-300">CARTE</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-system-error/10 rounded-xl border border-system-error/30 mb-2">
                    <AlertTriangle className="h-8 w-8 text-system-error mx-auto animate-pulse" />
                  </div>
                  <p className="text-xs font-mono text-dark-300">ALERTE</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-system-success/10 rounded-xl border border-system-success/30 mb-2">
                    <CheckCircle className="h-8 w-8 text-system-success mx-auto" />
                  </div>
                  <p className="text-xs font-mono text-dark-300">SUCCÈS</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-neon-purple/10 rounded-xl border border-neon-purple/30 mb-2">
                    <Shield className="h-8 w-8 text-neon-purple mx-auto" />
                  </div>
                  <p className="text-xs font-mono text-dark-300">SÉCURITÉ</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-system-warning/10 rounded-xl border border-system-warning/30 mb-2">
                    <Zap className="h-8 w-8 text-system-warning mx-auto" />
                  </div>
                  <p className="text-xs font-mono text-dark-300">URGENCE</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-neon-cyan/10 rounded-xl border border-neon-cyan/30 mb-2">
                    <Activity className="h-8 w-8 text-neon-cyan mx-auto" />
                  </div>
                  <p className="text-xs font-mono text-dark-300">ACTIVITÉ</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-neon-amber/10 rounded-xl border border-neon-amber/30 mb-2">
                    <Target className="h-8 w-8 text-neon-amber mx-auto" />
                  </div>
                  <p className="text-xs font-mono text-dark-300">CIBLE</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer de démonstration */}
        <div className="text-center">
          <Card variant="glass" className="p-8">
            <CardContent>
              <h3 className="text-2xl font-display font-bold text-white mb-4">
                DESIGN FUTURISTE TERMINÉ
              </h3>
              <p className="text-dark-300 font-mono mb-6">
                L'interface AlertDisparu a été transformée en tableau de bord futuriste d'investigation et de coordination.
                Tous les composants utilisent maintenant une palette sombre avec des accents néon, des effets de transparence,
                des animations fluides et une typographie futuriste.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="neon" size="lg" glow>
                  <Shield className="h-5 w-5 mr-2" />
                  SYSTÈME OPÉRATIONNEL
                </Button>
                <Button variant="cyber" size="lg">
                  <Activity className="h-5 w-5 mr-2" />
                  CENTRE DE CONTRÔLE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
