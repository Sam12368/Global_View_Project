// src/features/selection/selectionSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ========================
// TYPES
// ========================

/**
 * Mode de sélection :
 *  - "areas"     : dessin de zones rectangulaires sur la carte
 *  - "latitudes" : sélection de lignes de latitude
 */
export type SelectionMode = "areas" | "latitudes";

/**
 * 🔹 AreaSelection
 * Représente une "Zone N" dessinée sur la carte via un drag.
 * Elle contient une liste de cellIds (indices dans tempData.tempanomalies).
 */
export interface AreaSelection {
  id: number;          // identifiant interne stable (pour les clés / groupes)
  name: string;        // ex: "Zone 1", "Zone 2" (affiché dans l'UI)
  color: string;       // couleur utilisée sur la carte
  cellIds: number[];   // indices de cellules dans tempData.tempanomalies
}

/**
 * 🔹 GroupSelection
 * Un groupe = ensemble de zones (areas).
 * Ex : Group 1 = [Zone 1, Zone 3]
 */
export interface GroupSelection {
  id: number;
  name: string;        // ex: "Group 1"
  color: string;       // couleur utilisée sur les graphes ou la légende
  areaIds: number[];   // liste d'ids d'AreaSelection
}

/**
 * 🔹 SelectionState
 * - zones (areas)
 * - groups de zones
 * - latitudes
 * - groupes actifs pour comparaison sur les graphes
 */
export interface SelectionState {
  mode: SelectionMode;

  // Latitudes sélectionnées
  selectedLatitudes: number[];

  // Zones (areas) dessinées par drag
  areas: AreaSelection[];
  nextAreaId: number; // id interne pour prochaine zone

  // Groupes de zones
  groups: GroupSelection[];
  nextGroupId: number;

  // Groupes "activés" pour la comparaison sur le graphe
  activeGroupIds: number[];

  // Cellules mises en surbrillance (pour histogram)
  highlightedCellIds: number[];
}

const initialState: SelectionState = {
  mode: "areas",
  selectedLatitudes: [],
  areas: [],
  nextAreaId: 1,
  groups: [],
  nextGroupId: 1,
  activeGroupIds: [],
  highlightedCellIds: [],
};

// ========================
// SLICE
// ========================

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    // MODE ------------------------
    setMode(state, action: PayloadAction<SelectionMode>) {
      state.mode = action.payload;
    },

    // LATITUDES -------------------
    addLatitude(state, action: PayloadAction<number>) {
      const lat = action.payload;
      if (!state.selectedLatitudes.includes(lat)) {
        state.selectedLatitudes.push(lat);
      }
    },

    removeLatitude(state, action: PayloadAction<number>) {
      state.selectedLatitudes = state.selectedLatitudes.filter(
        (l) => l !== action.payload
      );
    },

    clearLatitudes(state) {
      state.selectedLatitudes = [];
    },

    // =========================
    // 🔹 ZONES (AREAS)
    // =========================

    /**
     * createAreaFromCells
     * Créée une "Zone N" à partir d'une liste de cellIds trouvés
     * dans le drag rectangle de la carte.
     */
    createAreaFromCells(state, action: PayloadAction<number[]>) {
      const uniqueIds = Array.from(new Set(action.payload));
      if (uniqueIds.length === 0) return;

      state.areas.push({
        id: state.nextAreaId,                 // id interne (stable)
        name: `Zone ${state.areas.length + 1}`, // label utilisateur compact
        color: randomColor(),
        cellIds: uniqueIds,
      });

      state.nextAreaId++;
      // les noms "Zone N" seront recalculés proprement si besoin via reindexAreas
      reindexAreas(state);
    },

    /**
     * Supprime une zone :
     *  - on enlève la zone de la liste
     *  - on la retire des groupes qui la contenaient
     *  - on réindexe les noms (Zone 1, Zone 2, ...) SANS toucher les ids internes
     */
    removeArea(state, action: PayloadAction<number>) {
      const removedId = action.payload;

      // 1) Supprime la zone
      state.areas = state.areas.filter((a) => a.id !== removedId);

      // 2) Retire la zone des groupes
      state.groups = state.groups.map((g) => ({
        ...g,
        areaIds: g.areaIds.filter((id) => id !== removedId),
      }));

      // 3) Nettoie les groupes vides (optionnel mais propre)
      state.groups = state.groups.filter((g) => g.areaIds.length > 0);

      // 4) Réindexation des labels de zones (Zone 1, Zone 2, ...)
      reindexAreas(state);

      // 5) On nettoie aussi les groupes actifs si besoin
      const validGroupIds = new Set(state.groups.map((g) => g.id));
      state.activeGroupIds = state.activeGroupIds.filter((id) =>
        validGroupIds.has(id)
      );
    },

    clearAreas(state) {
      state.areas = [];
      // les ids internes continuent de monter, ce n'est pas grave,
      // mais on peut aussi les réinitialiser si on veut repartir à zéro :
      state.nextAreaId = 1;

      // on vide tous les groupes car plus de zones
      state.groups = [];
      state.nextGroupId = 1;
      state.activeGroupIds = [];
    },

    // =========================
    // 🔹 GROUPES DE ZONES
    // =========================

    /**
     * createGroupFromAreas
     * Crée un groupe à partir d'une liste d'ids de zones (areas).
     * On interdit les doublons : deux groupes ne peuvent pas contenir
     * EXACTEMENT la même combinaison de zones.
     */
    createGroupFromAreas(
      state,
      action: PayloadAction<{ areaIds: number[] }>
    ) {
      const rawIds = action.payload.areaIds;

      // on nettoie et trie pour comparer les combinaisons proprement
      const areaIds = Array.from(new Set(rawIds)).sort((a, b) => a - b);
      if (areaIds.length === 0) return;

      // 1) Vérifier si un groupe identique existe déjà
      const exists = state.groups.some((g) => {
        const sorted = [...g.areaIds].sort((a, b) => a - b);
        if (sorted.length !== areaIds.length) return false;
        return sorted.every((id, index) => id === areaIds[index]);
      });

      if (exists) {
        // on ne crée PAS de doublon
        console.warn(
          "❌ Groupe ignoré : même combinaison de zones déjà existante"
        );
        return;
      }

      // 2) Création du groupe car il est unique
      state.groups.push({
        id: state.nextGroupId,                    // id interne stable
        name: `Group ${state.groups.length + 1}`, // label utilisateur compact
        color: randomColor(),
        areaIds,
      });

      state.nextGroupId++;
      reindexGroups(state);
    },

    /**
     * Supprime un groupe et réindexe les labels (Group 1, Group 2, ...)
     */
    removeGroup(state, action: PayloadAction<number>) {
      const groupId = action.payload;
      state.groups = state.groups.filter((g) => g.id !== groupId);

      // on enlève aussi des groupes actifs
      state.activeGroupIds = state.activeGroupIds.filter((id) => id !== groupId);

      reindexGroups(state);
    },

    clearGroups(state) {
      state.groups = [];
      state.nextGroupId = 1;
      state.activeGroupIds = [];
    },

    // =========================
    // 🔹 GROUPES ACTIFS POUR GRAPHE
    // =========================

    /**
     * toggleActiveGroup
     * Ajoute/enlève un groupe dans la liste des groupes "actifs"
     * qui seront comparés dans le graphe.
     * - impossible d'avoir deux fois le même id
     */
    toggleActiveGroup(state, action: PayloadAction<number>) {
      const groupId = action.payload;
      if (state.activeGroupIds.includes(groupId)) {
        state.activeGroupIds = state.activeGroupIds.filter((id) => id !== groupId);
      } else {
        state.activeGroupIds.push(groupId);
      }
    },

    // =========================
    // 🔹 HIGHLIGHT (pour histogram)
    // =========================

    /**
     * setHighlightedCells
     * Remplace la liste des cellules en surbrillance
     */
    setHighlightedCells(state, action: PayloadAction<number[]>) {
      state.highlightedCellIds = action.payload;
    },

    /**
     * clearHighlight
     * Efface toutes les cellules en surbrillance
     */
    clearHighlight(state) {
      state.highlightedCellIds = [];
    },
  },
});

// ========================
// HELPERS (réindexation)
// ========================

/**
 * Réindexe les labels des zones (NOMS uniquement).
 * Ex: après suppression, on veut :
 *   Zone 1, Zone 2, ...
 * ⚠️ On NE touche PAS aux ids internes (id), pour ne pas casser les références.
 */
function reindexAreas(state: SelectionState) {
  state.areas.forEach((area, index) => {
    area.name = `Zone ${index + 1}`;
  });
}

/**
 * Réindexe les labels des groupes (NOMS uniquement).
 * Ex: Group 1, Group 2, ...
 * ⚠️ On NE touche PAS aux ids internes.
 */
function reindexGroups(state: SelectionState) {
  state.groups.forEach((group, index) => {
    group.name = `Group ${index + 1}`;
  });
}

function randomColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;
}

export const {
  setMode,
  addLatitude,
  removeLatitude,
  clearLatitudes,
  createAreaFromCells,
  removeArea,
  clearAreas,
  createGroupFromAreas,
  removeGroup,
  clearGroups,
  toggleActiveGroup,
  setHighlightedCells,
  clearHighlight,
} = selectionSlice.actions;

export default selectionSlice.reducer;
