// IMPORTATIONS ET INITIALISATION
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());

// TYPES & INTERFACES (Projet Ecoda)
interface Citoyen {
  id: number;
  email: string;
  nom: string;
  motDePasseHache: string;
}

// Utilisation d'Omit pour créer le DTO de réponse sans la clé "motDePasseHache"
type ReponseCitoyenDTO = Omit<Citoyen, "motDePasseHache">;

// Base de données temporaire en mémoire
const citoyens: Citoyen[] = [];

// ROUTE : POST /citoyens/inscription
app.post('/citoyens/inscription', async (req: Request, res: Response) => {
  const { email, nom, motDePasse } = req.body;

  // 1. Validation de la présence des champs obligatoires
  if (!email || !nom || !motDePasse) {
    return res.status(400).json({ 
      erreur: "Tous les champs sont requis (email, nom, motDePasse)." 
    });
  }

  // 2. Validation de la règle métier : longueur minimale du mot de passe (>= 6 caractères)
  // ATTENTION : On effectue cette vérification AVANT le hachage !
  if (motDePasse.length < 6) {
    return res.status(400).json({ 
      erreur: "Le mot de passe doit faire au moins 6 caractères" 
    });
  }

  // 3. Vérification de l'unicité de l'email
  const citoyenExiste = citoyens.find(c => c.email === email);
  if (citoyenExiste) {
    return res.status(400).json({ 
      erreur: "Cet email est déjà enregistré." 
    });
  }

  // 4. Hachage sécurisé du mot de passe clair avec bcrypt (10 tours de salt)
  const saltRounds = 10;
  const motDePasseHache = await bcrypt.hash(motDePasse, saltRounds);

  // 5. Création de l'entité Citoyen complète pour la base de données
  const nouveauCitoyen: Citoyen = {
    id: citoyens.length + 1,
    email,
    nom,
    motDePasseHache
  };

  citoyens.push(nouveauCitoyen);

  // 6. Construction explicite de la réponse nettoyée (ReponseCitoyenDTO)
  const reponse: ReponseCitoyenDTO = {
    id: nouveauCitoyen.id,
    email: nouveauCitoyen.email,
    nom: nouveauCitoyen.nom
  };

  // 7. Envoi de la réponse avec le statut 201 Created
  return res.status(201).json(reponse);
});

// DÉMARRAGE DU SERVEUR

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur d'inscription sécurisé démarré sur http://localhost:${PORT}`);
});