// 1. IMPORTATIONS & INITIALISATION
// Express est la bibliothèque principale pour créer le serveur web.
// Request et Response sont les types TypeScript fournis par Express pour typer 
// les objets de requête (req) et de réponse (res).
import express, { Request, Response } from 'express';

// On instancie l'application Express dans la variable 'app'
const app = express();

// MIDDLEWARE : Indispensable pour permettre à Express de lire et décoder 
// le corps des requêtes HTTP au format JSON (disponible ensuite via req.body).
// Sans cette ligne, req.body vaudrait 'undefined' lors des requêtes POST/PUT.
app.use(express.json());

// 2. DÉFINITION DES TYPES & INTERFACES (TypeScript)

// L'interface définit le contrat/la structure stricte que doit respecter un objet Badge.
interface Badge {
    id: number;              // Identifiant unique du badge
    titre: string;           // Intitulé du badge (ex: "Éco-citoyen")
    conditionPoints: number; // Nombre de points nécessaires pour débloquer le badge
}

// 3. BASE DE DONNÉES SIMULÉE (In-Memory Data)

// On crée un tableau en mémoire typé 'Badge[]' pour simuler une table de base de données.
const badges: Badge[] = [
    {
        id: 1,
        titre: "Lutte contre le réchauffement",
        conditionPoints: 100,
    },
    {
        id: 2,
        titre: "Maitrise fondamentale",
        conditionPoints: 150
    }
];

// 4. DÉFINITION DES ROUTES DE L'API (Endpoints)

/**
 * ROUTE 1 : GET /badges
 * Objectif : Récupérer l'ensemble de la liste des badges.
 * Code HTTP de succès : 200 OK
 */
app.get('/badges', (req: Request, res: Response) => {
    // res.status(200) définit le code de statut HTTP à 200 (Succès).
    // .json(badges) sérialise le tableau 'badges' en JSON et l'envoie dans le corps de la réponse.
    return res.status(200).json(badges);
});


/**
 * ROUTE 2 : GET /badges/:id
 * Objectif : Récupérer un badge spécifique grâce à son ID passé dans l'URL.
 * Exemple d'appel : GET /badges/2
 * Codes HTTP : 200 OK (trouvé) | 404 Not Found (introuvable)
 */
app.get('/badges/:id', (req: Request, res: Response) => {
    // 1. Extraire le paramètre d'URL (:id).
    // ATTENTION : req.params.id est TOUJOURS une chaîne de caractères (string).
    // On utilise parseInt(..., 10) pour la convertir en nombre entier en base 10.
    const idCherche = parseInt(req.params.id, 10);

    // 2. Recherche du badge dans le tableau à l'aide de la méthode .find() de JavaScript.
    // .find() parcourt le tableau et renvoie le premier élément dont l'id correspond,
    // ou 'undefined' si aucun élément ne correspond.
    const badgeTrouve = badges.find(b => b.id === idCherche);

    // 3. VÉRIFICATION / GESTION D'ERREUR (Gardien) :
    // Si badgeTrouve est 'undefined', cela signifie que l'ID n'existe pas en base.
    if (!badgeTrouve) {
        // On stoppe l'exécution avec 'return' et on renvoie un code 404 (Ressource non trouvée)
        // accompagné d'un message d'erreur clair au format JSON.
        return res.status(404).json({ erreur: "Badge introuvable" });
    }

    // 4. CAS DE SUCCÈS :
    // Si le badge est trouvé, on le renvoie au client avec le code 200 (OK).
    return res.status(200).json(badgeTrouve);
});


/**
 * ROUTE 3 : POST /badges
 * Objectif : Créer et ajouter un nouveau badge dans la liste.
 * Exemple de body reçu : { "titre": "Zéro Déchet", "conditionPoints": 200 }
 * Codes HTTP : 201 Created (créé) | 400 Bad Request (données manquantes/invalides)
 */
app.post('/badges', (req: Request, res: Response) => {
    // 1. DESTRUCTURATION : On extrait 'titre' et 'conditionPoints' directement depuis le corps de la requête (req.body).
    const { titre, conditionPoints } = req.body;

    // 2. VALIDATION DES DONNÉES ENTRANTES :
    // - '!titre' vérifie si le titre est absent, vide ou non renseigné.
    // - 'conditionPoints === undefined' vérifie si la propriété n'a pas été envoyée.
    //   (Remarque : On teste avec '=== undefined' plutôt que '!conditionPoints' au cas où conditionPoints vaudrait 0, 0 étant une valeur falsy en JS).
    if (!titre || conditionPoints === undefined) {
        // Si au moins un champ est manquant, on renvoie une erreur 400 (Bad Request)
        // indiquant au client que sa requête est mal formée.
        return res.status(400).json({ 
            erreur: "Le titre et les conditionPoints sont obligatoires" 
        });
    }

    // 3. CRÉATION DU NOUVEL OBJET :
    // On construit un objet respectant strictement l'interface 'Badge'.
    const nouveauBadge: Badge = {
        // Génération automatique d'un nouvel ID basé sur la taille du tableau
        id: badges.length + 1,
        titre: titre,
        // On s'assure que conditionPoints est bien de type 'number'
        conditionPoints: Number(conditionPoints)
    };

    // 4. PERSISTANCE TEMPORAIRE :
    // On ajoute le nouveau badge à notre tableau en mémoire.
    badges.push(nouveauBadge);

    // 5. RÉPONSE DE SUCCÈS :
    // On renvoie le code 201 (Created) qui signifie qu'une ressource a été créée avec succès,
    // ainsi que l'objet complet qui vient d'être créé (avec son ID généré).
    return res.status(201).json(nouveauBadge);
});

// 5. DÉMARRAGE DU SERVEUR

const PORT = 3000;

// La méthode .listen() lance l'écoute des requêtes HTTP sur le port spécifié.
app.listen(PORT, () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${PORT}`);
});