# 🏗️ Architecture et Flux de Données

Ce document explique l'architecture de l'application, les patterns utilisés et le flux de données du début à la fin lors d'une interaction utilisateur.

## 📋 Table des Matières
- [Vue d'ensemble de l'architecture](#vue-densemble-de-larchitecture)
- [Stack technique](#stack-technique)
- [Structure Redux](#structure-redux)
- [Flux de données détaillé](#flux-de-données-détaillé)
- [Exemples d'interactions](#exemples-dinteractions)
- [Optimisations et performance](#optimisations-et-performance)

---

## 🏛️ Vue d'ensemble de l'architecture

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Redux Store (Single Source of Truth) │  │
│  │  ┌────────┬────────┬───────────┬────────┬────────┐   │  │
│  │  │ data   │ year   │ selection │ views  │ theme  │   │  │
│  │  └────────┴────────┴───────────┴────────┴────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                              ↕                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Custom Hooks Layer (useXxx)              │  │
│  │    useData | useYear | useSelections | useViews      │  │
│  └───────────────────────────────────────────────────────┘  │
│                              ↕                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Components Layer                     │  │
│  │   WorldMap | GraphView | Histogram | Heatmap         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Pattern Architectural : **Flux Unidirectionnel**

L'application suit le pattern **Redux + React** avec un flux de données strictement unidirectionnel :

```
Action → Reducer → Store → Components → UI
   ↑                                      ↓
   └──────────── User Interaction ────────┘
```

---

## 🛠️ Stack Technique

### Gestion d'État : Redux Toolkit

**Redux** est le cœur de l'application, gérant TOUT l'état global :

```typescript
// Store configuration (src/app/store.ts)
{
  data: DataState,          // Données JSON de température
  year: YearState,          // Année courante (1880-2025)
  animation: AnimationState, // État play/pause, vitesse
  selection: SelectionState, // Zones et latitudes sélectionnées
  views: ViewsState,        // Visibilité des vues
  theme: ThemeState         // Thème dark/light
}
```

**Pourquoi Redux ?**
- ✅ **Source unique de vérité** : Un seul état partagé
- ✅ **Prévisibilité** : Les changements sont tracés et prévisibles
- ✅ **Synchronisation** : Tous les composants sont automatiquement synchronisés
- ✅ **DevTools** : Débogage facilité avec Redux DevTools

### Abstraction : Custom Hooks

Au lieu d'exposer directement Redux aux composants, on utilise des **custom hooks** :

```typescript
// ❌ Mauvais : Couplage direct à Redux
const dispatch = useDispatch();
dispatch(setYear(2000));

// ✅ Bon : Abstraction via custom hook
const { setYear } = useYear();
setYear(2000);
```

**Avantages :**
- 🔒 **Encapsulation** : La logique Redux est cachée
- 🔄 **Réutilisabilité** : Hooks réutilisables partout
- 🧪 **Testabilité** : Plus facile à tester
- 📝 **Lisibilité** : Code plus clair et concis

---

## 🗂️ Structure Redux

### 1. Data Slice (`features/data/dataSlices.ts`)

**Responsabilité** : Charger et stocker les données de température

```typescript
interface DataState {
  tempData: TempData;    // Données brutes du JSON
  loading: boolean;      // État de chargement
  error: string | null;  // Erreurs éventuelles
}

// Actions
loadData()  // Charge le fichier JSON
```

### 2. Year Slice (`features/year/yearSlices.ts`)

**Responsabilité** : Gérer l'année courante

```typescript
interface YearState {
  currentYear: number;   // 1880-2025
}

// Actions
setYear(year)   // Change l'année
nextYear()      // Année suivante
prevYear()      // Année précédente
```

### 3. Selection Slice (`features/selection/selectionSlices.ts`)

**Responsabilité** : Gérer les sélections de zones et latitudes

```typescript
interface SelectionState {
  mode: "areas" | "latitudes";
  selectedLatitudes: number[];
  selectedLongitude: number | null;  // Depuis l'histogramme
  areas: AreaSelection[];
  groups: GroupSelection[];
  activeGroupIds: number[];
  highlightedCellIds: number[];
}

// Actions principales
setMode(mode)
addLatitude(lat)
removeLatitude(lat)
clearLatitudes()
setSelectedLongitude(lon)
createAreaFromCells(cellIds)
removeArea(areaId)
createGroupFromAreas(areaIds)
setHighlightedCells(cellIds)
```

### 4. Animation Slice (`features/animation/animationSlices.ts`)

**Responsabilité** : Contrôler l'animation temporelle

```typescript
interface AnimationState {
  isPlaying: boolean;
  speed: number;  // 1x, 1.5x, 2x, 2.5x, 3x
}

// Actions
playAnimation()
pauseAnimation()
setSpeed(speed)
```

### 5. Views Slice (`features/views/viewsSlices.ts`)

**Responsabilité** : Afficher/masquer les vues

```typescript
interface ViewsState {
  showGraph: boolean;
  showHistogram: boolean;
  showHeatmap: boolean;
}

// Actions
toggleView(viewName)
```

---

## 🔄 Flux de Données Détaillé

### Exemple 1 : Clic sur la WorldMap (Mode Latitudes)

**Scénario** : L'utilisateur clique sur la carte pour sélectionner une latitude

#### Étape 1 : Événement utilisateur

```tsx
// WorldMap.tsx
function handleClickLat(e: React.MouseEvent<HTMLCanvasElement>) {
  if (mode !== "latitudes") return;
  
  // 1. Convertir coordonnées souris → latitude
  const { y } = getMousePos(e);
  const lat = 90 - (y / HEIGHT) * 180;
  
  // 2. Arrondir à 4° et limiter
  const snapped = Math.round(lat / 4) * 4;
  const clamped = Math.max(-88, Math.min(88, snapped));
  
  // 3. Appeler le hook
  addLatitude(clamped);  // ← Custom hook
}
```

#### Étape 2 : Hook → Action Redux

```typescript
// hooks/useSelection.ts
export function useSelections() {
  const dispatch = useAppDispatch();
  
  return {
    addLatitude: (lat: number) => dispatch(addLatitude(lat)),
    // autres actions...
  };
}
```

#### Étape 3 : Reducer modifie le state

```typescript
// features/selection/selectionSlices.ts
addLatitude(state, action: PayloadAction<number>) {
  const lat = action.payload;
  if (!state.selectedLatitudes.includes(lat)) {
    state.selectedLatitudes.push(lat);  // Immutabilité gérée par Immer
  }
}
```

#### Étape 4 : Store notifie les composants

Redux déclenche un re-render de **tous les composants** qui utilisent `selectedLatitudes` :

```typescript
// Tous ces composants se mettent à jour automatiquement
const { selectedLatitudes } = useSelections();
```

#### Étape 5 : Composants réagissent

**WorldMap** : Redessine les lignes de latitude
```tsx
// WorldMap.tsx - useEffect avec dépendance
useEffect(() => {
  drawOverlay();  // Redessine les lignes rouges
}, [selectedLatitudes]);  // Se déclenche quand selectedLatitudes change
```

**HistogramView** : Recalcule les données
```tsx
// HistogramView.tsx - useMemo avec dépendance
const histogramData = useMemo(() => {
  if (selectedLatitudes.length === 0) return [];
  
  // Recalcule les moyennes pour chaque longitude
  return longitudes.map(lon => ({
    longitude: lon,
    avgValue: calculateAverage(lon, selectedLatitudes)
  }));
}, [selectedLatitudes, currentYear]);  // Recalcul auto
```

**GraphView** : Met à jour le graphique
```tsx
// GraphView.tsx
useEffect(() => {
  if (selectedLatitudes.length === 0) return;
  
  // Recalcule les données du graphique
  const newData = computeGraphData(selectedLatitudes);
  updateChart(newData);
}, [selectedLatitudes]);
```

**HeatmapView** : Affiche uniquement les latitudes sélectionnées
```tsx
// HeatmapView.tsx
const heatmapData = useMemo(() => {
  // Filtre pour n'afficher que les latitudes sélectionnées
  const latitudes = selectedLatitudes.filter(lat => lat % 4 === 0);
  // ...
}, [selectedLatitudes]);
```

---

### Exemple 2 : Clic sur une barre de l'histogramme

**Scénario** : L'utilisateur clique sur une barre pour voir la longitude sur la carte

#### Flux complet

```
1. USER : Clic sur barre (longitude = -120°)
   ↓
2. HistogramView.tsx
   handleBarClick(-120)
   ↓
3. Custom Hook
   setSelectedLongitude(-120)
   ↓
4. Redux Action
   dispatch({ type: "selection/setSelectedLongitude", payload: -120 })
   ↓
5. Reducer
   state.selectedLongitude = -120
   ↓
6. Store Update
   Nouveau state propagé à tous les composants abonnés
   ↓
7. WorldMap.tsx
   useEffect détecte le changement
   ↓
8. WorldMap redessine
   - Mode "latitudes" uniquement
   - Filtre les cellules : lon === -120 && lat in selectedLatitudes
   - Dessine des carrés jaunes 4x4 pour chaque cellule
```

#### Code correspondant

```tsx
// 1-2. HistogramView : Gestion du clic
const handleBarClick = (longitude: number) => {
  if (selectedLongitude === longitude) {
    setSelectedLongitude(null);  // Toggle off
  } else {
    setSelectedLongitude(longitude);  // Select
  }
};

// 7-8. WorldMap : Réaction au changement
useEffect(() => {
  // ... autres dessins ...
  
  // Carrés 4x4 pour la longitude sélectionnée
  if (mode === "latitudes" && selectedLongitude !== null) {
    const matchingCells = tempData.tempanomalies.filter(
      cell => cell.lon === selectedLongitude && 
              selectedLatitudes.includes(cell.lat)
    );
    
    matchingCells.forEach(cell => {
      // Dessiner carré jaune
      ctx.strokeStyle = "rgba(251,191,36,1)";
      ctx.strokeRect(x, y, cellW, cellH);
    });
  }
}, [mode, selectedLongitude, selectedLatitudes]);  // Dépendances
```

---

### Exemple 3 : Animation temporelle

**Scénario** : L'utilisateur clique sur Play pour lancer l'animation

#### Flux en 4 acteurs

```
┌─────────────┐    ┌──────────────┐    ┌───────────┐    ┌────────────┐
│ AnimationBar│ → │ Animation    │ → │ Year      │ → │ All Views  │
│ (UI)        │    │ Slice        │    │ Slice     │    │ (Update)   │
└─────────────┘    └──────────────┘    └───────────┘    └────────────┘
```

#### Code détaillé

```tsx
// 1. AnimationBar : Bouton Play
<button onClick={() => play()}>▶</button>

// 2. Hook animation
const { play } = useAnimation();
// → dispatch(playAnimation())
// → state.isPlaying = true

// 3. useEffect dans AnimationBar surveille isPlaying
useEffect(() => {
  if (!playing) return;
  
  const baseDelay = 200;
  const delay = baseDelay / speed;
  
  const id = setInterval(() => {
    next();  // Avance d'une année
  }, delay);
  
  return () => clearInterval(id);
}, [playing, speed]);

// 4. Hook year
const { next } = useYear();
// → dispatch(nextYear())
// → state.currentYear++

// 5. Tous les composants qui dépendent de currentYear se mettent à jour
// - WorldMap redessine avec nouvelles couleurs
// - GraphView déplace la ligne verticale
// - HistogramView recalcule les moyennes
// - HeatmapView met en surbrillance l'année
```

---

## 🎨 Patterns et Conventions

### 1. Séparation des responsabilités

```
├── features/          # Redux slices (LOGIQUE)
│   ├── data/         # Chargement des données
│   ├── selection/    # État de sélection
│   └── year/         # État de l'année
│
├── hooks/            # Custom hooks (ABSTRACTION)
│   ├── useData.ts    # Interface pour les données
│   ├── useSelection.ts
│   └── useYear.ts
│
└── components/       # React components (PRÉSENTATION)
    ├── WorldMap/     # Affichage uniquement
    ├── GraphView/
    └── HeatmapView/
```

### 2. Hooks personnalisés

Chaque slice Redux a son hook correspondant :

```typescript
// features/year/yearSlices.ts  →  hooks/useYear.ts
// features/selection/selectionSlices.ts  →  hooks/useSelection.ts
// features/data/dataSlices.ts  →  hooks/useData.ts
```

**Convention** : Un hook expose :
- Les **valeurs** du state (lecture)
- Les **actions** (écriture)

```typescript
export function useYear() {
  const state = useAppSelector(s => s.year);
  const dispatch = useAppDispatch();
  
  return {
    // LECTURE
    currentYear: state.currentYear,
    
    // ÉCRITURE
    setYear: (year: number) => dispatch(setYear(year)),
    next: () => dispatch(nextYear()),
    prev: () => dispatch(prevYear())
  };
}
```

### 3. Immutabilité avec Immer

Redux Toolkit utilise **Immer** pour simplifier les mises à jour immutables :

```typescript
// ❌ Sans Immer (ancien Redux)
return {
  ...state,
  selectedLatitudes: [...state.selectedLatitudes, action.payload]
};

// ✅ Avec Immer (Redux Toolkit)
state.selectedLatitudes.push(action.payload);  // Semble mutable mais c'est immutable !
```

### 4. Memoization avec useMemo

Pour éviter les recalculs inutiles :

```tsx
// Recalcul UNIQUEMENT si selectedLatitudes ou currentYear change
const histogramData = useMemo(() => {
  return expensiveCalculation(selectedLatitudes, currentYear);
}, [selectedLatitudes, currentYear]);
```

### 5. Effets secondaires avec useEffect

Pour synchroniser avec le DOM ou des APIs externes :

```tsx
// Redessine le canvas UNIQUEMENT quand les dépendances changent
useEffect(() => {
  drawCanvas();
}, [currentYear, selectedLatitudes, tempData]);
```

---

## ⚡ Optimisations et Performance

### 1. Réduction du nombre de cellules (HeatmapView)

**Problème initial** : 180 latitudes × 146 années = **26,280 cellules** → Lenteur

**Solution** :
```typescript
// Filtrer seulement tous les 4°
const latitudes = allLatitudes.filter(lat => lat % 4 === 0);
// → 45 latitudes

// Années tous les 10 ans
const years = Array.from({ length: 15 }, (_, i) => 1880 + i * 10);
// → 15 années

// Total : 45 × 15 = 675 cellules (87% de réduction !)
```

### 2. Pre-groupement des données

**Problème** : Recherche O(n) pour chaque cellule

**Solution** : Map pré-calculée
```typescript
// O(1) lookup au lieu de O(n)
const dataMap = useMemo(() => {
  const map = new Map<string, number>();
  cells.forEach(cell => {
    const key = `${cell.lat}-${cell.year}`;
    map.set(key, cell.value);
  });
  return map;
}, [cells]);

// Usage
const value = dataMap.get(`${lat}-${year}`);  // Instant !
```

### 3. Canvas double-buffer

Pour les overlays (WorldMap, HeatmapView) :

```tsx
// Canvas base : Rarement redessiné
<canvas ref={baseCanvasRef} />

// Canvas overlay : Redessine souvent (sélections)
<canvas ref={overlayCanvasRef} style={{ position: 'absolute' }} />
```

**Avantage** : On ne redessine que l'overlay, pas toute la carte !

### 4. Debouncing implicite via useMemo

```typescript
// Recalcul UNIQUEMENT si les dépendances changent
// Pas de recalcul si d'autres props changent
const data = useMemo(() => heavyComputation(), [dep1, dep2]);
```

### 5. Lazy rendering

Les vues sont conditionnellement rendues :

```tsx
{showGraph && <GraphView />}
{showHistogram && <HistogramView />}
{showHeatmap && <HeatmapView />}
```

**Avantage** : Les composants non visibles ne sont pas montés !

---

## 🔍 Debugging et DevTools

### Redux DevTools

Chaque action est tracée avec :
- **Type** : `selection/addLatitude`
- **Payload** : `{ lat: -44 }`
- **Diff** : Avant/après du state
- **Time travel** : Revenir en arrière

### React DevTools

- Voir la hiérarchie des composants
- Inspecter les props/state
- Profiler les rendus

### Console logs stratégiques

```typescript
useEffect(() => {
  console.log('[WorldMap] Redrawing overlay', {
    mode,
    selectedLatitudes,
    selectedLongitude
  });
  drawOverlay();
}, [mode, selectedLatitudes, selectedLongitude]);
```

---

## 📚 Résumé

### Architecture en 3 couches

1. **Redux Store** : Source unique de vérité
2. **Custom Hooks** : Abstraction et logique métier
3. **React Components** : Présentation et UI

### Flux unidirectionnel

```
User Action → Component → Hook → Redux Action → Reducer → Store → Components Update
```

### Principes clés

- ✅ **Single Source of Truth** : Redux comme seul état
- ✅ **Unidirectional Data Flow** : Flux prévisible
- ✅ **Immutability** : État jamais muté directement
- ✅ **Composition** : Petits composants réutilisables
- ✅ **Separation of Concerns** : Logique séparée de la présentation
- ✅ **Performance** : Memoization et optimisations

Cette architecture permet de :
- 🔄 **Synchroniser** facilement toutes les vues
- 🐛 **Déboguer** efficacement avec Redux DevTools
- 🧪 **Tester** chaque partie indépendamment
- 📈 **Scaler** l'application sans refonte
- 🚀 **Maintenir** le code à long terme
