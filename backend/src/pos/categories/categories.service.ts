import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  findAll() {
    return this.repo.find({
      order: { ordre: 'ASC', nom: 'ASC' },
    });
  }

  create(body: Partial<Category>) {
    const item = this.repo.create({
      nom: body.nom,
      code: body.code || body.nom?.toUpperCase().replaceAll(' ', '_'),
      couleur: body.couleur || '#111827',
      icone: body.icone || 'fa-tags',
      ordre: body.ordre || 0,
      actif: body.actif ?? true,
    });

    return this.repo.save(item);
  }

  async update(id: number, body: Partial<Category>) {
    const item = await this.repo.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Catégorie introuvable');
    }

    Object.assign(item, body);

    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.repo.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Catégorie introuvable');
    }

    item.actif = false;

    return this.repo.save(item);
  }
}