import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Clé secrète indispensable pour signer et vérifier les tokens (à stocker en variable d'environnement en prod)
const JWT_SECRET = "ma_cle_secrete_super_securisee_123";

// A. EXTENSION DU TYPE REQUEST (TypeScript)
// Pour que TypeScript reconnaisse la propriété 'user' qu'on va ajouter à l'objet 'req',
// on étend l'interface Request d'Express.
export interface RequeteAuthentifiee extends Request {
  user?: {
    id: number;
    role: string;
  };
}

// B. GÉNÉRATION DU TOKEN (Route de connexion)
app.post('/connexion', (req: Request, res: Response) => {
  const { email } = req.body;

  // (Simulation : l'utilisateur est retrouvé en base et son ID est 42, rôle "CITOYEN")
  const utilisateurFictif = { id: 42, role: "CITOYEN" };

  // Création du token signé avec jwt.sign(payload, secret, options)
  const token = jwt.sign(
    { userId: utilisateurFictif.id, role: utilisateurFictif.role },
    JWT_SECRET,
    { expiresIn: '2h' } // Le token expire au bout de 2 heures
  );

  return res.status(200).json({ token });
});

// C. LE MIDDLEWARE D'AUTHENTIFICATION (Vérification du Token)
function verifierToken(req: RequeteAuthentifiee, res: Response, next: NextFunction) {
  // 1. Récupérer le header d'autorisation
  const authHeader = req.headers.authorization;

  // Format standard attendu : "Bearer <TON_TOKEN>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: "Accès refusé. Token manquant ou mal formé." });
  }

  // 2. Extraire le token pur en coupant la chaîne après l'espace
  const token = authHeader.split(' ')[1];

  try {
    // 3. Vérifier la signature et la validité temporelle du token
    const payloadDecode = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

    // 4. Injecter les infos décodées dans req.user pour les routes suivantes
    req.user = {
      id: payloadDecode.userId,
      role: payloadDecode.role
    };

    // 5. Tout est OK, on passe la main au contrôleur suivant
    return next();
  } catch (erreur) {
    // Si le token a expiré ou que la signature est fausse, jwt.verify lance une erreur
    return res.status(401).json({ erreur: "Token invalide ou expiré." });
  }
}

// D. UTILISATION SUR UNE ROUTE PROTÉGÉE
// On intercale 'verifierToken' entre le chemin de la route et le contrôleur final.
app.get('/mon-profil', verifierToken, (req: RequeteAuthentifiee, res: Response) => {
  // Grâce au middleware, req.user est disponible et typé !
  return res.status(200).json({
    message: "Bienvenue dans votre espace sécurisé !",
    infosUtilisateur: req.user
  });
});