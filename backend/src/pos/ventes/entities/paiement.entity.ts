import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Vente } from './vente.entity';
import { ModePaiementDetail } from '../enums/mode-paiement.enum';

@Entity('paiements')
export class Paiement {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Vente, (vente) => vente.paiements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vente_id' })
  vente!: Vente;

  @Column({
    type: 'enum',
    enum: ModePaiementDetail,
    default: ModePaiementDetail.ESPECE,
  })
  mode!: ModePaiementDetail;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montant!: number;

  @Column({ nullable: true })
  reference_transaction?: string;

  @CreateDateColumn()
  created_at!: Date;
}
