import express, { Request, Response } from 'express';
 
interface Defi {
  id: number;
  titre: string;
  points: number;
}
 
const app = express();
app.use(express.json());
 
const defis: Defi[] = [
  { id: 1, titre: "Utiliser les transports en commun", points: 50 },
  { id: 2, titre: "Réduire sa consommation de plastique", points: 80 },
];
 
// READ : liste
app.get('/api/defis', (req :Request, res :Response) => {
  if (typeof req.query.min === "string"){
      const min = parseInt(req.query.min, 10);
    if (isNaN(min)) return res.status(400).json({erreur : "min doit être un nombre"});
  
  return res.status(200).json(defis.filter(d => d.points >= min))
  }
})

app.get('/api/sante', (req :Request, res : Response) => {
  return res.status(200).json({statut : "ok"})
});

// READ : un seul
app.get('/api/defis/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ erreur: "Identifiant invalide." });
 
  const defi = defis.find(d => d.id === id);
  if (!defi) return res.status(404).json({ erreur: "Défi introuvable." });
 
  return res.status(200).json(defi);
});
 
// CREATE
app.post('/api/defis', (req: Request, res: Response) => {
  const { titre, points } = req.body;
  const pts = Number(points);
  if (typeof titre !== "string" || titre.trim() === "") {
    return res.status(400).json({ erreur: "Le titre est obligatoire." });
  }
  if (isNaN(pts) || pts < 0) {
    return res.status(400).json({ erreur: "Les points doivent être un nombre positif." });
}

 
  const nouveau: Defi = { id: defis.length + 1, titre : titre, points: Number(points) };
  defis.push(nouveau);
  return res.status(201).json(nouveau);
  });
 
// UPDATE partiel (PATCH)
app.patch('/api/defis/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const defi = defis.find(d => d.id === id);
  if (!defi) return res.status(404).json({ erreur: "Défi introuvable." });
 
  const modifs: Partial<Omit<Defi, "id">> = req.body;
  if (modifs.titre !== undefined) defi.titre = modifs.titre;
  if (modifs.points !== undefined) defi.points = Number(modifs.points);
 
  return res.status(200).json(defi);
});
 
// DELETE
app.delete('/api/defis/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = defis.findIndex(d => d.id === id);
  if (index === -1) return res.status(404).json({ erreur: "Défi introuvable." });
 
  defis.splice(index, 1);
  return res.status(204).send();
});
 
app.listen(3000, () => console.log("Serveur prêt sur http://localhost:3000"));