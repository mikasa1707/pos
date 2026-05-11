import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TableRestaurant } from '../../tables-restaurant/entities/tables-restaurant.entity';
import { SessionCaisse } from '../../sessions-caisse/entities/sessions-caisse.entity';
import { CommandeLigne } from './commandes-lignes.entity';

export enum StatutCommande {
  OUVERTE = 'OUVERTE',
  EN_PREPARATION = 'EN_PREPARATION',
  SERVIE = 'SERVIE',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE',
}

@Entity('commandes_restaurant')
export class CommandeRestaurant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  reference!: string;

  @ManyToOne(() => TableRestaurant, { nullable: true })
  @JoinColumn({ name: 'table_id' })
  table?: TableRestaurant;

  @ManyToOne(() => SessionCaisse)
  @JoinColumn({ name: 'session_caisse_id' })
  sessionCaisse!: SessionCaisse;

  @Column({ nullable: true })
  client?: string;

  @Column({
    type: 'enum',
    enum: StatutCommande,
    default: StatutCommande.OUVERTE,
  })
  statut!: StatutCommande;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montant_total!: number;

  @Column({ type: 'text', nullable: true })
  commentaire?: string;

  @OneToMany(() => CommandeLigne, (ligne) => ligne.commande)
  lignes!: CommandeLigne[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
