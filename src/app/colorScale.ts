
export function getColorForAnomaly(value: number | null): string {
  if (value === null) {
    return 'rgb(232, 244, 248)'; // Bleu très pâle (pas de données)
  }

  // Échelle de couleurs NASA GISS
  if (value < -2) {
    return 'rgb(0, 0, 128)'; // Bleu très foncé
  }
  if (value < -1.5) {
    return 'rgb(0, 0, 205)'; // Bleu royal
  }
  if (value < -1) {
    return 'rgb(0, 0, 255)'; // Bleu pur
  }
  if (value < -0.5) {
    return 'rgb(65, 105, 225)'; // Bleu acier
  }
  if (value < 0) {
    return 'rgb(135, 206, 235)'; // Bleu ciel
  }
  if (value < 0.25) {
    return 'rgb(144, 238, 144)'; // Vert clair (neutre)
  }
  if (value < 0.5) {
    return 'rgb(255, 255, 0)'; // Jaune
  }
  if (value < 0.75) {
    return 'rgb(255, 165, 0)'; // Orange
  }
  if (value < 1) {
    return 'rgb(255, 140, 0)'; // Orange foncé
  }
  if (value < 1.5) {
    return 'rgb(255, 99, 71)'; // Tomate
  }
  if (value < 2) {
    return 'rgb(220, 20, 60)'; // Écarlate
  }
  
  return 'rgb(139, 0, 0)'; // Marron foncé (extrême)
}

/**
 * Retourne les min/max pour normaliser les couleurs
 */
export const ANOMALY_RANGE = {
  min: -2,
  max: 3,
};