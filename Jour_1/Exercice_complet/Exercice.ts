// 1. Union Type
type CategorieDefi = "Empreinte carbone" | "Alimentation" | "Déchets";

// 2. Interface principale
interface Defis {
  id: number;
  titre: string;
  points: number;
  categorie: CategorieDefi;
  description?: string;
}

// 3. Type pour la mise à jour (PATCH /defis/:id)
// On combine Omit (pour retirer l'id) et Partial (pour rendre tout le reste optionnel)
type MiseAJourDefiDTO = Partial<Omit<Defis, "id">>;

function calculerNouvelImpact(
  scoreActuel: number,
  pointsDefi: number,
  multiplicateur: number = 1 // Valeur par défaut si non fourni
): number {
  return scoreActuel + (pointsDefi * multiplicateur);
}

// Exemples d'utilisation :
const score1 = calculerNouvelImpact(100, 10);    // Retourne 110 (multiplicateur par défaut = 1)
const score2 = calculerNouvelImpact(100, 10, 2); // Retourne 120 (multiplicateur x2)

/*
// 1. Pick : Je garde SEULEMENT ces clés (ex: Formulaire de connexion)
type ConnexionDTO = Pick<Utilisateur, "email" | "motDePasse">;

// 2. Omit : Je prends tout SAUF ces clés (ex: Réponse API sans le mot de passe)
type ReponseUserDTO = Omit<Utilisateur, "motDePasseHache">;

// 3. Partial : Je rends TOUTES les clés optionnelles (ex: Modification PATCH)
type UpdateUserDTO = Partial<Omit<Utilisateur, "id">>;
*/