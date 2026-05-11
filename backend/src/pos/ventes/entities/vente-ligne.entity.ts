import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vente } from './vente.entity';
import { FicheTechnique } from '../../fiches-techniques/entities/fiches-technique.entity';

@Entity('vente_lignes')
export class VenteLigne {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Vente, (vente) => vente.lignes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vente_id' })
  vente!: Vente;

  @ManyToOne(() => FicheTechnique)
  @JoinColumn({ name: 'fiche_technique_id' })
  ficheTechnique!: FicheTechnique;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 1 })
  quantite!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  prix_unitaire!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montant!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cout_matiere!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  marge!: number;
}