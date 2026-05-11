import { PartialType } from '@nestjs/mapped-types';
import { CreateZonesRestaurantDto } from './create-zones-restaurant.dto';

export class UpdateZonesRestaurantDto extends PartialType(CreateZonesRestaurantDto) {}
