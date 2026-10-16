type Role = "CITOYEN" | "ADMINISTRATEUR";

interface Utilisateur {
  id: number;
  email: string;
  motDePasseHache: string;
  role: Role;
  scoreTotal: number;
  biographie?: string; // optionnel grâce au '?'
}

const utilisateur1: Utilisateur = {
  id: 1,
  email: "alex@example.com",
  motDePasseHache: "$2b$10$e83...",
  role: "CITOYEN",
  scoreTotal: 0
};

type Statutdefi = "EN_COURS" | "VALIDE" | "A_RETENIR";

interface DefiQuotidien {
    id : number;
    libelle : string;
    points : number;
    statut : Statutdefi;
}

function traiterValidationDefi(utilisateur: Utilisateur, defi: DefiQuotidien): Utilisateur {
  // 1. Vérification du statut du défi
  if (defi.statut === "EN_COURS") {
    // 2. On retourne un NOUVEL objet utilisateur avec le score mis à jour
    return {
      ...utilisateur, // Copie toutes les clés (id, email, role, etc.)
      scoreTotal: utilisateur.scoreTotal + defi.points // Écrase seulement scoreTotal
    };
  }

  // 3. Si le défi n'est pas "EN_COURS", on renvoie l'utilisateur intact
  return utilisateur;
}

const Defi: DefiQuotidien = {
  id: 10,
  libelle: "Prendre le vélo",
  points: 15,
  statut: "EN_COURS"
};

// Le score passe de 0 à 15
const utilisateurMisAJour = traiterValidationDefi(utilisateur1, Defi);
console.log(utilisateurMisAJour.scoreTotal); // Affiche : 15