import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('postes_caisse')
export class PosteCaisse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  code!: string; // BAR, SDT

  @Column({ length: 100 })
  nom!: string;

  @Column({ default: true })
  actif!: boolean;
}