// Une variable de ce type NE PEUT PRENDRE que l'une de ces 3 valeurs précises
type Difficulte = "Facile" | "Moyen" | "Ambitieux";

type RoleUtilisateur = "USER" | "ADMIN";

// Combinaison dans une interface
interface DefiComplet {
  id: number;
  titre: string;
  difficulte: Difficulte; // Doit obligatoirement être "Facile", "Moyen" ou "Ambitieux"
}

const defi1: DefiComplet = {
  id: 101,
  titre: "Zero déchet pendant une semaine",
  difficulte: "Ambitieux" // 🟢 Valide
};


const defiErreur: DefiComplet = {
  id: 102,
  titre: "Tri sélectif",
  difficulte: "Très dur" // 🔴 ERREUR COMPILATION : "Très Dur" n'est pas autorisé !
};