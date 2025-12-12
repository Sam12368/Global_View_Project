🌍 Visualisation des Anomalies de Température Mondiale

Application web interactive permettant de visualiser et d’analyser les anomalies de température globale entre 1880 et 2025.

📋 Table des matières

Fonctionnalités

Démonstration

Installation

Utilisation

Technologies

Structure du projet

Contribution

✨ Fonctionnalités
🗺️ Carte mondiale interactive

Visualisation en heatmap des anomalies de température

Deux modes de sélection :

Mode Latitudes : sélectionner des lignes horizontales

Mode Zones : cliquer ou faire un drag pour sélectionner des cellules 4×4°

Retour visuel immédiat : coloration dynamique, surbrillances, transitions

Entièrement responsive et fluide

📊 Vues analytiques multiples
1️⃣ Graphique (Graph View)

Série temporelle des anomalies (1880–2025)

Comparaison entre plusieurs zones ou groupes

Légende interactive

Ligne verticale indiquant l’année courante

2️⃣ Histogramme (Histogram View)

Répartition des anomalies par longitudes

Clic sur une barre ⇒ mise en évidence des cellules correspondantes sur la carte

Gestion des couleurs, échelle dynamique

3️⃣ Heatmap 2D (Heatmap View)

Matrice Année × Latitude

Clic sur une cellule ⇒ met à jour l’année + sélectionne la latitude

Dégradés de couleur bleu → rouge

🎬 Commandes d’animation

Lecture / Pause

Vitesse d’animation (1× à 3×)

Slider d’année

Saisie manuelle de l’année

Bouton de réinitialisation

🎯 Sélection avancée

Sélection de zones rectangulaires

Création de groupes de zones pour comparer plusieurs régions du globe

Sélection de latitudes climatiques

Synchronisation automatique entre toutes les vues (Map ↔ Graph ↔ Heatmap ↔ Histogram)

🎨 Interface moderne

Layout clair et responsive

Interactions naturelles

Transitions visuelles et feedback instantané

🎥 Démo
npm install
npm run dev


Puis ouvrez : http://localhost:5173

🚀 Installation
Prérequis

Node.js 18+

npm ou yarn

Étapes
git clone https://github.com/Sam12368/Global_View_Project.git
cd Global_View_Project/MainBranch
npm install
npm run dev

🎮 Utilisation
Workflow général

Choisir un mode (Latitudes ou Zones)

Sélectionner sur la carte :

Mode Latitudes : clic horizontal

Mode Zones : clic ou drag pour créer un rectangle

Analyser les résultats dans les vues Graphique / Histogramme / Heatmap

Utiliser l’animation temporelle pour observer les variations

Interagir avec les autres vues :

Clic histogramme ⇒ met en surbrillance les zones

Clic heatmap ⇒ change l’année + sélectionne la latitude

Graphique ⇒ sélectionner des groupes à comparer

Raccourcis clavier

Espace : Lecture/Pause

← / → : Changer d’année

🛠️ Technologies utilisées
Technologies principales

React 18

TypeScript

Vite

Redux Toolkit

Visualisation

Chart.js pour les graphiques

Canvas API pour la World Map & Heatmap

SVG personnalisé

Traitement des données

Fonction d’interpolation pour lisser les valeurs entre les années

Mémorisation (memoization) pour de meilleures performances

Structures optimisées pour les recherches rapides

Style

CSS moderne (variables, flexbox, animations)

Interface responsive

📁 Structure du projet
MainBranch/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   │   ├── AnimationBar/
│   │   ├── Layout/
│   │   ├── SidePanel/
│   │   ├── ViewsGrid/
│   │   └── WorldMap/
│   ├── features/
│   ├── hooks/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── vite.config.ts

🤝 Contribution

Les contributions sont les bienvenues !
Étapes :

Fork du projet

Nouvelle branche :

git checkout -b feature/NouvelleFonctionnalite


Commits :

git commit -m "Ajout d'une nouvelle fonctionnalité"


Push + Pull Request

📄 Licence

Projet réalisé dans le cadre d’une initiative académique de visualisation climatique.

👥 Auteur

@Sam12368

🙏 Remerciements

Données basées sur les mesures climatiques globales

Inspiré par les outils de visualisation de la NASA

Développé avec des technologies modernes de haute performance
