import { Request } from 'express';

// 1. Structure de l'Utilisateur en base de données
export interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  role: "CITOYEN" | "ADMINISTRATEUR";
  motDePasseHache: string;
}

// 2. DTO (Data Transfer Object) : On exclut le hash pour ne jamais le renvoyer au client
export type UtilisateurDTO = Omit<Utilisateur, "motDePasseHache">;

// 3. Structure d'un Défi
export interface Defi {
  id: number;
  titre: string;
  points: number;
}

// 4. Extension de l'objet Request d'Express pour y ajouter l'utilisateur décodé du JWT
export interface RequeteAuthentifiee extends Request {
  user?: {
    id: number;
    role: "CITOYEN" | "ADMINISTRATEUR";
  };
}