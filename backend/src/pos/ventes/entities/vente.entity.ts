import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VenteLigne } from './vente-ligne.entity';
import { Paiement } from './paiement.entity';
import { ModePaiement } from '../enums/mode-paiement.enum';
import { SessionCaisse } from '../../sessions-caisse/entities/sessions-caisse.entity';

// export enum ModePaiement {
//   ESPECE = 'ESPECE',
//   MVOLA = 'MVOLA',
//   CARTE = 'CARTE',
// }

export enum StatutVente {
  VALIDE = 'VALIDE',
  ANNULE = 'ANNULE',
}

@Entity('ventes')
export class Vente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  reference!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @Column({ nullable: true })
  client!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montant_total!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montant_paye!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  rendu!: number;

  @Column({
    type: 'enum',
    enum: ModePaiement,
    default: ModePaiement.ESPECE,
  })
  mode_paiement!: ModePaiement;

  @Column({
    type: 'enum',
    enum: StatutVente,
    default: StatutVente.VALIDE,
  })
  statut!: StatutVente;

  @Column({ type: 'text', nullable: true })
  commentaire!: string;

  @OneToMany(() => VenteLigne, (ligne) => ligne.vente, {
    cascade: true,
  })
  lignes!: VenteLigne[];

  @OneToMany(() => Paiement, (paiement) => paiement.vente, {
    cascade: true,
  })
  paiements!: Paiement[];

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => SessionCaisse, { nullable: true })
  @JoinColumn({ name: 'session_caisse_id' })
  sessionCaisse?: SessionCaisse;
}
