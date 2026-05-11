import { PartialType } from '@nestjs/mapped-types';
import { CreateCommandesRestaurantDto } from './create-commandes-restaurant.dto';

export class UpdateCommandesRestaurantDto extends PartialType(CreateCommandesRestaurantDto) {}
