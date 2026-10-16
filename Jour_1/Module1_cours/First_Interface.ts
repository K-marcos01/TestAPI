// Définition de l'interface
interface Defi {
  id: number;
  titre: string;
  points: number;
  categorie: string;
  estValide: boolean;
  description?: string; // Le '?' rend la propriété OPTIONNELLE
}

// Utilisation
const monDefi: Defi = {
  id: 1,
  titre: "Prendre le vélo aujourd'hui",
  points: 10,
  categorie: "Empreinte carbone",
  estValide: false
  // 'description' est absente, mais TS accepte car elle est optionnelle
};