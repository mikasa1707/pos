import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  CAISSIER = 'CAISSIER',
  RESPONSABLE_CAISSE = 'RESPONSABLE_CAISSE',
}

@Entity('utilisateurs')
export class Utilisateur {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nom!: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ length: 255 })
  mot_de_passe!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CAISSIER,
  })
  role!: UserRole;

  @Column({ default: true })
  actif!: boolean;
}