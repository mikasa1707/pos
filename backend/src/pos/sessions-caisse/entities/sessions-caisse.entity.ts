import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Utilisateur } from '../../utilisateurs/entities/utilisateur.entity';
import { PosteCaisse } from './poste-caisse.entity';

export enum StatutSessionCaisse {
  OUVERTE = 'OUVERTE',
  CLOTUREE = 'CLOTUREE',
}

@Entity('sessions_caisse')
export class SessionCaisse {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Utilisateur)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: Utilisateur;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date_ouverture!: Date;

  @Column({ type: 'datetime', nullable: true })
  date_cloture?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fond_caisse!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_ventes!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_espece!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_mvola!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_carte!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_attendu!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montant_reel!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  ecart!: number;

  @Column({
    type: 'enum',
    enum: StatutSessionCaisse,
    default: StatutSessionCaisse.OUVERTE,
  })
  statut!: StatutSessionCaisse;

  @Column({ type: 'text', nullable: true })
  commentaire?: string;

  @ManyToOne(() => PosteCaisse)
  @JoinColumn({ name: 'poste_caisse_id' })
  posteCaisse!: PosteCaisse;

  @Column({ default: false })
  synced_gestion_stock!: boolean;

  @Column({ nullable: true })
  synced_at?: Date;
}
