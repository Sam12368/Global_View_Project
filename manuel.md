Voici **un manuel utilisateur clair, structuré et professionnel** pour ton *README.md*.
Il couvre **toutes les fonctionnalités principales** de ton application de visualisation des anomalies de température mondiale.

Tu peux le coller directement dans ton README.

---

# 📘 Manuel Utilisateur – Application de Visualisation des Anomalies de Température (1880–2025)

Ce guide explique comment utiliser l’application interactive permettant d’explorer les anomalies de température mondiale entre **1880 et 2025** à travers plusieurs vues synchronisées : *World Map*, *GraphView*, *HistogramView*, *HeatmapView* et *AnimationBar*.

---

# 🌍 1. Interface générale

L’interface est composée de :

* **Une World Map** affichant les anomalies de température pour l’année sélectionnée.
* **Un panneau latéral (SidePanel)** permettant de gérer les sélections et les vues.
* **Une barre d’animation** pour naviguer dans le temps.
* **Des vues additionnelles** (Graph, Histogram, Heatmap) affichées sous la carte.

Toutes les vues sont **synchronisées** grâce au *state global Redux*.

---

# 🎛️ 2. Navigation temporelle (AnimationBar)

La timeline permet de parcourir l'évolution des anomalies entre **1880 et 2025**.

### ✔️ Fonctions disponibles :

* **Slider** pour sélectionner une année manuellement.
* **Play / Pause** pour lancer l’animation automatique.
* **Reset (⟲)** pour revenir à 1880.
* **Speed** : ajuste la vitesse de lecture (0.5× → 3×).
* **Champ numérique** pour entrer une année précise.

### ✔️ Synchronisation :

* Le changement d’année met à jour *toutes* les vues : World Map, GraphView, HistogramView et HeatmapView.

---

# 🗺️ 3. World Map – Carte Interactive

La World Map est le cœur du projet :
elle affiche les anomalies sous forme de **heatmap colorée**.

### ✔️ Fonctions principales :

* **Coloration dynamique** en fonction de l’année.
* **Sélection de zones** : cliquer + glisser pour créer des *rectangles*.
* **Sélection de latitudes** : clic horizontal.
* **Highlight** : certaines interactions mettent en surbrillance des cellules.

### ✔️ Interactions bidirectionnelles :

* Modifier l’année met à jour la carte.
* Sélectionner une zone/latitude met à jour les autres vues.

---

# 🎚️ 4. Modes de sélection (Zones & Latitudes)

Accessible via *SidePanel → Selection* :

## 🔵 Mode *Latitudes*

* Clic horizontal sur la carte → ajout d’une latitude.
* Elles apparaissent dans la liste, avec bouton de suppression.
* Bouton **Clear all** pour réinitialiser.

## 🟩 Mode *Areas* (zones rectangulaires)

* Cliquer–glisser pour dessiner une zone.
* Chaque zone affiche :

  * ses bornes lat/lon,
  * son numéro (Zone 1, Zone 2…),
  * une couleur unique.

### ✔️ Actions disponibles :

* Supprimer une zone.
* Effacer toutes les zones.
* Sélectionner plusieurs zones → créer un **groupe**.

---

# 🧩 5. Gestion des Groupes

Un groupe est un ensemble de zones permettant de comparer leurs moyennes dans les graphiques.

### ✔️ Fonctionnalités :

* Cocher plusieurs zones puis cliquer **Create group**.
* Renommage automatique (Group 1, Group 2…).
* Suppression individuelle.
* Clear all groups.

### ✔️ Groupes actifs

Dans GraphView, vous pouvez activer/désactiver les groupes à comparer.

---

# 📈 6. GraphView – Évolution Temporelle

Affiche la moyenne des anomalies **par année** :

### ✔️ Fonctionnalités :

* Courbe de la zone sélectionnée.
* Courbe pour chaque groupe activé.
* Calcul automatique des moyennes.
* Interaction :

  * Clic sur le graph → l’année affichée change.
  * Changer l’année → met à jour la position du curseur.

---

# 📊 7. HistogramView – Analyse des Latitudes

Utile pour comparer les anomalies par latitude.

### ✔️ Fonctionnalités :

* Un barplot où chaque barre = une latitude sélectionnée.
* Clic sur une barre :

  * Highlight sur la World Map.
  * Mise à jour des autres vues.
  * Sélection automatique de la latitude correspondante.

---

# 🔥 8. HeatmapView – Visualisation 2D Latitudes × Années

Affiche une matrice des anomalies :

### ✔️ Fonctionnalités :

* Ligne = latitude.
* Colonne = année.
* Cellule = couleur représentant l’anomalie.
* Clic sur une cellule :

  * Sélectionne la latitude,
  * Met à jour l’année globale,
  * Synchronise la World Map et GraphView.

---

# ⚙️ 9. Architecture Fonctionnelle (Vue d’ensemble)

### Actions possibles par l’utilisateur :

* Choisir une année.
* Dessiner une zone.
* Sélectionner une latitude.
* Créer un groupe.
* Activer une vue.
* Lancer l’animation.

Chaque action → envoie un **dispatch Redux** → met à jour le *state global*.
Toutes les vues se mettent à jour automatiquement via des **selectors**.

---

# 💾 10. Chargement des données NASA

L’application utilise :
**tempanomaly_4x4grid_v2.json**, un dataset simplifié fourni par la NASA.

Réduction du dataset → performances optimisées → affichage en temps réel.

---

# 🧮 11. Interpolation des couleurs

Une fonction d’interpolation linéaire calcule une couleur précise en fonction :

* de la valeur de l’anomalie,
* du min/max global,
* de la palette choisie (bleu → rouge).

Cela garantit :

✔ un rendu fluide
✔ des transitions linéaires
✔ une valeur visuellement cohérente sur tous les graphiques

---

# 🧭 12. Structure technique du projet

```
/app          → Store Redux, Provider, types
/components   → WorldMap, Heatmap, Histogram, Graph, SidePanel, etc.
/features     → Redux slices (selection, year, animation, data, views)
/hooks        → useYear, useSelection, useAnimation, useViews, useData
/assets       → images, couleurs, fichiers json
```

---

# 🧑‍💻 13. Comment utiliser l’application (résumé rapide)

1. Sélectionnez une année sur la barre d’animation.
2. Explorez la World Map.
3. Créez des zones ou latitudes selon le mode choisi.
4. Regroupez des zones pour les comparer.
5. Activez les vues : Graph, Histogram, Heatmap.
6. Cliquez sur les graphiques pour interagir avec la carte.
7. Lancez l’animation pour observer l'évolution dans le temps.

---

# 🟢 14. Conseils d’utilisation

* Utilisez les groupes pour comparer plusieurs régions.
* La Heatmap est idéale pour repérer les tendances globales.
* Combinez GraphView + WorldMap pour comprendre l’évolution locale.
* L’histogramme est pertinent lorsque plusieurs latitudes sont sélectionnées.

---

