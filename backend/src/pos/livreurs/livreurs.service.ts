import { Injectable } from '@nestjs/common';
import { CreateLivreurDto } from './dto/create-livreur.dto';
import { UpdateLivreurDto } from './dto/update-livreur.dto';

@Injectable()
export class LivreursService {
  create(createLivreurDto: CreateLivreurDto) {
    return 'This action adds a new livreur';
  }

  findAll() {
    return `This action returns all livreurs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} livreur`;
  }

  update(id: number, updateLivreurDto: UpdateLivreurDto) {
    return `This action updates a #${id} livreur`;
  }

  remove(id: number) {
    return `This action removes a #${id} livreur`;
  }
}
