import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Utilisateur } from './entities/utilisateur.entity';

@Injectable()
export class UtilisateursService {
  constructor(
    @InjectRepository(Utilisateur)
    private repo: Repository<Utilisateur>,
  ) {}

  findAll() {
    return this.repo.find({
      select: ['id', 'nom', 'email', 'role', 'actif'],
      order: { nom: 'ASC' },
    });
  }

  async create(body: any) {
    const hash = await bcrypt.hash(body.mot_de_passe, 10);

    const user = this.repo.create({
      nom: body.nom,
      email: body.email,
      mot_de_passe: hash,
      role: body.role || 'CAISSIER',
      actif: true,
    });

    return this.repo.save(user);
  }

  async update(id: number, body: any) {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    user.nom = body.nom ?? user.nom;
    user.email = body.email ?? user.email;
    user.role = body.role ?? user.role;

    if (body.mot_de_passe) {
      user.mot_de_passe = await bcrypt.hash(body.mot_de_passe, 10);
    }

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    user.actif = false;
    return this.repo.save(user);
  }
}