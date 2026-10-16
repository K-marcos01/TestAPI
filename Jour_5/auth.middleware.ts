import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequeteAuthentifiee } from './types';

// Clé secrète (en production, à stocker dans une variable d'environnement process.env.JWT_SECRET)
export const JWT_SECRET = "secret_partiel_api_2026";

/**
 * MIDDLEWARE 1 : verifierToken
 * Vérifie la présence, le format et la validité cryptographique du JWT.
 */
export function verifierToken(req: RequeteAuthentifiee, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // 1. Vérification du format "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: "Accès refusé. Token manquant ou mal formé." });
  }

  // 2. Extraction du token pur
  const token = authHeader.split(' ')[1];

  try {
    // 3. Déchiffrement et validation de l'expiration
    const payloadDecode = jwt.verify(token, JWT_SECRET) as { userId: number; role: "CITOYEN" | "ADMINISTRATEUR" };
    
    // 4. Injection des données dans la requête
    req.user = {
      id: payloadDecode.userId,
      role: payloadDecode.role
    };

    return next(); // Feu vert
  } catch (erreur) {
    return res.status(401).json({ erreur: "Token invalide ou expiré." });
  }
}

/**
 * MIDDLEWARE 2 : verifierAdmin (RBAC)
 * Vérifie si l'utilisateur connecté possède le rôle ADMINISTRATEUR.
 */
export function verifierAdmin(req: RequeteAuthentifiee, res: Response, next: NextFunction) {
  // On s'assure que req.user existe et que son rôle est bien administrateur
  if (!req.user || req.user.role !== "ADMINISTRATEUR") {
    // 403 Forbidden : L'utilisateur est connu, mais n'a pas les droits
    return res.status(403).json({ erreur: "Accès refusé. Droits administrateur requis." });
  }
  
  return next(); // Feu vert
}