import { Injectable } from '@nestjs/common';
import { CreateZonesRestaurantDto } from './dto/create-zones-restaurant.dto';
import { UpdateZonesRestaurantDto } from './dto/update-zones-restaurant.dto';

@Injectable()
export class ZonesRestaurantService {
  create(createZonesRestaurantDto: CreateZonesRestaurantDto) {
    return 'This action adds a new zonesRestaurant';
  }

  findAll() {
    return `This action returns all zonesRestaurant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} zonesRestaurant`;
  }

  update(id: number, updateZonesRestaurantDto: UpdateZonesRestaurantDto) {
    return `This action updates a #${id} zonesRestaurant`;
  }

  remove(id: number) {
    return `This action removes a #${id} zonesRestaurant`;
  }
}
