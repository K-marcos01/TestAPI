import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// Middleware pour parser le JSON envoyé dans les requêtes
app.use(express.json());

// 1. Types & Interfaces
type Role = "CITOYEN" | "ADMINISTRATEUR";

interface Utilisateur {
  id: number;
  email: string;
  role: Role;
  scoreTotal: number;
}

// 2. Base de données temporaire en mémoire
const utilisateurs: Utilisateur[] = [
  {
    id: 1,
    email: "alex@example.com",
    role: "CITOYEN",
    scoreTotal: 0
  }
];

// 3. Route 1 : GET /utilisateurs
app.get('/utilisateurs', (req: Request, res: Response) => {
  res.status(200).json(utilisateurs);
});

// 4. Route 2 : POST /inscription
app.post('/inscription', (req: Request, res: Response) => {
  const { email, role } = req.body;

  // Validation : l'email est obligatoire
  if (!email) {
    return res.status(400).json({ erreur: "L'email est requis" });
  }

  // Création du nouvel utilisateur
  const nouvelUtilisateur: Utilisateur = {
    id: utilisateurs.length + 1,
    email: email,
    role: role || "CITOYEN", // "CITOYEN" par défaut si non précisé
    scoreTotal: 0
  };

  utilisateurs.push(nouvelUtilisateur);

  // Retour de la réponse avec code 201 (Created)
  return res.status(201).json(nouvelUtilisateur);
});

// 5. Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur API démarré sur http://localhost:${PORT}`);
});