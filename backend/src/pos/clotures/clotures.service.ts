import { Injectable } from '@nestjs/common';
import { CreateClotureDto } from './dto/create-cloture.dto';
import { UpdateClotureDto } from './dto/update-cloture.dto';

@Injectable()
export class CloturesService {
  create(createClotureDto: CreateClotureDto) {
    return 'This action adds a new cloture';
  }

  findAll() {
    return `This action returns all clotures`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cloture`;
  }

  update(id: number, updateClotureDto: UpdateClotureDto) {
    return `This action updates a #${id} cloture`;
  }

  remove(id: number) {
    return `This action removes a #${id} cloture`;
  }
}
