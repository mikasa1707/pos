// src/pos/tables-restaurant/tables-restaurant.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TableRestaurant } from './entities/tables-restaurant.entity';

@Injectable()
export class TablesRestaurantService {
  constructor(
    @InjectRepository(TableRestaurant)
    private repo: Repository<TableRestaurant>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { actif: true },
      relations: {
        zone: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }
}