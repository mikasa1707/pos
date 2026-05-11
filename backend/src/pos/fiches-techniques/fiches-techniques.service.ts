import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { FicheTechnique } from './entities/fiches-technique.entity';

@Injectable()
export class FichesTechniquesService {
  constructor(
    @InjectRepository(FicheTechnique)
    private repo: Repository<FicheTechnique>,
  ) {}

  findAll() {
    return this.repo.find({
      relations: {
        categorie: true,
      },
      where: {
        actif: true,
        vendable: true,
      },
      order: {
        nom: 'ASC',
      },
    });
  }

  search(q: string) {
    return this.repo.find({
      relations: {
        categorie: true,
      },
      where: [
        { reference: Like(`%${q}%`), actif: true, vendable: true },
        { nom: Like(`%${q}%`), actif: true, vendable: true },
      ],
      order: {
        nom: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { id },
      relations: {
        categorie: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Fiche technique introuvable');
    }

    return item;
  }

  async create(body: any) {
    const item = this.repo.create({
      reference: body.reference,
      nom: body.nom,
      description: body.description || null,
      prix_vente: Number(body.prix_vente || 0),
      cout_matiere: Number(body.cout_matiere || 0),
      marge: Number(body.prix_vente || 0) - Number(body.cout_matiere || 0),
      image: body.image || null,
      actif: body.actif ?? true,
      vendable: body.vendable ?? true,
      categorie: body.categorie_id
        ? ({ id: Number(body.categorie_id) } as any)
        : undefined,
    });

    return this.repo.save(item);
  }

  async update(id: number, body: any) {
    const item = await this.repo.findOne({
      where: { id },
      relations: { categorie: true },
    });

    if (!item) {
      throw new NotFoundException('Fiche technique introuvable');
    }

    item.reference = body.reference ?? item.reference;
    item.nom = body.nom ?? item.nom;
    item.description = body.description ?? item.description;
    item.prix_vente =
      body.prix_vente !== undefined ? Number(body.prix_vente) : item.prix_vente;
    item.cout_matiere =
      body.cout_matiere !== undefined
        ? Number(body.cout_matiere)
        : item.cout_matiere;
    item.marge = Number(item.prix_vente) - Number(item.cout_matiere);
    item.image = body.image ?? item.image;
    item.actif = body.actif ?? item.actif;
    item.vendable = body.vendable ?? item.vendable;

    if (body.categorie_id !== undefined) {
      item.categorie = body.categorie_id
        ? ({ id: Number(body.categorie_id) } as any)
        : undefined;
    }

    return this.repo.save(item);
  }
}
