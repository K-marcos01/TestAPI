type categorie = "FRUIT" | "LEGUME" | "AUTRE";

interface Produit {
    id : number;
    nom : string;
    prix : number;
    enStock : boolean;
    description ? : string;
    categorie : categorie;
}

type ProduitCreation = Omit<Produit, "id">;
type ProduitModification = Partial<Omit<Produit, "id">>;
type ProduitResume = Pick<Produit, "nom" | "prix">;

function trouverProduit (liste: Produit[], id: number) : Produit | undefined {
    return liste.find(p => p.id === id);
}

const Articles : Produit [] = [
    {
        id : 1,
        nom : "pomme",
        prix : 10,
        enStock : true, 
        categorie : "FRUIT"
    },
    {
        id : 2,
        nom : "tomate",
        prix : 15,
        enStock : false, 
        categorie : "FRUIT"
    }
    
]

const cherche = trouverProduit(Articles, 2)