import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

interface Defi {
  id: number;
  titre: string;
  points: number;
}

// Ton type parfaitement défini :
type UpdateDefiDTO = Partial<Omit<Defi, "id">>;

// Base de données fictive
const defis: Defi[] = [
  { id: 1, titre: "Prendre le vélo", points: 10 },
  { id: 2, titre: "Repas végétarien", points: 15 }
];

// ROUTE : PUT /defis/:id
app.put('/defis/:id', (req: Request, res: Response) => {
  // 1. Convertir l'ID en number (rappel : req.params.id est TOUJOURS une string !)
  const idCherche = parseInt(req.params.id, 10);

  // 2. Chercher l'index du défi dans le tableau
  const index = defis.findIndex(d => d.id === idCherche);

  // Si l'index vaut -1, le défi n'existe pas -> 404
  if (index === -1) {
    return res.status(404).json({ erreur: "Défi introuvable" });
  }

  // 3. Extraire les champs modifiés du body
  const modifications: UpdateDefiDTO = req.body;

  // 4. Mettre à jour l'objet en fusionnant l'existant avec les modifications
  defis[index] = {
    ...defis[index],
    ...modifications
  };

  // 5. Renvoyer le défi mis à jour avec le code 200 OK
  return res.status(200).json(defis[index]);
});