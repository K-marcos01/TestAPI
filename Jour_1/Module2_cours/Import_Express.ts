import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// Middleware pour permettre à Express de lire le corps des requêtes en JSON (req.body)
app.use(express.json());

// Base de données fictive en mémoire
const defis = [
  { id: 1, titre: "Prendre le vélo", points: 10 },
  { id: 2, titre: "Repas végétarien", points: 15 }
];

// Route 1 : Récupérer la liste des défis (GET)
app.get('/defis', (req: Request, res: Response) => {
  res.status(200).json(defis);
});

// Route 2 : Créer un nouveau défi (POST)
app.post('/defis', (req: Request, res: Response) => {
  const { titre, points } = req.body;

  // Validation basique des données entrantes
  if (!titre || !points) {
    return res.status(400).json({ message: "Le titre et les points sont obligatoires." });
  }

  const nouveauDefi = {
    id: defis.length + 1,
    titre: titre,
    points: points
  };

  defis.push(nouveauDefi);

  // Renvoie un code 201 avec le défi créé
  return res.status(201).json(nouveauDefi);
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});