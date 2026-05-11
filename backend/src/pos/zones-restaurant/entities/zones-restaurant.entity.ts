import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zones_restaurant')
export class ZoneRestaurant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nom!: string;

  @Column({ default: 0 })
  ordre!: number;

  @Column({ default: true })
  actif!: boolean;
}