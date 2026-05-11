import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FicheTechnique } from '../../fiches-techniques/entities/fiches-technique.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nom!: string;

  @Column({ length: 50, unique: true })
  code!: string;

  @Column({ nullable: true })
  couleur!: string;

  @Column({ nullable: true })
  icone!: string;

  @Column({ default: 0 })
  ordre!: number;

  @Column({ default: true })
  actif!: boolean;

  @OneToMany(() => FicheTechnique, (ft) => ft.categorie)
  fiches!: FicheTechnique[];
}