// 1. IMPORTATIONS
import express, { Request, Response } from 'express';

// 'bcryptjs' est la bibliothèque qui permet de hacher et comparer des mots de passe.
// On importe 'bcrypt' par convention d'écriture.
import bcrypt from 'bcryptjs';

const app = express();

// MIDDLEWARE : Obligatoire pour décoder les corps de requête JSON (req.body).
app.use(express.json());

// 2. TYPES ET INTERFACES

// Interface représentant la structure d'un utilisateur stocké en Base de Données.
interface Utilisateur {
  id: number;
  email: string;
  motDePasseHache: string; // ON NE STOCKE JAMAIS LE MOT DE PASSE EN CLAIR !
}

// DTO (Data Transfer Object) de réponse :
// On utilise Omit pour créer un type qui exclut la propriété 'motDePasseHache'.
// Cela garantit au niveau TypeScript qu'on ne fuguera jamais le hash dans la réponse JSON.
type ReponseUtilisateurDTO = Omit<Utilisateur, "motDePasseHache">;

// 3. BASE DE DONNÉES FICTIVE EN MÉMOIRE
const utilisateurs: Utilisateur[] = [];

// 4. ROUTE 1 : POST /inscription (Création de compte + Hachage)

/**
 * ATTENTION : La fonction callback de la route DOIT être 'async' 
 * car les fonctions de bcrypt (bcrypt.hash, bcrypt.compare) sont asynchrones.
 */
app.post('/inscription', async (req: Request, res: Response) => {
  
  const { email, motDePasse } = req.body;

  // 2. VALIDATION DES CHAMPS OBLIGATOIRES
  if (!email || !motDePasse) {
    // Si l'un des champs manque -> 400 Bad Request
    return res.status(400).json({ erreur: "Email et mot de passe requis" });
  }

  // 3. VÉRIFICATION DE L'UNICITÉ
  // On vérifie si un utilisateur avec le même email existe déjà
  const existeDeja = utilisateurs.find(u => u.email === email);
  if (existeDeja) {
    return res.status(400).json({ erreur: "Cet email est déjà utilisé" });
  }

  // 4. HACHAGE DU MOT DE PASSE
  // 'saltRounds' (ici 10) définit le nombre de tours d'algorithme.
  // Plus la valeur est haute, plus le hash est long à calculer (protège contre le bruteforce).
  // 'await' suspend la fonction pendant que le microprocesseur calcule le hash.
  const saltRounds = 10;
  const motDePasseHache = await bcrypt.hash(motDePasse, saltRounds);

  // 5. CRÉATION DU NOUVEL UTILISATEUR
  const nouvelUtilisateur: Utilisateur = {
    id: utilisateurs.length + 1,
    email: email,
    motDePasseHache: motDePasseHache // On enregistre le HASH, pas le mot de passe clair !
  };

  utilisateurs.push(nouvelUtilisateur);

  // 6. NETTOYAGE ET RÉPONSE (201 Created)
  // On construit un objet propre sans le champ 'motDePasseHache'
  const reponse: ReponseUtilisateurDTO = {
    id: nouvelUtilisateur.id,
    email: nouvelUtilisateur.email
  };

  return res.status(201).json(reponse);
});

// 5. ROUTE 2 : POST /connexion (Vérification des identifiants)
app.post('/connexion', async (req: Request, res: Response) => {
  
  // 1. EXTRACTION
  const { email, motDePasse } = req.body;

  // 2. VALIDATION
  if (!email || !motDePasse) {
    return res.status(400).json({ erreur: "Email et mot de passe requis" });
  }

  // 3. RECHERCHE DE L'UTILISATEUR
  const utilisateur = utilisateurs.find(u => u.email === email);
  
  // RÈGLE DE SÉCURITÉ : Si l'utilisateur n'existe pas, on renvoie "Identifiants invalides" (401)
  // Ne dis JAMAIS "Email incorrect" car un attaquant saura que l'email n'existe pas.
  if (!utilisateur) {
    return res.status(401).json({ erreur: "Identifiants invalides" });
  }

  // 4. COMPARAISON DU MOT DE PASSE CLAIS ET DU HASH STOCKÉ
  // bcrypt.compare(motDePasseClairSaisi, hashEnBaseDeDonnees)
  // Elle hache le mot de passe saisi avec le même sel et compare les deux résultats.
  // Retourne 'true' si ça correspond, 'false' sinon.
  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHache);

  // Si le mot de passe ne correspond pas -> 401 Unauthorized
  if (!motDePasseValide) {
    return res.status(401).json({ erreur: "Identifiants invalides" });
  }

  // 5. SUCCÈS (200 OK)
  return res.status(200).json({ message: "Connexion réussie !" });
});

// 6. DÉMARRAGE DU SERVEUR

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});