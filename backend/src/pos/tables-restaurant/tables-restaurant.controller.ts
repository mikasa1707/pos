// src/pos/tables-restaurant/tables-restaurant.controller.ts

import { Controller, Get } from '@nestjs/common';
import { TablesRestaurantService } from './tables-restaurant.service';

@Controller('pos/tables-restaurant')
export class TablesRestaurantController {
  constructor(private readonly service: TablesRestaurantService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}