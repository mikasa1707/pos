export interface Vente {
  id: number;
  reference: string;
  client: string;
  montant_total: number;
  montant_paye: number;
  rendu: number;
  mode_paiement: string;
  created_at: string;

  lignes: {
    id: number;
    quantite: number;
    prix_unitaire: number;
    montant: number;
    ficheTechnique: {
      nom: string;
    };
  }[];

  paiements: {
    id: number;
    mode: string;
    montant: number;
    reference_transaction?: string;
  }[];
}