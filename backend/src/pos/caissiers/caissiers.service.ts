import { Injectable } from '@nestjs/common';
import { CreateCaissierDto } from './dto/create-caissier.dto';
import { UpdateCaissierDto } from './dto/update-caissier.dto';

@Injectable()
export class CaissiersService {
  create(createCaissierDto: CreateCaissierDto) {
    return 'This action adds a new caissier';
  }

  findAll() {
    return `This action returns all caissiers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caissier`;
  }

  update(id: number, updateCaissierDto: UpdateCaissierDto) {
    return `This action updates a #${id} caissier`;
  }

  remove(id: number) {
    return `This action removes a #${id} caissier`;
  }
}
