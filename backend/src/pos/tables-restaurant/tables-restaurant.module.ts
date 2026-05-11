import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TablesRestaurantService } from './tables-restaurant.service';
import { TablesRestaurantController } from './tables-restaurant.controller';
import { TableRestaurant } from './entities/tables-restaurant.entity';
import { ZoneRestaurant } from '../zones-restaurant/entities/zones-restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TableRestaurant, ZoneRestaurant])],
  controllers: [TablesRestaurantController],
  providers: [TablesRestaurantService],
})
export class TablesRestaurantModule {}