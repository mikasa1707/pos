import { Injectable } from '@nestjs/common';
import { CreateLivraisonDto } from './dto/create-livraison.dto';
import { UpdateLivraisonDto } from './dto/update-livraison.dto';

@Injectable()
export class LivraisonsService {
  create(createLivraisonDto: CreateLivraisonDto) {
    return 'This action adds a new livraison';
  }

  findAll() {
    return `This action returns all livraisons`;
  }

  findOne(id: number) {
    return `This action returns a #${id} livraison`;
  }

  update(id: number, updateLivraisonDto: UpdateLivraisonDto) {
    return `This action updates a #${id} livraison`;
  }

  remove(id: number) {
    return `This action removes a #${id} livraison`;
  }
}
