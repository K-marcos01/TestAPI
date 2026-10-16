// Fonction avec retour de type number
function calculerTotalPoints(pointsActuels: number, pointsGagnes: number): number {
  return pointsActuels + pointsGagnes;
}

// Fonction prenant un objet typé en paramètre et retournant un objet typé
function validerEtMettreAJour(defi: Defi): Defi {
  return {
    ...defi,          // On recopie toutes les propriétés existantes
    estValide: true   // On modifie l'état
  };
}

// Fonction ne retournant rien
function afficherLog(message: string): void {
  console.log(`[LOG API]: ${message}`);
}