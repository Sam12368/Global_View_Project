# Multi-Area Selection with Drag

## Fonctionnalité
En mode "Area", vous pouvez maintenant sélectionner **plusieurs zones 4×4 en une seule fois** en faisant un drag (glisser-déposer) sur la carte.

## Comment utiliser

### Sélection Simple
- **Clic simple** sur une zone 4×4 pour la sélectionner/désélectionner

### Sélection Multiple (Drag)
1. **Activez le mode "Area"** dans le panneau latéral
2. **Cliquez et maintenez** sur la carte au point de départ
3. **Glissez** vers le point d'arrivée (un rectangle bleu en pointillés apparaît)
4. **Relâchez** pour sélectionner toutes les zones 4×4 dans le rectangle

### Visual Feedback
- **Rectangle de prévisualisation** : Bordure bleue en pointillés pendant le drag
- **Zones sélectionnées** : Contour jaune doré
- **Curseur** : Change en croix pendant le drag

## Implémentation Technique

### Redux State
```typescript
interface SelectionState {
  isDrawing: boolean;           // En cours de drag
  drawStart: { x: number; y: number } | null;  // Point de départ (coordonnées canvas)
}
```

### WorldMap.tsx - Événements Souris
- `onMouseDown` : Démarre le drag, enregistre le point de départ
- `onMouseMove` : Met à jour le rectangle de prévisualisation
- `onMouseUp` : Sélectionne toutes les zones dans le rectangle
- `onMouseLeave` : Annule le drag si on sort de la carte

### Logique de Sélection
```typescript
// Dans handleMouseUp
tempData.tempanomalies.forEach((area, index) => {
  const ax = (area.lon + 180) * scaleX;
  const ay = (90 - area.lat) * scaleY;
  
  // Si le centre de la zone est dans le rectangle
  if (ax >= x1 && ax <= x2 && ay >= y1 && ay <= y2) {
    if (!selectedAreas.includes(index)) {
      addArea(index);
    }
  }
});
```

## Cas d'Usage
- ✅ Sélectionner rapidement une région géographique
- ✅ Créer des groupes de zones adjacentes
- ✅ Analyser une zone rectangulaire spécifique
- ✅ Éviter de cliquer zone par zone

## Notes
- Le drag ne fonctionne **qu'en mode "Area"**
- En mode "Latitudes", seul le clic simple fonctionne
- Les zones déjà sélectionnées ne sont pas dé-sélectionnées par le drag
- Le rectangle de sélection utilise les **coordonnées canvas** (pixels) pour la performance
