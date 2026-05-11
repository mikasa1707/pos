import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommandeRestaurant } from './commandes-restaurant.entity';
import { FicheTechnique } from '../../fiches-techniques/entities/fiches-technique.entity';

export enum StatutCommandeLigne {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_PREPARATION = 'EN_PREPARATION',
  SERVIE = 'SERVIE',
  ANNULEE = 'ANNULEE',
}

@Entity('commande_lignes')
export class CommandeLigne {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => CommandeRestaurant, (commande) => commande.lignes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commande_id' })
  commande!: CommandeRestaurant;

  @ManyToOne(() => FicheTechnique)
  @JoinColumn({ name: 'fiche_technique_id' })
  ficheTechnique!: FicheTechnique;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 1 })
  quantite!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  prix_unitaire!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montant!: number;

  @Column({
    type: 'enum',
    enum: StatutCommandeLigne,
    default: StatutCommandeLigne.EN_ATTENTE,
  })
  statut!: StatutCommandeLigne;

  @Column({ type: 'text', nullable: true })
  commentaire?: string;
}