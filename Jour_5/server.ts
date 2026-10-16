import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Importation des types et des middlewares depuis nos fichiers spécifiques
import { Utilisateur, UtilisateurDTO, Defi, RequeteAuthentifiee } from './types';
import { verifierToken, verifierAdmin, JWT_SECRET } from './auth.middleware';

const app = express();

// MIDDLEWARE GLOBAL : Permet de lire le JSON dans req.body
app.use(express.json());


// ============================================================================
// BASE DE DONNÉES SIMULÉE (En mémoire)
// ============================================================================
const utilisateurs: Utilisateur[] = [];
const defis: Defi[] = [
  { id: 1, titre: "Utiliser les transports en commun", points: 50 },
  { id: 2, titre: "Réduire sa consommation de plastique", points: 80 }
];


// ============================================================================
// ROUTES D'AUTHENTIFICATION (Publiques)
// ============================================================================

// 1. INSCRIPTION
app.post('/api/auth/inscription', async (req: Request, res: Response) => {
  const { email, nom, motDePasse, role } = req.body;

  if (!email || !nom || !motDePasse) {
    return res.status(400).json({ erreur: "Tous les champs obligatoires doivent être remplis." });
  }

  if (motDePasse.length < 6) {
    return res.status(400).json({ erreur: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  const existeDeja = utilisateurs.find(u => u.email === email);
  if (existeDeja) {
    return res.status(400).json({ erreur: "Cet email est déjà utilisé." });
  }

  // Hachage sécurisé du mot de passe (10 tours de salt)
  const motDePasseHache = await bcrypt.hash(motDePasse, 10);

  const nouvelUtilisateur: Utilisateur = {
    id: utilisateurs.length + 1,
    email,
    nom,
    role: role === "ADMINISTRATEUR" ? "ADMINISTRATEUR" : "CITOYEN",
    motDePasseHache
  };

  utilisateurs.push(nouvelUtilisateur);

  // Construction du DTO de réponse (sans le hash)
  const utilisateurReponse: UtilisateurDTO = {
    id: nouvelUtilisateur.id,
    email: nouvelUtilisateur.email,
    nom: nouvelUtilisateur.nom,
    role: nouvelUtilisateur.role
  };

  return res.status(201).json(utilisateurReponse);
});

// 2. CONNEXION
app.post('/api/auth/connexion', async (req: Request, res: Response) => {
  const { email, motDePasse } = req.body;

  if (!email || !motDePasse) {
    return res.status(400).json({ erreur: "Email et mot de passe requis." });
  }

  const utilisateur = utilisateurs.find(u => u.email === email);
  if (!utilisateur) {
    return res.status(401).json({ erreur: "Identifiants invalides." });
  }

  // Comparaison du mot de passe clair avec le hash stocké
  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHache);
  if (!motDePasseValide) {
    return res.status(401).json({ erreur: "Identifiants invalides." });
  }

  // Génération du JWT (valable 2 heures)
  const token = jwt.sign(
    { userId: utilisateur.id, role: utilisateur.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return res.status(200).json({ token });
});


// ============================================================================
// ROUTES MÉTIER (Publiques et Protégées)
// ============================================================================

// 3. ROUTE PUBLIQUE : Lister les défis
app.get('/api/defis', (req: Request, res: Response) => {
  return res.status(200).json(defis);
});

// 4. ROUTE PROTÉGÉE UTILISATEUR : Mon profil (Nécessite d'être connecté)
app.get('/api/utilisateurs/profil', verifierToken, (req: RequeteAuthentifiee, res: Response) => {
  const utilisateur = utilisateurs.find(u => u.id === req.user?.id);

  if (!utilisateur) {
    return res.status(404).json({ erreur: "Utilisateur introuvable." });
  }

  const profilSecurise: UtilisateurDTO = {
    id: utilisateur.id,
    email: utilisateur.email,
    nom: utilisateur.nom,
    role: utilisateur.role
  };

  return res.status(200).json(profilSecurise);
});

// 5. ROUTE PROTÉGÉE ADMIN : Créer un défi (Nécessite Token + Rôle Admin)
app.post('/api/defis', verifierToken, verifierAdmin, (req: RequeteAuthentifiee, res: Response) => {
  const { titre, points } = req.body;

  if (!titre || points === undefined) {
    return res.status(400).json({ erreur: "Le titre et les points sont obligatoires." });
  }

  const nouveauDefi: Defi = {
    id: defis.length + 1,
    titre,
    points: Number(points)
  };

  defis.push(nouveauDefi);

  return res.status(201).json({
    message: "Défi créé avec succès par l'administrateur",
    defi: nouveauDefi
  });
});


// ============================================================================
// DÉMARRAGE DU SERVEUR
// ============================================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur modulaire Ecoda démarré sur http://localhost:${PORT}`);
});