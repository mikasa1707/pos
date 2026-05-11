import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ZoneRestaurant } from '../../zones-restaurant/entities/zones-restaurant.entity';

export enum StatutTable {
  LIBRE = 'LIBRE',
  OCCUPEE = 'OCCUPEE',
  RESERVEE = 'RESERVEE',
  HORS_SERVICE = 'HORS_SERVICE',
}

@Entity('tables_restaurant')
export class TableRestaurant {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ZoneRestaurant, { nullable: true })
  @JoinColumn({ name: 'zone_id' })
  zone?: ZoneRestaurant;

  @Column({ length: 50, unique: true })
  code!: string;

  @Column({ length: 100 })
  nom!: string;

  @Column({ default: 2 })
  capacite!: number;

  @Column({
    type: 'enum',
    enum: StatutTable,
    default: StatutTable.LIBRE,
  })
  statut!: StatutTable;

  @Column({ default: true })
  actif!: boolean;
}