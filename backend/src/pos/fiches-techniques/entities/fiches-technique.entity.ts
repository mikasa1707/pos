import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('fiches_techniques')
export class FicheTechnique {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 100 })
  reference!: string; // 🔥 code produit

  @Column({ length: 150 })
  nom!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  prix_vente!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cout_matiere!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  marge!: number;

  @Column({ nullable: true })
  image!: string;

  @Column({ default: true })
  actif!: boolean;

  @Column({ default: true })
  vendable!: boolean;

  @ManyToOne(() => Category, (cat) => cat.fiches, { nullable: true })
  @JoinColumn({ name: 'categorie_id' })
  categorie!: Category;
}