import { Module } from '@nestjs/common';
import { ZonesRestaurantService } from './zones-restaurant.service';
import { ZonesRestaurantController } from './zones-restaurant.controller';

@Module({
  controllers: [ZonesRestaurantController],
  providers: [ZonesRestaurantService],
})
export class ZonesRestaurantModule {}
