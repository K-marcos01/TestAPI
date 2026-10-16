// 1. IMPORTATIONS & INITIALISATION

import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const JWT_SECRET = "ma_cle_secrete_super_securisee_123";

// 2. EXTENSION DE L'OBJET REQUEST (TypeScript)
// On redéfinit l'interface Request d'Express pour y intégrer la propriété 'user'
// qui contiendra les données décodées du JWT.
export interface RequeteAuthentifiee extends Request {
  user?: {
    id: number;
    role: string; // Ex: "CITOYEN" ou "ADMINISTRATEUR"
  };
}

// 3. MIDDLEWARE 1 : VÉRIFICATION DU TOKEN (Authentification)

function verifierToken(req: RequeteAuthentifiee, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Vérification de la présence et du format du header "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: "Accès refusé. Token manquant ou mal formé." });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Déchiffrement et validation du token
    const payloadDecode = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

    // Injection des données dans req.user
    req.user = {
      id: payloadDecode.userId,
      role: payloadDecode.role
    };

    // Feu vert : on passe au middleware ou contrôleur suivant
    return next();
  } catch (erreur) {
    return res.status(401).json({ erreur: "Token invalide ou expiré." });
  }
}

// 4. MIDDLEWARE 2 : CONTRÔLE DU RÔLE ADMIN (Autorisation / RBAC)

/**
 * Ce middleware doit s'exécuter APRES 'verifierToken'.
 * Son rôle unique est de vérifier si l'utilisateur authentifié possède le profil administrateur.
 */
function verifierAdmin(req: RequeteAuthentifiee, res: Response, next: NextFunction) {
  
  // 1. Vérification de sécurité : Est-ce que req.user existe ? (Normalement oui si verifierToken est passé avant)
  // 2. Vérification du rôle : Est-ce que le rôle est strictement "ADMINISTRATEUR" ?
  if (!req.user || req.user.role !== "ADMINISTRATEUR") {
    // Si l'utilisateur est connecté mais n'a pas les droits -> Code HTTP 403 (Forbidden)
    // Ne pas confondre avec 401 (Unauthorized) : 
    // - 401 = "Je ne sais pas qui tu es" (pas de token valide)
    // - 403 = "Je sais qui tu es, mais tu n'as pas le droit d'entrer ici"
    return res.status(403).json({ 
      erreur: "Accès refusé. Cette action est réservée aux administrateurs." 
    });
  }

  // Si c'est bien un administrateur, on autorise le passage
  return next();
}

// 5. ROUTES DE L'API (Publiques et Protégées)
// Route de connexion (pour obtenir un token de test)
app.post('/connexion', (req: Request, res: Response) => {
  const { role } = req.body; // Pour tester, on envoie le rôle souhaité dans le body

  // Simulation d'un utilisateur généré en base
  const utilisateurTest = {
    id: 1,
    role: role || "CITOYEN" // Par défaut citoyen s'il ne précise rien
  };

  const token = jwt.sign(
    { userId: utilisateurTest.id, role: utilisateurTest.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({ token });
});


// ROUTE PROTÉGÉE ADMIN : Double middleware [verifierToken, verifierAdmin]
app.post('/defis/admin/creer', verifierToken, verifierAdmin, (req: RequeteAuthentifiee, res: Response) => {
  const { titre, points } = req.body;

  // Si le code arrive ici, le client a fourni un JWT valide ET son rôle est ADMINISTRATEUR.
  return res.status(201).json({
    message: "Défi créé avec succès par l'administrateur !",
    administrateurId: req.user?.id,
    defiCree: { titre, points }
  });
});


// 6. DÉMARRAGE DU SERVEUR

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur JWT & RBAC démarré sur http://localhost:${PORT}`);
});